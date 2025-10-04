import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/ChatView.css';
import '../styles/components.css';

function ChatView({ boardId, settings, onSelectAgent, onOpenSettings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
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
      const res = await fetch('/api/poe/chat', {
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
      const reply = data.reply || 'No response received.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, ts: new Date().toISOString() }
      ]);
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
            model: {settings?.defaultModel || 'Claude-Sonnet-4.5'} • temp:{' '}
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
