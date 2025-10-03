// Monday.com Function/Tool Definitions for AI
const MONDAY_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_monday_item',
      description: 'Create a new item on a Monday.com board with specified column values. Always validate dropdown values against the board schema first.',
      parameters: {
        type: 'object',
        properties: {
          board_id: {
            type: 'string',
            description: 'The ID of the Monday.com board'
          },
          group_id: {
            type: 'string',
            description: 'The group/section ID to create the item in (optional, defaults to first group)'
          },
          item_name: {
            type: 'string',
            description: 'The name/title of the item to create'
          },
          column_values: {
            type: 'object',
            description: 'Object with column IDs as keys and their values. For dropdowns, use exact label text. For dates, use ISO 8601 UTC format.',
            additionalProperties: true
          }
        },
        required: ['board_id', 'item_name', 'column_values']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_monday_item',
      description: 'Update an existing Monday.com item with new column values',
      parameters: {
        type: 'object',
        properties: {
          item_id: {
            type: 'string',
            description: 'The ID of the item to update'
          },
          column_values: {
            type: 'object',
            description: 'Column values to update (same format as create)',
            additionalProperties: true
          }
        },
        required: ['item_id', 'column_values']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_board_schema',
      description: 'Fetch the current board schema including all columns, their types, dropdown options, and available groups. ALWAYS call this before creating or updating items to validate values.',
      parameters: {
        type: 'object',
        properties: {
          board_id: {
            type: 'string',
            description: 'The board ID to fetch schema for'
          }
        },
        required: ['board_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_board_items',
      description: 'Search for items on a board by name or column values',
      parameters: {
        type: 'object',
        properties: {
          board_id: {
            type: 'string',
            description: 'The board ID to search'
          },
          query: {
            type: 'string',
            description: 'Search query (item name or column value)'
          }
        },
        required: ['board_id', 'query']
      }
    }
  }
];

module.exports = { MONDAY_TOOLS };
