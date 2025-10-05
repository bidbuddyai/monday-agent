const axios = require('axios');

const POE_API_BASE = 'https://api.poe.com/v1';

/**
 * Parse uploaded file using Poe API with intelligent term search
 * @param {Buffer} fileBuffer - File data
 * @param {string} fileName - File name
 * @param {object} boardContext - Board schema and context
 * @param {string} customInstructions - User's custom instructions
 * @param {string} poeApiKey - Poe API key
 * @param {string} model - Model to use
 */
async function parseFile(fileBuffer, fileName, boardContext, customInstructions, poeApiKey, model = 'claude-3-5-sonnet-20241022') {
  try {
    const fileBase64 = fileBuffer.toString('base64');
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    // Determine content type
    const contentTypes = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'txt': 'text/plain',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };

    const contentType = contentTypes[fileExtension] || 'application/octet-stream';

    // Build intelligent parsing prompt
    const parsingPrompt = `You are an intelligent document parser for Monday.com board automation.

**YOUR TASK:**
1. SEARCH the document for relevant terms and information
2. EXTRACT structured data to populate a Monday.com board
3. VALIDATE all values against the board schema
4. RETURN properly formatted JSON

**BOARD SCHEMA:**
${JSON.stringify(boardContext.columns, null, 2)}

**SEARCH STRATEGY:**
First, search the document for these terms and their variations:
- Project name/title
- Client/Owner/Agency
- Bid due dates and times
- Job walk/pre-bid meeting details
- Scope of work
- Required subcontractors
- Deadlines (RFI, questions, etc.)
- Financial information (estimates, bonds)
- Requirements (insurance, wages, etc.)

**EXTRACTION RULES:**
1. For dates/times: Look for patterns like MM/DD/YYYY, Month DD YYYY, HH:MM AM/PM
2. Convert ALL dates/times from Pacific Time (PT/PST/PDT) to UTC (add 7-8 hours)
3. For dropdown fields, use EXACT labels from the board schema
4. For lists (like subs_needed), extract all mentioned items
5. Be intelligent about context - if you see "Due: June 12, 2025 at 11:00 AM", extract both date AND time
6. If a field has multiple values mentioned, choose the most relevant one

**DROPDOWN VALIDATION:**
${boardContext.columns
  .filter(col => col.settings?.labels)
  .map(col => `${col.title}: ${Object.values(col.settings.labels).join(', ')}`)
  .join('\n')}

${customInstructions ? `**CUSTOM INSTRUCTIONS:**\n${customInstructions}\n` : ''}

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with this exact structure:
{
  "item_name": "extracted project name",
  "column_values": {
    "column_id": "value",
    ...
  },
  "confidence": {
    "field_name": 0.0-1.0,
    ...
  },
  "notes": "any important observations or uncertainties",
  "file_summary": "brief 2-3 sentence summary of the document"
}

**IMPORTANT:**
- Use column IDs, not titles
- All dates in ISO 8601 UTC format (YYYY-MM-DDTHH:MM:SSZ)
- Dropdown values must match exactly
- Return confidence scores (0-1) for each extracted field
- If you're unsure about a value, note it and assign lower confidence

Now, analyze this document and extract the information:`;

    // Call Poe API
    const response = await axios.post(
      `${POE_API_BASE}/chat/completions`,
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: parsingPrompt
              },
              {
                type: 'file',
                file: {
                  name: fileName,
                  content_type: contentType,
                  data: fileBase64
                }
              }
            ]
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${poeApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }

    const extractedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Post-process and validate
    const validatedData = validateExtractedData(extractedData, boardContext);

    return {
      success: true,
      data: validatedData,
      raw_response: content,
      model_used: model
    };

  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}

/**
 * Validate extracted data against board schema
 */
function validateExtractedData(data, boardContext) {
  const validated = { ...data };

  // Validate dropdown values
  for (const [columnId, value] of Object.entries(data.column_values || {})) {
    const column = boardContext.columns.find(c => c.id === columnId);
    
    if (column && column.settings?.labels) {
      const validLabels = Object.values(column.settings.labels);
      if (!validLabels.includes(value)) {
        console.warn(`Invalid dropdown value "${value}" for column ${column.title}. Valid options: ${validLabels.join(', ')}`);
        validated.warnings = validated.warnings || [];
        validated.warnings.push({
          column: column.title,
          invalidValue: value,
          validOptions: validLabels
        });
      }
    }
  }

  return validated;
}

module.exports = {
  parseFile,
  validateExtractedData
};
