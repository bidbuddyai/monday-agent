const express = require('express');
const axios = require('axios');
const { parseFile: poeParseFile } = require('../services/fileParser');
const { normalizeColumns } = require('../utils/helpers');

const router = express.Router();

const DEFAULT_MODEL = 'Claude-Sonnet-4';
const DEFAULT_AGENT = {
  id: 'bid-assistant',
  name: 'Bid Assistant',
  system: 'You parse bid docs and extract key fields for project teams.',
  temperature: 0.3
};

const POE_MODELS = [
  {
    id: 'Claude-Sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Most capable Claude model for complex reasoning and document analysis',
    maxTokens: 200000,
    supportsVision: true,
    supportsFunctions: true,
    default: true
  },
  {
    id: 'Claude-Opus-4.1',
    name: 'Claude Opus 4.1',
    provider: 'Anthropic',
    description: 'Highest quality Claude model for complex analysis',
    maxTokens: 200000,
    supportsVision: true,
    supportsFunctions: true
  },
  {
    id: 'GPT-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Latest GPT-4 model with multimodal capabilities',
    maxTokens: 128000,
    supportsVision: true,
    supportsFunctions: true
  },
  {
    id: 'GPT-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'OpenAI\'s latest flagship model',
    maxTokens: 128000,
    supportsVision: true,
    supportsFunctions: true
  },
  {
    id: 'Gemini-2.5-Pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Google\'s most capable model for complex reasoning',
    maxTokens: 2000000,
    supportsVision: true,
    supportsFunctions: true
  },
  {
    id: 'Gemini-2.5-Flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Fast Gemini model optimized for speed',
    maxTokens: 1000000,
    supportsVision: true,
    supportsFunctions: true
  },
  {
    id: 'Llama-3.1-405B',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    description: 'Meta\'s largest open-source model',
    maxTokens: 128000,
    supportsVision: false,
    supportsFunctions: true
  },
  {
    id: 'Grok-4',
    name: 'Grok 4',
    provider: 'xAI',
    description: 'xAI\'s latest model',
    maxTokens: 128000,
    supportsVision: true,
    supportsFunctions: true
  }
];

const SETTINGS_BY_BOARD = new Map();
const ACTION_LOG = new Map();

const getBoardId = (req) => String(req.query.boardId || req.body?.boardId || 'global');
const getSettings = (boardId) => SETTINGS_BY_BOARD.get(boardId) || null;
const setSettings = (boardId, settings) => SETTINGS_BY_BOARD.set(boardId, settings);
const logAction = (boardId, entry) => {
  const list = ACTION_LOG.get(boardId) || [];
  list.unshift({ ts: new Date().toISOString(), ...entry });
  ACTION_LOG.set(boardId, list.slice(0, 50));
};

const buildAxiosError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    };
  }
  if (error.request) {
    return { request: true, message: error.message };
  }
  return { message: error.message };
};

const ensureMondayClient = (req) => {
  if (!req?.mondayContext?.mondayClient) {
    throw Object.assign(new Error('Monday client unavailable'), { statusCode: 503 });
  }
  return req.mondayContext.mondayClient;
};

router.get('/models', (_req, res) => {
  res.json({
    models: POE_MODELS,
    default: DEFAULT_MODEL
  });
});

router.get('/settings', (req, res) => {
  const boardId = getBoardId(req);
  res.json(getSettings(boardId) || null);
});

router.get('/feed', (req, res) => {
  const boardId = getBoardId(req);
  const actions = ACTION_LOG.get(boardId) || [];
  res.json({ items: actions.slice(0, 20) });
});

router.post('/settings', (req, res) => {
  const boardId = getBoardId(req);
  const { settings } = req.body || {};
  if (!settings) {
    return res.status(400).json({ error: 'Missing settings' });
  }

  const next = {
    poeKey: settings.poeKey || '',
    defaultModel: settings.defaultModel || DEFAULT_MODEL,
    selectedAgentId: settings.selectedAgentId || DEFAULT_AGENT.id,
    agents: Array.isArray(settings.agents) && settings.agents.length ? settings.agents : [DEFAULT_AGENT]
  };

  setSettings(boardId, next);
  res.json({ ok: true });
});

