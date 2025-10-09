import React, { useEffect, useMemo, useRef, useState } from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import '../styles/ChatView.css';
import '../styles/components.css';
import { API_BASE } from '../config';

function ChatView({ boardId, settings, onSelectAgent, onOpenSettings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [pendingToolCall, setPendingToolCall] = useState(null);
  const [executingTool, setExecutingTool] = useState(false);
  const bottomRef = useRef(null);

  const agents = settings?.agents?.length ? settings.agents : [
    {
      id: 'bid-assistant',
      name: 'Bid Assistant',
      system: 'You parse construction bid docs and extract key fields...',
      temperature: 0.3
    }
  ];

  const activeAgent = useMemo(() => {
    const match = agents.find((agent) => agent.id === settings?.selectedAgentId);
    return match || agents[0];
  }, [agents, settings?.selectedAgentId]);

  useEffect(() => {
    const intro = activeAgent
      ? `Hi! I'm ${activeAgent.name}. ${activeAgent.system || 'How can I help you today?'}`
      : 'Hi! How can I help you today?';
    setMessages([
      {
        role: 'assistant',
        content: intro,
        ts: new Date().toISOString()
      }
    ]);
  }, [activeAgent?.id, activeAgent?.name, activeAgent?.system]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeAgent) return;
    setError(null);

    const userMessage = { role: 'user', content: trimmed, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/poe/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          message: trimmed,
          agentId: activeAgent.id
        })
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      
      // Check if response is a tool call
      if (data.type === 'tool_call' && data.toolCalls && data.toolCalls.length > 0) {
        const toolCall = data.toolCalls[0];
        const reply = data.reply || 'I can help you with that. Please confirm the action below.';
        
        // Add assistant's message explaining what it wants to do
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reply, ts: new Date().toISOString() }
        ]);

        // Set pending tool call for confirmation
        setPendingToolCall({
          toolCall: toolCall,
          summary: reply,
          payload: toolCall.arguments,
          confidence: toolCall.confidence
        });
      } else {
        // Regular assistant response
        const reply = data.reply || 'No response received.';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reply, ts: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error('Chat send failed', err);
      const message = err.message.includes('Poe API key')
        ? 'Please add your Poe API key in Settings.'
        : err.message;
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${message}`,
          ts: new Date().toISOString(),
          error: true
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmToolCall = async () => {
    if (!pendingToolCall) return;

    setExecutingTool(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/poe/execute-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolCall: pendingToolCall.toolCall,
          boardId: boardId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute tool');
      }

      // Add success message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✓ Successfully updated item: ${data.result || 'Update complete'}`,
        ts: new Date().toISOString()
      }]);

      setPendingToolCall(null);
    } catch (err) {
      console.error('Tool execution error:', err);
      const errorMsg = `Failed to execute action: ${err.message}`;
      setError(errorMsg);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✗ Error: ${err.message}`,
        ts: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setExecutingTool(false);
    }
  };

  const handleCancelToolCall = () => {
    // Add cancellation message to chat
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '✗ Action cancelled by user',
      ts: new Date().toISOString()
    }]);
    setPendingToolCall(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-view" style={{ flex: 1 }}>
      <div className="chat-header">
        <div>
          <div className="chat-agent-name">{activeAgent?.name || 'Assistant'}</div>
          <div className="chat-agent-meta">
            model: {settings?.defaultModel || 'Claude-Sonnet-4'} • temp:{' '}
            {(activeAgent?.temperature ?? 0.3).toFixed(1)}
          </div>
        </div>
        <div className="chat-controls">
          <select
            value={activeAgent?.id || ''}
            onChange={(event) => onSelectAgent(event.target.value)}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={onOpenSettings}>
            Settings
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={`${msg.ts}-${idx}`} className={`message ${msg.role} ${msg.error ? 'error' : ''}`}>
            <div className="message-content">
              {msg.content.split('\n').map((line, lineIdx) => (
                <p key={lineIdx}>{line}</p>
              ))}
            </div>
            <div className="message-meta">
              <span className="message-time">
                {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {idx === 0 && activeAgent?.system && (
                <span className="message-model">system</span>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="message assistant">
            <div className="message-content typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="chat-error-banner">{error}</div>}

      {/* Tool Call Confirmation Dialog */}
      {pendingToolCall && (
        <ConfirmationDialog
          action={pendingToolCall}
          onConfirm={handleConfirmToolCall}
          onCancel={handleCancelToolCall}
          disabled={executingTool}
        />
      )}

      <div className="input-container">
        <div className="input-row">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeAgent?.system || 'Send a message...'}
            disabled={isSending}
            rows={3}
          />
          <button
            className="btn-send"
            type="button"
            onClick={handleSend}
            disabled={isSending || !input.trim()}
          >
            {isSending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
