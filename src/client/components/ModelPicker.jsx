import React, { useState, useEffect } from 'react';

const MODELS = [
  {
    name: 'Claude-Sonnet-4.5',
    provider: 'Anthropic',
    description: 'Best for document parsing',
    icon: '🔷',
    recommended: true
  },
  {
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Advanced reasoning',
    icon: '🟢'
  },
  {
    name: 'GPT-5-Mini',
    provider: 'OpenAI',
    description: 'Fast and efficient',
    icon: '🟢'
  },
  {
    name: 'Gemini-2.5-Pro',
    provider: 'Google',
    description: 'Multimodal analysis',
    icon: '🔶'
  },
  {
    name: 'Claude-Opus-4',
    provider: 'Anthropic',
    description: 'Most capable reasoning',
    icon: '🔷'
  },
  {
    name: 'Llama-3.3-70B',
    provider: 'Meta',
    description: 'Open-source alternative',
    icon: '🦙'
  }
];

function ModelPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = MODELS.find(m => m.name === value) || MODELS[0];

  return (
    <div className="model-picker">
      <label>AI Model</label>
      <div className="model-dropdown">
        <button
          className="model-selector"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <div className="model-info">
            <span className="model-icon">{selectedModel.icon}</span>
            <div className="model-details">
              <span className="model-name">
                {selectedModel.name}
                {selectedModel.recommended && (
                  <span className="recommended-badge">Recommended</span>
                )}
              </span>
              <span className="model-provider">
                {selectedModel.provider} • {selectedModel.description}
              </span>
            </div>
          </div>
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="model-options">
            {MODELS.map(model => (
              <button
                key={model.name}
                className={`model-option ${model.name === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(model.name);
                  setIsOpen(false);
                }}
                type="button"
              >
                <span className="model-icon">{model.icon}</span>
                <div className="model-details">
                  <span className="model-name">
                    {model.name}
                    {model.recommended && (
                      <span className="recommended-badge">⭐</span>
                    )}
                  </span>
                  <span className="model-meta">
                    {model.provider} • {model.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelPicker;