router.post('/chat', async (req, res) => {
  try {
    const boardId = getBoardId(req);
    const saved = getSettings(boardId) || {};
    
    // Get POE API key from secure storage or user settings
    let poeKey = saved.poeKey;
    if (!poeKey && global.getSecret) {
      poeKey = await global.getSecret('POE_API_KEY');
    }
    if (!poeKey) {
      poeKey = process.env.POE_API_KEY;
    }
    
    if (!poeKey) {
      return res.status(400).json({ 
        error: 'Missing Poe API key. Please set your API key in Settings or configure POE_API_KEY secret.' 
      });
    }

    const userMessage = String(req.body?.message || '').trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const model = saved.defaultModel || DEFAULT_MODEL;
    const agentId = req.body?.agentId || saved.selectedAgentId || DEFAULT_AGENT.id;
    const agent = (saved.agents || []).find((item) => item.id === agentId) || DEFAULT_AGENT;

    // Use Poe's OpenAI-compatible API endpoint
    const response = await axios.post(
      'https://api.poe.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: agent.system || DEFAULT_AGENT.system },
          { role: 'user', content: userMessage }
        ],
        temperature: agent.temperature ?? DEFAULT_AGENT.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${poeKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60_000
      }
    );

    const choice = response.data?.choices?.[0] || {};
    const reply = choice?.message?.content ?? '';
    const isToolCall = Array.isArray(choice?.message?.tool_calls) && choice.message.tool_calls.length > 0;

    res.json({
      ok: true,
      reply: reply || 'No response from model.',
      type: isToolCall ? 'tool_call' : 'text',
      choice
    });
  } catch (error) {
    const errMeta = buildAxiosError(error);
    console.error('Poe chat error - Full details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    const status = errMeta.status || 500;
    const message = errMeta.data?.error || error.message || 'Internal error';
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: message,
      detail: errMeta.data || errMeta.message,
      debugInfo: {
        endpoint: 'https://api.poe.com/v1/query',
        hasApiKey: !!poeKey,
        model: model || 'unknown'
      }
    });
  }
});

router.post('/parse-file', async (req, res) => {
  try {
    const boardId = getBoardId(req);
    const saved = getSettings(boardId) || {};
    
    // Get POE API key from secure storage or user settings
    let poeKey = saved.poeKey;
    if (!poeKey && global.getSecret) {
      poeKey = await global.getSecret('POE_API_KEY');
    }
    if (!poeKey) {
      poeKey = process.env.POE_API_KEY;
    }
    
    if (!poeKey) {
      return res.status(400).json({ 
        error: 'Missing Poe API key. Please set your API key in Settings or configure POE_API_KEY secret.' 
      });
    }

    const { fileUrl, fileName, boardContext = {}, message = '' } = req.body || {};
    if (!fileUrl) {
      return res.status(400).json({ error: 'Missing fileUrl' });
    }

    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 120_000
    });

    const buffer = Buffer.from(response.data);
    const resolvedFileName = fileName || fileUrl.split('?')[0].split('/').pop() || 'document';
    const agentId = saved.selectedAgentId || DEFAULT_AGENT.id;
    const agent = (saved.agents || []).find((item) => item.id === agentId) || DEFAULT_AGENT;

    const mergedContext = {
      ...boardContext,
      columns: normalizeColumns(boardContext.columns || [])
    };

    const instructions = [agent.system, message].filter(Boolean).join('\n\n');

    const result = await poeParseFile(
      buffer,
      resolvedFileName,
      mergedContext,
      instructions,
      poeKey,
      saved.defaultModel || DEFAULT_MODEL
    );

    logAction(boardId, {
      type: 'parse',
      itemId: result?.data?.item_name || null,
      note: `Parsed ${resolvedFileName}`
    });

    res.json(result);
  } catch (error) {
    const errMeta = buildAxiosError(error);
    console.error('Poe parse-file error:', errMeta);
    const status = errMeta.status || 500;
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: 'Failed to parse file',
      detail: errMeta.data || errMeta.message || error.message
    });
  }
});

