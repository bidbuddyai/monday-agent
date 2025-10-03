import React, { useState } from 'react';
import ModelPicker from './ModelPicker';
import '../styles/SettingsView.css';
import '../styles/components.css';

function SettingsView({ settings, onSave, boardData }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localSettings);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const addKnowledgeFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalSettings(prev => ({
          ...prev,
          knowledgeFiles: [
            ...(prev.knowledgeFiles || []),
            {
              name: file.name,
              content: e.target.result,
              uploaded: new Date().toISOString()
            }
          ]
        }));
      };
      reader.readAsText(file);
    }
  };

  const removeKnowledgeFile = (index) => {
    setLocalSettings(prev => ({
      ...prev,
      knowledgeFiles: (prev.knowledgeFiles || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="settings-view">
      <h2>⚙️ Settings</h2>

      <section className="settings-section">
        <h3>🤖 AI Model Configuration</h3>
        
        <ModelPicker
          value={localSettings.model || 'Claude-Sonnet-4.5'}
          onChange={(model) => setLocalSettings(prev => ({ ...prev, model }))}
        />

        <div className="help-box">
          <strong>💡 Model Recommendations:</strong>
          <ul>
            <li><strong>Claude-Sonnet-4.5:</strong> Best for document parsing and data extraction</li>
            <li><strong>GPT-5:</strong> Advanced reasoning for complex tasks</li>
            <li><strong>Gemini-2.5-Pro:</strong> Excellent multimodal understanding</li>
          </ul>
        </div>
      </section>

      <section className="settings-section">
        <h3>🔑 Poe API Key</h3>
        <div className="api-key-input">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={localSettings.poeApiKey || ''}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, poeApiKey: e.target.value }))}
            placeholder="Enter your Poe API key"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="btn-toggle-key"
          >
            {showApiKey ? '🙈' : '👁️'}
          </button>
        </div>
        <p className="help-text">
          Get your API key from{' '}
          <a href="https://poe.com/api_key" target="_blank" rel="noopener noreferrer">
            poe.com/api_key
          </a>
        </p>
      </section>

      <section className="settings-section">
        <h3>📝 Custom Instructions</h3>
        <textarea
          value={localSettings.customInstructions || ''}
          onChange={(e) => setLocalSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
          placeholder="Add custom instructions for how the AI should behave..."
          rows={8}
        />
        <p className="help-text">
          Provide custom instructions to guide the AI assistant&apos;s behavior and document parsing strategy.
        </p>
      </section>

      <section className="settings-section">
        <h3>📚 Knowledge Files</h3>
        <p className="help-text">
          Upload files containing custom knowledge, mappings, or instructions for document parsing
        </p>

        <div className="knowledge-files-list">
          {(localSettings.knowledgeFiles || []).map((file, idx) => (
            <div key={idx} className="knowledge-file-item">
              <span className="file-icon">📄</span>
              <div className="file-info">
                <strong>{file.name}</strong>
                <span className="file-date">
                  {new Date(file.uploaded).toLocaleDateString()}
                </span>
              </div>
              <button 
                onClick={() => removeKnowledgeFile(idx)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <label className="btn-upload">
          + Add Knowledge File
          <input
            type="file"
            onChange={addKnowledgeFile}
            style={{ display: 'none' }}
            accept=".txt,.md,.json"
          />
        </label>
      </section>

      <section className="settings-section">
        <h3>📊 Board Schema</h3>
        <p className="help-text">Current board columns (read-only reference for AI)</p>
        <div className="board-schema">
          {boardData?.columns?.map(col => (
            <div key={col.id} className="column-info">
              <div className="column-header">
                <strong>{col.title}</strong>
                <span className="column-type">{col.type}</span>
              </div>
              <div className="column-id">ID: {col.id}</div>
              {col.settings?.labels && (
                <div className="column-options">
                  <strong>Options:</strong>
                  <div className="options-list">
                    {Object.entries(col.settings.labels).map(([key, label]) => (
                      <span key={key} className="option-badge">{label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <button
        className="btn-save"
        onClick={handleSave}
        disabled={isSaving}
        type="button"
      >
        {isSaving ? '✓ Saved!' : '💾 Save Settings'}
      </button>
    </div>
  );
}

export default SettingsView;
