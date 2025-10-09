# Tool Call Confirmation Integration

## Overview
The ChatView component now supports AI-driven tool calls with user confirmation before execution. When the AI suggests updating a Monday board item, the user will see a confirmation dialog showing the proposed changes before they are applied.

## Implementation Details

### Updated Files

#### 1. `ChatView.jsx`
Added the following functionality:

**New State Variables:**
- `pendingToolCall`: Stores the tool call waiting for user confirmation
- `executingTool`: Tracks whether a tool is currently being executed

**New Functions:**
- `handleConfirmToolCall()`: Executes the tool call when user confirms
- `handleCancelToolCall()`: Cancels the tool call and adds a cancellation message

**Enhanced Chat Response Handling:**
The `handleSend()` function now detects when the backend returns a tool call:
```javascript
if (data.type === 'tool_call' && data.toolCalls && data.toolCalls.length > 0) {
  // Show confirmation dialog
  setPendingToolCall({
    toolCall: toolCall,
    summary: reply,
    payload: toolCall.arguments,
    confidence: toolCall.confidence
  });
}
```

**Confirmation Dialog Integration:**
The dialog is conditionally rendered when `pendingToolCall` is set:
```jsx
{pendingToolCall && (
  <ConfirmationDialog
    action={pendingToolCall}
    onConfirm={handleConfirmToolCall}
    onCancel={handleCancelToolCall}
    disabled={executingTool}
  />
)}
```

### User Flow

1. **User sends a message** requesting to update a Monday item
   - Example: "Set the status to In Progress and add a note saying 'Started today'"

2. **Backend analyzes the request** and returns a tool call response:
   ```json
   {
     "type": "tool_call",
     "reply": "I'll update the item status and add that note for you.",
     "toolCalls": [{
       "function": "update_monday_item",
       "arguments": {
         "itemId": "123456",
         "columnUpdates": {
           "status": "In Progress",
           "notes": "Started today"
         }
       },
       "confidence": {
         "status": 0.95,
         "notes": 0.90
       }
     }]
   }
   ```

3. **Confirmation dialog appears** showing:
   - Summary of what the AI wants to do
   - Confidence scores for each field (visual progress bars)
   - JSON payload preview
   - Confirm and Cancel buttons

4. **User confirms or cancels:**
   - **Confirm**: Client calls `/api/poe/execute-tool` with the tool call data
   - **Cancel**: Dialog closes and cancellation message appears in chat

5. **Execution result displayed:**
   - **Success**: "✓ Successfully updated item: [result]"
   - **Error**: "✗ Error: [error message]"

## API Integration

### Execute Tool Endpoint
**URL:** `POST /api/poe/execute-tool`

**Request Body:**
```json
{
  "toolCall": {
    "function": "update_monday_item",
    "arguments": { ... }
  },
  "boardId": "123456789"
}
```

**Success Response:**
```json
{
  "success": true,
  "result": "Updated 2 columns"
}
```

**Error Response:**
```json
{
  "error": "Failed to update item: Invalid column ID"
}
```

## Testing

### Manual Testing Steps

1. **Start the app** and navigate to a board view
2. **Send a chat message** like:
   - "Update the status column to Done"
   - "Set priority to High and add a note 'Urgent task'"
3. **Verify the confirmation dialog appears** with:
   - Clear summary of the action
   - Confidence scores (if available)
   - JSON payload showing the exact changes
4. **Test confirmation flow:**
   - Click "✓ Confirm & Execute" and verify success message
   - Try canceling and verify cancellation message
5. **Test error handling:**
   - Try updating a non-existent column
   - Verify error message appears in chat

### Backend Testing
Use the `test-app.html` file to test the backend independently:

```html
<!-- Test tool call response -->
<script>
  fetch('http://localhost:8080/api/poe/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      boardId: 'your-board-id',
      message: 'Set status to Done',
      agentId: 'bid-assistant'
    })
  })
  .then(r => r.json())
  .then(data => console.log('Response:', data));
</script>
```

## UI/UX Features

### Confirmation Dialog
- **Visual Design**: Yellow/orange warning background to indicate action required
- **Confidence Scores**: Color-coded progress bars (red → orange → green)
- **JSON Preview**: Monospace font with syntax highlighting
- **Responsive Buttons**: Hover effects and disabled states

### Chat Messages
- **System Messages**: Special styling for tool execution results
- **Error Messages**: Red styling with error icon (✗)
- **Success Messages**: Green styling with checkmark icon (✓)

### Loading States
- **During Execution**: Confirm button shows disabled state
- **Chat Loading**: Typing indicator shown during AI response
- **Scroll Behavior**: Auto-scrolls to show new messages

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing item or board context" | No boardId provided | Ensure ChatView receives boardId prop |
| "Failed to execute tool" | Backend API error | Check server logs, verify API endpoint |
| "Invalid column ID" | Column doesn't exist on board | Verify column IDs match Monday board schema |
| No confirmation dialog appears | Backend not returning tool_call type | Check backend response format |

### Debug Tips

1. **Check console logs** for tool execution errors
2. **Verify API_BASE** is pointing to correct server URL
3. **Inspect network requests** in browser DevTools
4. **Test backend independently** using test-app.html

## Future Enhancements

Possible improvements to consider:

1. **Batch Tool Calls**: Support multiple tool calls in one confirmation
2. **Undo Functionality**: Allow reverting recent tool executions
3. **Tool Call History**: Show history of executed actions
4. **Advanced Confirmation**: Allow editing tool call parameters before executing
5. **Keyboard Shortcuts**: ESC to cancel, Enter to confirm
6. **Mobile Optimization**: Better touch targets for mobile users

## Related Files

- `src/client/components/ChatView.jsx` - Main chat component
- `src/client/components/ConfirmationDialog.jsx` - Confirmation UI
- `src/client/styles/ChatView.css` - Styling for chat and dialog
- `src/server/routes/poe.js` - Backend API endpoints
- `test-app.html` - Standalone testing page

## Configuration

No additional configuration is required. The feature works with existing:
- POE_API_KEY environment variable
- Monday API token (from context)
- Board and item IDs (from props/context)
