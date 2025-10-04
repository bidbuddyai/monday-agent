import React, { useState } from 'react';

const MODELS = [
  {
    name: 'Claude-Sonnet-4.5',
    provider: 'Anthropic',
    description: 'Balanced default for high-quality chats',
    icon: '🔷',
    recommended: true
  },
  {
    name: 'Claude-Opus-4.1',
    provider: 'Anthropic',
    description: 'Most capable Claude model available',
    icon: '🔷'
  },
  {
    name: 'Claude-Sonnet-3.5',
    provider: 'Anthropic',
    description: 'Reliable general-purpose assistant',
    icon: '🔷'
  },
  {
    name: 'Claude-Haiku-3.5',
    provider: 'Anthropic',
    description: 'Fast lightweight option for quick tasks',
    icon: '🔷'
  },
  {
    name: 'Claude-Opus-4-Reasoning',
    provider: 'Anthropic',
    description: 'Enhanced reasoning-focused Claude',
    icon: '🧠'
  },
  {
    name: 'Claude-Sonnet-4-Reasoning',
    provider: 'Anthropic',
    description: 'Reasoning-tuned Sonnet variant',
    icon: '🧠'
  },
  {
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Advanced flagship GPT model',
    icon: '🟢'
  },
  {
    name: 'GPT-5-Mini',
    provider: 'OpenAI',
    description: 'Faster GPT-5 with lower cost',
    icon: '🟢'
  },
  {
    name: 'GPT-5-Nano',
    provider: 'OpenAI',
    description: 'Ultra-efficient GPT-5 variant',
    icon: '🟢'
  },
  {
    name: 'GPT-G-Codex',
    provider: 'OpenAI',
    description: 'Optimized for code generation',
    icon: '💻'
  },
  {
    name: 'Gemini-2.5-Pro',
    provider: 'Google',
    description: 'Premium multimodal Gemini model',
    icon: '🔶'
  },
  {
    name: 'Gemini-2.5-Flash',
    provider: 'Google',
    description: 'Speed-focused Gemini for production',
    icon: '⚡'
  },
  {
    name: 'Gemini-2.5-Flash-Lite',
    provider: 'Google',
    description: 'Cost-efficient Gemini flash tier',
    icon: '⚡'
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
