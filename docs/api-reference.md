# API Reference

This document details the internal HTTP endpoints exposed by the Monday AI Assistant server (running on Monday.com's infrastructure). All routes are prefixed with `/api` and require Monday's signing/authentication context.

## Authentication

Routes rely on Monday's built-in authentication via `req.mondayContext`. Ensure requests originate from the Monday client SDK. No additional headers are necessary.

## Poe Endpoints

### GET `/api/poe/models`

Returns the list of available Poe models and identifies the default model.

**Response**
```json
{
  "models": [
    {
      "name": "Claude-Sonnet-4.5",
      "provider": "Anthropic",
      "description": "Best for document parsing and structured data extraction",
      "maxTokens": 8192,
      "supportsVision": true,
      "supportsFunctions": true,
      "default": true
    },
    ...
  ],
  "default": "Claude-Sonnet-4.5"
}
```

### POST `/api/poe/chat`

Sends a chat conversation to the Poe `/chat/completions` API using the stored API key. Automatically injects a system prompt containing board context and available tools.

**Request Body**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "board_context": {
    "board_id": "123",
    "board_name": "Bid Tracker",
    "columns": [
      { "id": "status", "title": "Status", "type": "color", "options": [] }
    ]
  },
  "custom_instructions": "Focus on accuracy"
}
```

**Response**
- `type: "text"` – standard reply with `message`
- `type: "tool_call"` – AI invoked a function; response includes `tool_calls` array and `requires_confirmation: true`

### POST `/api/poe/parse-file`

Downloads a file from Monday (using a temporary URL) and submits it to Poe for structured extraction. Uses intelligent prompts to enforce search-first parsing and schema validation.

**Request Body**
```json
{
  "fileUrl": "https://...",
  "boardContext": {
    "board_id": "123",
    "board_name": "Bid Tracker",
    "columns": [ ... ]
  },
  "message": "Parse this document"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "item_name": "Project Name",
    "column_values": { "status": "Qualified" },
    "confidence": { "project_name": 0.92 },
    "notes": "Any caveats",
    "file_summary": "Short synopsis",
    "warnings": [
      {
        "column": "Role",
        "invalidValue": "Lead",
        "validOptions": ["Prime", "Sub"]
      }
    ]
  },
  "raw_response": "Full Poe output",
  "model_used": "Claude-Sonnet-4.5"
}
```

### POST `/api/poe/execute-tool`

Executes a confirmed function call emitted by the AI. Supports the following functions:

- `create_monday_item`
- `update_monday_item`
- `get_board_schema`
- `search_board_items`

**Request Body**
```json
{
  "tool_call": {
    "function": {
      "name": "create_monday_item",
      "arguments": "{\"board_id\":\"123\",\"item_name\":\"Sample\",\"column_values\":{}}"
    }
  }
}
```

**Response**
Success responses include `action` (created, updated, fetched_schema, searched) and relevant data.

## Board Endpoints

### GET `/api/board/:boardId/schema`

Fetches board metadata including columns, settings, and groups. Used to validate dropdown values.

### GET `/api/board/:boardId/items`

Returns a paginated list of board items (`limit` and `page` query parameters supported). Includes column text values for lightweight search.

### POST `/api/board/items/create`

Creates a new item with optional column values.

**Request Body**
```json
{
  "board_id": "123",
  "group_id": "topics",
  "item_name": "New Bid",
  "column_values": {
    "status": { "label": "In Progress" }
  }
}
```

### POST `/api/board/items/update`

Updates an existing item with new column values. Expects `item_id` and `column_values`.

### POST `/api/board/items/:itemId/files`

Uploads a file to a file column (`column_id`) on an existing item using Monday's `add_file_to_column` mutation.

## Error Handling

- 400 – Missing parameters or invalid model selection.
- 401 – Poe API key invalid or absent.
- 429 – Poe API rate limit exceeded.
- 500 – Unexpected server error (includes message and optional stack in development).

## Rate Limits

The assistant relies on Poe's API rate limits. Handle `429` responses gracefully by informing the user to retry later.

## Security

- Poe API key retrieved via Monday secure storage (`storage.get('POE_API_KEY')`).
- Inputs validated before executing GraphQL mutations.
- File parsing response validated to ensure dropdown values match board schema.

Use this reference to integrate the AI Assistant endpoints with additional Monday features if needed.
