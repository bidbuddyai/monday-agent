import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import mondaySdk from 'monday-sdk-js';
import '../styles/ChatView.css';
import '../styles/components.css';

const monday = mondaySdk();

function ChatView({ context, boardData, settings, onRefreshBoard }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI assistant for the "${boardData.name}" board. I'm powered by ${settings.model}.\n\nI can help you:\n\n• Parse bid documents and extract data\n• Create and update board items\n• Search for relevant information in files\n• Manage board operations\n\nHow can I help you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !uploadedFile) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    if (uploadedFile) {
      userMessage.content += ` 📎 [Attached: ${uploadedFile.name}]`;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;

      // If file is uploaded, use file parsing endpoint
      if (uploadedFile) {
        // First, upload file to Monday.com to get URL
        const uploadRes = await monday.api(`
          mutation ($file: File!) {
            add_file_to_update(file: $file) {
              id
              url
            }
          }
        `, {
          variables: { file: uploadedFile }
        });

        const fileUrl = uploadRes.data.add_file_to_update.url;

        // Parse file with AI
        response = await axios.post('/api/poe/parse-file', {
          fileUrl,
          boardContext: {
            board_id: boardData.id,
            board_name: boardData.name,
            columns: boardData.columns,
            group_id: boardData.groups[0]?.id
          },
          message: input.trim() || 'Parse this document and extract relevant information'
        });

        setUploadedFile(null);

        if (response.data.success) {
          const extracted = response.data.data;
          
          // Create pending action for user confirmation
          setPendingAction({
            type: 'create_item',
            data: {
              board_id: boardData.id,
              group_id: extracted.group_id || boardData.groups[0]?.id,
              item_name: extracted.item_name,
              column_values: extracted.column_values
            },
            metadata: {
              confidence: extracted.confidence,
              notes: extracted.notes,
              summary: extracted.file_summary
            }
          });

          const aiMessage = {
            role: 'assistant',
            content: `I've analyzed the document. Here's what I found:\n\n${extracted.file_summary || 'Document parsed successfully.'}\n\n**Extracted Data:**\n- Item Name: ${extracted.item_name}\n${extracted.notes ? `\n**Notes:** ${extracted.notes}\n` : ''}\n\n⚠️ **Please review and confirm** the action below.`,
            timestamp: new Date().toISOString()
          };

          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Regular chat message
        const boardContext = {
          board_id: boardData.id,
          board_name: boardData.name,
          columns: boardData.columns.map(col => ({
            id: col.id,
            title: col.title,
            type: col.type,
            options: col.settings?.labels ? Object.values(col.settings.labels) : []
          }))
        };

        response = await axios.post('/api/poe/chat', {
          messages: messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content.replace(/📎.*$/, '').trim() // Remove file attachment text
          })),
          board_context: boardContext,
          custom_instructions: settings.customInstructions
        });

        const assistantMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString(),
          model: response.data.model_used
        };

        // Check if response contains tool call
        if (response.data.type === 'tool_call') {
          setPendingAction({
            type: 'tool_call',
            tool_calls: response.data.tool_calls
          });
        }

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = '❌ Sorry, I encountered an error. ';
      
      if (error.response?.status === 401) {
        errorMessage += 'Please check your Poe API key in Settings.';
      } else if (error.response?.status === 429) {
        errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setIsLoading(true);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '⏳ Executing action...',
      timestamp: new Date().toISOString()
    }]);

    try {
      let result;

      if (pendingAction.type === 'create_item') {
        result = await axios.post('/api/board/items/create', pendingAction.data);

        setMessages(prev => [...prev.slice(0, -1), {
          role: 'assistant',
          content: `✅ Successfully created item: **${pendingAction.data.item_name}**`,
          timestamp: new Date().toISOString()
        }]);
      } else if (pendingAction.type === 'tool_call') {
        const toolCall = pendingAction.tool_calls[0];
        result = await axios.post('/api/poe/execute-tool', { tool_call: toolCall });

        setMessages(prev => [...prev.slice(0, -1), {
          role: 'assistant',
          content: `✅ ${result.data.message}`,
          timestamp: new Date().toISOString()
        }]);
      }

      setPendingAction(null);
      onRefreshBoard();
      
      monday.execute('notice', {
        message: 'Action completed successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Action execution error:', error);
      
      setMessages(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        content: `❌ Failed to execute action: ${error.response?.data?.message || error.message}`,
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '❌ Action cancelled.',
      timestamp: new Date().toISOString()
    }]);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        monday.execute('notice', {
          message: 'File too large. Maximum size is 25MB.',
          type: 'error'
        });
        return;
      }

      setUploadedFile(file);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-view">
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role} ${msg.error ? 'error' : ''}`}>
            <div className="message-content">
              {msg.content.split('\n').map((line, i) => {
                // Render markdown-style formatting
                const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }} />;
              })}
            </div>
            <div className="message-meta">
              <span className="message-time">{formatTime(msg.timestamp)}</span>
              {msg.model && <span className="message-model">{msg.model}</span>}
            </div>
          </div>
        ))}

        {pendingAction && (
          <div className="action-confirmation">
            <h3>📋 Confirm Action</h3>
            
            {pendingAction.metadata && (
              <>
                {pendingAction.metadata.summary && (
                  <p className="action-summary">{pendingAction.metadata.summary}</p>
                )}
                {pendingAction.metadata.confidence && (
                  <div className="confidence-scores">
                    <strong>Confidence Scores:</strong>
                    {Object.entries(pendingAction.metadata.confidence).map(([field, score]) => (
                      <div key={field} className="confidence-item">
                        <span>{field}</span>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ width: `${score * 100}%` }}
                          />
                        </div>
                        <span>{(score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            <pre className="action-payload">
              {JSON.stringify(pendingAction.data || pendingAction.tool_calls[0], null, 2)}
            </pre>
            
            <div className="action-buttons">
              <button
                className="btn-confirm"
                onClick={handleConfirmAction}
                disabled={isLoading}
              >
                ✓ Confirm & Execute
              </button>
              <button
                className="btn-cancel"
                onClick={handleCancelAction}
                disabled={isLoading}
              >
                ✗ Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        {uploadedFile && (
          <div className="file-preview">
            <span className="file-icon">
              {uploadedFile.type.includes('pdf') ? '📄' : 
               uploadedFile.type.includes('image') ? '🖼️' :
               uploadedFile.type.includes('word') ? '📝' : '📎'}
            </span>
            <span className="file-name">{uploadedFile.name}</span>
            <span className="file-size">
              {(uploadedFile.size / 1024).toFixed(1)} KB
            </span>
            <button 
              className="file-remove" 
              onClick={() => setUploadedFile(null)}
              type="button"
            >
              ✗
            </button>
          </div>
        )}

        <div className="input-row">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.jpg,.jpeg,.png"
          />
          <button
            className="btn-file"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            type="button"
            title="Upload file"
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={uploadedFile ? 'Add a message (optional)...' : 'Type your message...'}
            disabled={isLoading}
            className="message-input"
          />
          <button
            className="btn-send"
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !uploadedFile)}
            type="button"
          >
            {isLoading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
