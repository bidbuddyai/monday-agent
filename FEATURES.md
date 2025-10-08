# Poe AI Assistant Features

## ✅ Complete Feature List

### 1. AI Chat with Tool Calling ✨
The AI can **automatically interact with Monday.com boards** using function calling.

**What it can do:**
- Create new board items
- Update existing items
- Search for items
- Get board schema (columns, types, dropdown options)
- Use board context to make intelligent decisions

**How it works:**
```javascript
// When you chat, the AI has access to these tools:
- create_monday_item(board_id, item_name, column_values)
- update_monday_item(item_id, column_values)
- get_board_schema(board_id)
- search_board_items(board_id, query)
```

**Example:**
```
User: "Create a new bid for ABC Construction with due date next Friday"

AI: [Calls get_board_schema to see columns]
    [Calls create_monday_item with proper values]
    "✓ Created new item 'ABC Construction Bid' with due date 2025-10-15"
```

---

### 2. Custom Instructions (like ChatGPT Custom GPTs) 📝

Add custom instructions to your AI agent per board.

**API Endpoints:**
```bash
# Get current knowledge base
GET /api/poe/knowledge?agentId=bid-assistant

# Set custom instructions
POST /api/poe/knowledge
{
  "agentId": "bid-assistant",
  "instructions": "Always check for conflicts before creating items. Use formal language."
}
```

**Example Instructions:**
```
- Always verify bid amounts are numeric
- Check for duplicate project names before creating
- Use ISO date format for all dates
- Include client contact info in the notes column
- Tag items with appropriate priority levels
```

---

### 3. Knowledge Base Files 📚

Upload reference documents that the AI can use (like Custom GPT knowledge files).

**API Endpoints:**
```bash
# Upload a knowledge file
POST /api/poe/knowledge/file
{
  "agentId": "bid-assistant",
  "name": "Bid Process Guide.txt",
  "content": "Step 1: Review requirements...",
  "type": "text"
}

# Delete a knowledge file
DELETE /api/poe/knowledge/file/:fileId?agentId=bid-assistant
```

**Example Use Cases:**
- Company bidding procedures
- Column naming conventions
- Client abbreviations/codes
- Template responses
- Compliance requirements

**How the AI uses it:**
The knowledge base content is automatically added to the system prompt, so the AI has access to it in every conversation.

---

### 4. Multiple AI Models 🤖

Switch between different AI models from multiple providers:

**Available Models:**
- `Claude-Sonnet-4` (Anthropic) - Most capable, best for complex analysis
- `Claude-Opus-4.1` (Anthropic) - Highest quality
- `GPT-4o` (OpenAI) - Latest GPT with vision
- `GPT-5` (OpenAI) - OpenAI's flagship
- `Gemini-2.5-Pro` (Google) - 2M token context
- `Gemini-2.5-Flash` (Google) - Fast processing
- `Llama-3.1-405B` (Meta) - Open source
- `Grok-4` (xAI) - Latest from xAI

Change via settings or API.

---

### 5. Document Parsing 📄

Upload documents (PDFs, Word, images) and extract structured data.

**API:**
```bash
POST /api/poe/parse-file
{
  "fileUrl": "https://...",
  "fileName": "RFP-2024-001.pdf",
  "boardContext": {
    "boardId": "123456",
    "columns": [...]
  },
  "message": "Extract project details and deadlines"
}
```

**Supported Formats:**
- PDF documents
- Word documents (.docx)
- Images (with vision models)
- Text files

---

### 6. Custom Agents/Assistants 👤

Create multiple specialized agents with different personalities and expertise.

**Example Agents:**
```javascript
{
  id: "bid-assistant",
  name: "Bid Assistant",
  system: "You parse bid docs and extract key fields",
  temperature: 0.3  // More deterministic
}

{
  id: "project-manager",
  name: "Project Manager",
  system: "You help manage construction projects and timelines",
  temperature: 0.7  // More creative
}
```

Each agent can have its own:
- Custom instructions
- Knowledge base files
- Temperature settings
- System prompt

---