router.post('/execute-tool', async (req, res) => {
  try {
    const boardId = getBoardId(req);
    const toolCall = req.body?.tool_call || req.body?.toolCall;
    if (!toolCall?.function?.name) {
      return res.status(400).json({ error: 'Missing tool call data' });
    }

    const mondayClient = ensureMondayClient(req);
    const functionName = toolCall.function.name;
    const rawArgs = toolCall.function.arguments;
    let args = {};

    if (typeof rawArgs === 'string' && rawArgs.trim()) {
      try {
        args = JSON.parse(rawArgs);
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid tool arguments', detail: parseError.message });
      }
    } else if (typeof rawArgs === 'object' && rawArgs !== null) {
      args = rawArgs;
    }

    let payload;
    let action;

    switch (functionName) {
      case 'create_monday_item': {
        const boardIdArg = args.board_id || args.boardId;
        const itemName = args.item_name || args.itemName;
        if (!boardIdArg || !itemName) {
          return res.status(400).json({ error: 'Missing board_id or item_name' });
        }

        const mutation = `
          mutation ($boardId: ID!, $groupId: String, $itemName: String!, $columnValues: JSON) {
            create_item(
              board_id: $boardId,
              group_id: $groupId,
              item_name: $itemName,
              column_values: $columnValues
            ) {
              id
              name
              group { id title }
            }
          }
        `;

        const variables = {
          boardId: boardIdArg,
          groupId: args.group_id || args.groupId || null,
          itemName,
          columnValues: JSON.stringify(args.column_values || args.columnValues || {})
        };

        const response = await mondayClient.query(mutation, { variables });
        payload = response.data.create_item;
        action = 'created';
        logAction(boardId, { type: 'create', itemId: payload?.id || null, note: `Created item ${payload?.name || ''}` });
        break;
      }
      case 'update_monday_item': {
        const itemId = args.item_id || args.itemId;
        const columnValues = args.column_values || args.columnValues;
        if (!itemId || !columnValues) {
          return res.status(400).json({ error: 'Missing item_id or column_values' });
        }

        const mutation = `
          mutation ($itemId: ID!, $columnValues: JSON) {
            change_multiple_column_values(
              item_id: $itemId,
              column_values: $columnValues
            ) {
              id
              name
              updated_at
            }
          }
        `;

        const response = await mondayClient.query(mutation, {
          variables: {
            itemId,
            columnValues: JSON.stringify(columnValues)
          }
        });
        payload = response.data.change_multiple_column_values;
        action = 'updated';
        logAction(boardId, { type: 'update', itemId, note: 'Updated column values' });
        break;
      }
      case 'get_board_schema': {
        const boardIdArg = args.board_id || args.boardId || boardId;
        if (!boardIdArg) {
          return res.status(400).json({ error: 'Missing board_id' });
        }

        const query = `
          query ($boardId: [ID!]) {
            boards(ids: $boardId) {
              id
              name
              description
              columns {
                id
                title
                type
                settings_str
              }
              groups {
                id
                title
                color
              }
            }
          }
        `;

        const response = await mondayClient.query(query, { variables: { boardId: [boardIdArg] } });
        const board = response.data?.boards?.[0];
        if (!board) {
          return res.status(404).json({ error: 'Board not found' });
        }
        board.columns = normalizeColumns(board.columns || []);
        payload = board;
        action = 'fetched_schema';
        break;
      }
      case 'search_board_items': {
        const boardIdArg = args.board_id || args.boardId || boardId;
        if (!boardIdArg) {
          return res.status(400).json({ error: 'Missing board_id' });
        }
        const search = args.query || args.search || args.search_term || '';
        const limit = Math.min(Number(args.limit) || 20, 100);

        const query = `
          query ($boardId: [ID!], $limit: Int, $search: String) {
            boards(ids: $boardId) {
              items_page(limit: $limit, query_params: { search: $search }) {
                items {
                  id
                  name
                  column_values {
                    id
                    text
                  }
                  group { id title }
                }
              }
            }
          }
        `;

        const response = await mondayClient.query(query, {
          variables: {
            boardId: [boardIdArg],
            limit,
            search
          }
        });
        payload = response.data?.boards?.[0]?.items_page?.items || [];
        action = 'searched';
        break;
      }
      default:
        return res.status(400).json({ error: `Unsupported tool function: ${functionName}` });
    }

    res.json({ success: true, action, result: payload });
  } catch (error) {
    const status = error.statusCode || error.response?.status || 500;
    console.error('Execute tool error:', error.response?.data || error);
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: 'Failed to execute tool',
      message: error.message,
      detail: error.response?.data
    });
  }
});

router.get('/feed', (req, res) => {
  const boardId = getBoardId(req);
  res.json({ items: ACTION_LOG.get(boardId) || [] });
});

module.exports = router;
