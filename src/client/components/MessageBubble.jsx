import React from 'react';

function MessageBubble({ role, content, timestamp, model, error }) {
  const formatTime = (value) => {
    const date = new Date(value);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message ${role} ${error ? 'error' : ''}`}>
      <div className="message-content">
        {content.split('\n').map((line, index) => {
          const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <p key={index} dangerouslySetInnerHTML={{ __html: boldLine }} />;
        })}
      </div>
      <div className="message-meta">
        <span className="message-time">{formatTime(timestamp)}</span>
        {model && <span className="message-model">{model}</span>}
      </div>
    </div>
  );
}

export default MessageBubble;