### 7. Board-Specific Settings ⚙️

Settings are stored per-board, so different boards can have different configurations.

**Settings include:**
- Default AI model
- Selected agent
- Custom agents list
- API key (optional, overrides global)

---

### 8. Activity Feed 📊

Track all AI actions on your boards.

**API:**
```bash
GET /api/poe/feed?boardId=123456
```

**Tracks:**
- Items created
- Items updated
- Files parsed
- Timestamps

---

## 🚀 Usage Examples

### Example 1: Chat with Tool Use

```bash
curl -X POST https://your-app.monday.app/api/poe/chat \
  -H "Content-Type: application/json" \
  -H "x-monday-token: YOUR_TOKEN" \
  -d '{
    "message": "Create a new bid item for Tesla Project with amount $50,000",
    "boardId": "123456",
    "enableTools": true,
    "boardContext": {
      "boardId": "123456",
      "boardName": "Bids 2025"
    }
  }'
```

**Response:**
```json
{
  "ok": true,
  "reply": "I'll create that bid item for you.",
  "type": "tool_call",
  "toolCalls": [{
    "function": {
      "name": "create_monday_item",
      "arguments": "{\"board_id\":\"123456\",\"item_name\":\"Tesla Project\",\"column_values\":{\"amount\":\"50000\"}}"
    }
  }],
  "hasTools": true
}
```

### Example 2: Add Custom Instructions

```bash
curl -X POST https://your-app.monday.app/api/poe/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "bid-assistant",
    "boardId": "123456",
    "instructions": "Always convert amounts to USD. Check for duplicate project names. Use these client codes: TSLA=Tesla, AAPL=Apple, MSFT=Microsoft"
  }'
```

### Example 3: Upload Knowledge File

```bash
curl -X POST https://your-app.monday.app/api/poe/knowledge/file \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "bid-assistant",
    "boardId": "123456",
    "name": "Client Codes.txt",
    "content": "TSLA - Tesla Inc\\nAAPL - Apple Inc\\nMSFT - Microsoft Corp",
    "type": "text"
  }'
```

---

## 🔑 Required Configuration

### 1. Environment Variables (Monday Code)
```bash
POE_API_KEY=your_poe_api_key_from_poe.com
```

### 2. Monday App Permissions
- `boards:read` - Read board data
- `boards:write` - Create/update items
- `storage:read` - Read secure storage
- `storage:write` - Write secure storage

### 3. Monday Client Token
Pass via `x-monday-token` header or configure `MONDAY_API_TOKEN` env var.

---

## 📦 Deployment URL

Your app is deployed at:
```
https://e51eb-service-23730086-e8794d3f.us.monday.app
```

### Available Endpoints:
- `GET /health` - Health check
- `GET /api/poe/models` - List AI models
- `GET /api/poe/test` - Test Poe API
- `POST /api/poe/chat` - Chat with AI (with tool calling)
- `POST /api/poe/parse-file` - Parse documents
- `GET /api/poe/settings` - Get board settings
- `POST /api/poe/settings` - Save board settings
- `GET /api/poe/feed` - Activity feed
- `GET /api/poe/knowledge` - Get knowledge base
- `POST /api/poe/knowledge` - Set custom instructions
- `POST /api/poe/knowledge/file` - Upload knowledge file
- `DELETE /api/poe/knowledge/file/:id` - Delete knowledge file
- `POST /api/poe/execute-tool` - Execute Monday tool calls

---

## 🎯 Next Steps

1. **Test tool calling** - Try creating items via chat
2. **Add custom instructions** - Configure your agent's behavior
3. **Upload knowledge files** - Add company-specific information
4. **Configure the frontend** - Update client to use new features
5. **Test in Monday board** - Add the app view and try it out

---

## 🐛 Debugging

**Check logs:**
```bash
npx @mondaycom/apps-cli code:logs -i 11406704 -z us
```

**Test endpoint:**
```bash
curl https://your-app.monday.app/api/poe/test
```

**Check environment:**
```bash
curl https://your-app.monday.app/debug/env
```
