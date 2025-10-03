const { Router } = require('express');
const axios = require('axios');
const { MONDAY_TOOLS } = require('../config/tools');
const { POE_MODELS, DEFAULT_MODEL } = require('../config/models');
const { parseFile } = require('../services/fileParser');

const router = Router();
const POE_API_BASE = 'https://api.poe.com/v1';

// Get Poe API key from Monday secure storage
async function getPoeApiKey(req) {
  const { storage } = req.mondayContext;
  const apiKey = await storage.get('POE_API_KEY');
  return apiKey;
}

// GET /api/poe/models - List available models
router.get('/models', (req, res) => {
  res.json({
    models: Object.values(POE_MODELS),
    default: DEFAULT_MODEL
  });
});

// POST /api/poe/chat - Chat with AI
router.post('/chat', async (req, res) => {
  try {
    const { messages, board_context, custom_instructions } = req.body;
    const poeApiKey = await getPoeApiKey(req);

    if (!poeApiKey) {
      return res.status(400).json({ 
        error: 'Poe API key not configured',
        message: 'Please add your Poe API key in Settings'
      });
    }

    // Get model from settings
    const { storage } = req.mondayContext;
    const settings = await storage.get('app_settings');
    const model = settings?.model || DEFAULT_MODEL;

    // Verify model exists
    if (!POE_MODELS[model]) {
      return res.status(400).json({
        error: 'Invalid model',
        message: `Model ${model} not found. Available models: ${Object.keys(POE_MODELS).join(', ')}`
      });
    }

    // Build system message with board context
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant embedded in Monday.com boards.

**Board Information:**
- Board ID: ${board_context.board_id}
- Board Name: ${board_context.board_name}
- Columns: ${JSON.stringify(board_context.columns.map(c => ({
  id: c.id,
  title: c.title,
  type: c.type,
  options: c.settings?.labels ? Object.values(c.settings.labels) : []
})), null, 2)}

${custom_instructions ? `**Custom Instructions:**\n${custom_instructions}\n\n` : ''}

**Your Capabilities:**
1. Chat naturally with users about their board
2. Parse uploaded documents intelligently
3. Extract structured data using term search
4. Create and update board items using function calls
5. Validate all data against board schema

**Important Rules:**
- ALWAYS validate dropdown values against board options
- Convert Pacific Time to UTC (add 7-8 hours depending on DST)
- Use function calls to interact with Monday.com
- Ask for user confirmation before executing actions
- Search documents intelligently for relevant terms before extraction
- Provide confidence scores for extracted data

**Available Functions:**
${MONDAY_TOOLS.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}

Be helpful, accurate, and always validate data before actions.`
    };

    // Prepare messages for API
    const apiMessages = [systemMessage, ...messages];

    // Call Poe API (OpenAI-compatible)
    const response = await axios.post(
      `${POE_API_BASE}/chat/completions`,
      {
        model: model,
        messages: apiMessages,
        tools: MONDAY_TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: POE_MODELS[model].maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${poeApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      }
    );

    const assistantMessage = response.data.choices[0].message;

    // Check for function/tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      return res.json({
        type: 'tool_call',
        message: assistantMessage.content || 'I can help with that. Here\'s what I propose:',
        tool_calls: assistantMessage.tool_calls,
        requires_confirmation: true,
        model_used: model
      });
    }

    // Regular text response
    res.json({
      type: 'text',
      message: assistantMessage.content,
      model_used: model
    });

  } catch (error) {
    console.error('Poe chat error:', error.response?.data || error);
    
    // Handle specific errors
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid Poe API key',
        message: 'Please check your API key in Settings'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait and try again.'
      });
    }

    res.status(500).json({ 
      error: 'AI request failed',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// POST /api/poe/parse-file - Parse uploaded file
router.post('/parse-file', async (req, res) => {
  try {
    const { fileUrl, boardContext, message } = req.body;
    const poeApiKey = await getPoeApiKey(req);

    if (!poeApiKey) {
      return res.status(400).json({ 
        error: 'Poe API key not configured'
      });
    }

    // Get settings
    const { storage } = req.mondayContext;
    const settings = await storage.get('app_settings');
    const model = settings?.model || DEFAULT_MODEL;
    const customInstructions = settings?.customInstructions || '';

    // Download file from Monday
    const fileResponse = await axios.get(fileUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const fileBuffer = Buffer.from(fileResponse.data);
    const fileName = fileUrl.split('/').pop();

    // Parse file using intelligent service
    const result = await parseFile(
      fileBuffer,
      fileName,
      boardContext,
      customInstructions,
      poeApiKey,
      model
    );

    res.json(result);

  } catch (error) {
    console.error('File parse error:', error);
    res.status(500).json({ 
      error: 'File parsing failed',
      message: error.message
    });
  }
});

// POST /api/poe/execute-tool - Execute confirmed tool/function call
router.post('/execute-tool', async (req, res) => {
  try {
    const { tool_call } = req.body;
    const { mondayClient } = req.mondayContext;

    const functionName = tool_call.function.name;
    const args = JSON.parse(tool_call.function.arguments);

    let result;

    switch (functionName) {
      case 'create_monday_item':
        const createMutation = `
          mutation ($boardId: ID!, $groupId: String, $itemName: String!, $columnValues: JSON) {
            create_item(
              board_id: $boardId
              group_id: $groupId
              item_name: $itemName
              column_values: $columnValues
            ) {
              id
              name
            }
          }
        `;
        
        result = await mondayClient.query(createMutation, {
          variables: {
            boardId: args.board_id,
            groupId: args.group_id,
            itemName: args.item_name,
            columnValues: JSON.stringify(args.column_values)
          }
        });
        
        return res.json({
          success: true,
          action: 'created',
          message: `Successfully created item: ${args.item_name}`,
          data: result.data.create_item
        });

      case 'update_monday_item':
        const updateMutation = `
          mutation ($itemId: ID!, $columnValues: JSON) {
            change_multiple_column_values(
              item_id: $itemId
              column_values: $columnValues
            ) {
              id
              name
            }
          }
        `;
        
        result = await mondayClient.query(updateMutation, {
          variables: {
            itemId: args.item_id,
            columnValues: JSON.stringify(args.column_values)
          }
        });
        
        return res.json({
          success: true,
          action: 'updated',
          message: 'Successfully updated item',
          data: result.data.change_multiple_column_values
        });

      case 'get_board_schema':
        const schemaQuery = `
          query ($boardId: [ID!]) {
            boards(ids: $boardId) {
              id
              name
              columns {
                id
                title
                type
                settings_str
              }
              groups {
                id
                title
              }
            }
          }
        `;
        
        result = await mondayClient.query(schemaQuery, {
          variables: { boardId: [args.board_id] }
        });

        const board = result.data.boards[0];
        board.columns = board.columns.map(col => {
          if (col.settings_str) {
            try {
              col.settings = JSON.parse(col.settings_str);
            } catch (e) {
              col.settings = {};
            }
          }
          delete col.settings_str;
          return col;
        });
        
        return res.json({
          success: true,
          action: 'fetched_schema',
          data: board
        });

      case 'search_board_items':
        const searchQuery = `
          query ($boardId: [ID!]) {
            boards(ids: $boardId) {
              items_page(limit: 100) {
                items {
                  id
                  name
                  column_values {
                    id
                    text
                  }
                }
              }
            }
          }
        `;
        
        result = await mondayClient.query(searchQuery, {
          variables: { boardId: [args.board_id] }
        });

        const items = result.data.boards[0].items_page.items;
        const searchTerm = args.query.toLowerCase();
        
        const filtered = items.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.column_values.some(cv => 
            cv.text?.toLowerCase().includes(searchTerm)
          )
        );
        
        return res.json({
          success: true,
          action: 'searched',
          data: filtered,
          count: filtered.length
        });

      default:
        return res.status(400).json({ 
          error: 'Unknown function',
          function: functionName 
        });
    }

  } catch (error) {
    console.error('Tool execution error:', error);
    res.status(500).json({ 
      error: 'Failed to execute action',
      message: error.message,
      details: error.response?.data
    });
  }
});

module.exports = router;
