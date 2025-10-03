const { Router } = require('express');
const router = Router();

// GET /api/board/:boardId/schema
router.get('/:boardId/schema', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { mondayClient } = req.mondayContext;

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

    const response = await mondayClient.query(query, { 
      variables: { boardId: [boardId] } 
    });

    const board = response.data.boards[0];
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Parse column settings
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

    res.json(board);
  } catch (error) {
    console.error('Board schema error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch board schema',
      message: error.message 
    });
  }
});

// GET /api/board/:boardId/items
router.get('/:boardId/items', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { mondayClient } = req.mondayContext;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;

    const query = `
      query ($boardId: [ID!], $limit: Int, $page: Int) {
        boards(ids: $boardId) {
          items_page(limit: $limit, query_params: {page: $page}) {
            cursor
            items {
              id
              name
              group {
                id
                title
              }
              column_values {
                id
                title
                text
                value
              }
              created_at
              updated_at
            }
          }
        }
      }
    `;

    const response = await mondayClient.query(query, {
      variables: { boardId: [boardId], limit, page }
    });

    const itemsPage = response.data.boards[0].items_page;
    
    res.json({
      items: itemsPage.items,
      cursor: itemsPage.cursor,
      page,
      limit
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch items',
      message: error.message 
    });
  }
});

// POST /api/board/items/create
router.post('/items/create', async (req, res) => {
  try {
    const { board_id, group_id, item_name, column_values } = req.body;
    const { mondayClient } = req.mondayContext;

    if (!board_id || !item_name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['board_id', 'item_name']
      });
    }

    const mutation = `
      mutation ($boardId: ID!, $groupId: String, $itemName: String!, $columnValues: JSON) {
        create_item(
          board_id: $boardId
          group_id: $groupId
          item_name: $itemName
          column_values: $columnValues
        ) {
          id
          name
          created_at
        }
      }
    `;

    const response = await mondayClient.query(mutation, {
      variables: {
        boardId: board_id,
        groupId: group_id,
        itemName: item_name,
        columnValues: JSON.stringify(column_values || {})
      }
    });

    res.json({
      success: true,
      item: response.data.create_item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ 
      error: 'Failed to create item',
      message: error.message,
      details: error.response?.data
    });
  }
});

// POST /api/board/items/update
router.post('/items/update', async (req, res) => {
  try {
    const { item_id, column_values } = req.body;
    const { mondayClient } = req.mondayContext;

    if (!item_id || !column_values) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['item_id', 'column_values']
      });
    }

    const mutation = `
      mutation ($itemId: ID!, $columnValues: JSON) {
        change_multiple_column_values(
          item_id: $itemId
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
        itemId: item_id,
        columnValues: JSON.stringify(column_values)
      }
    });

    res.json({
      success: true,
      item: response.data.change_multiple_column_values
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ 
      error: 'Failed to update item',
      message: error.message 
    });
  }
});

// POST /api/board/items/:itemId/files
router.post('/items/:itemId/files', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { column_id, file_url } = req.body;
    const { mondayClient } = req.mondayContext;

    if (!column_id || !file_url) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['column_id', 'file_url']
      });
    }

    const mutation = `
      mutation ($itemId: ID!, $columnId: String!, $fileUrl: String!) {
        add_file_to_column(
          item_id: $itemId
          column_id: $columnId
          file_url: $fileUrl
        ) {
          id
          name
        }
      }
    `;

    const response = await mondayClient.query(mutation, {
      variables: {
        itemId,
        columnId: column_id,
        fileUrl: file_url
      }
    });

    res.json({
      success: true,
      item: response.data.add_file_to_column
    });
  } catch (error) {
    console.error('Add file error:', error);
    res.status(500).json({ 
      error: 'Failed to add file',
      message: error.message 
    });
  }
});

module.exports = router;
