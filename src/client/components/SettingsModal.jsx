import React, { useEffect, useState } from 'react';
import AssistantWizard from './AssistantWizard';
import { API_BASE } from '../config';

export default function SettingsModal({ open, onClose, initial, onSave }) {
  const [poeKey, setPoeKey] = useState(initial?.poeKey || '');
  const [defaultModel, setDefaultModel] = useState(initial?.defaultModel || 'claude-3-5-sonnet-20241022');
  const [selectedAgentId, setSelectedAgentId] = useState(initial?.selectedAgentId || 'bid-assistant');
  const [agents, setAgents] = useState(
    initial?.agents || [
      {
        id: 'bid-assistant',
        name: 'Bid Assistant',
        system: 'You parse construction bid docs and extract key fields...',
        temperature: 0.3
      }
    ]
  );
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  // Load models from API
  useEffect(() => {
    if (!open) return;
    
    const loadModels = async () => {
      try {
        setModelsLoading(true);
        const response = await fetch(`${API_BASE}/api/poe/models`);
        if (response.ok) {
          const data = await response.json();
          setModels(data.models || []);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
        // Fallback to default models if API fails
        setModels([
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
          { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' }
        ]);
      } finally {
        setModelsLoading(false);
      }
    };
    
    loadModels();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPoeKey(initial?.poeKey || '');
    setDefaultModel(initial?.defaultModel || 'claude-3-5-sonnet-20241022');
    setSelectedAgentId(
      initial?.selectedAgentId || initial?.agents?.[0]?.id || 'bid-assistant'
    );
    setAgents(
      initial?.agents?.length
        ? initial.agents
        : [
            {
              id: 'bid-assistant',
              name: 'Bid Assistant',
              system: 'You parse construction bid docs and extract key fields...',
              temperature: 0.3
            }
          ]
    );
  }, [open, initial]);

  if (!open) return null;

  const addAgent = () => {
    const id = `agent-${Math.random().toString(36).slice(2, 8)}`;
    setAgents((prev) => [
      ...prev,
      { id, name: 'New Agent', system: '', temperature: 0.2 }
    ]);
  };

  const handleWizardSave = (agentData) => {
    if (editingAgent) {
      // Update existing agent
      setAgents((prev) => prev.map((a) => (a.id === editingAgent.id ? agentData : a)));
    } else {
      // Add new agent
      setAgents((prev) => [...prev, agentData]);
      setSelectedAgentId(agentData.id);
    }
    setShowWizard(false);
    setEditingAgent(null);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setEditingAgent(null);
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowWizard(true);
  };

  const updateAgent = (id, patch) =>
    setAgents((prev) => prev.map((agent) => (agent.id === id ? { ...agent, ...patch } : agent)));

  const removeAgent = (id) => {
    const nextAgents = agents.filter((agent) => agent.id !== id);
    setAgents(nextAgents);
    if (selectedAgentId === id) {
      setSelectedAgentId(nextAgents[0]?.id || '');
    }
  };

  const handleSave = () => {
    const filteredAgents = agents.filter((agent) => agent.id && agent.name);
    const effectiveSelected =
      filteredAgents.find((agent) => agent.id === selectedAgentId)?.id || filteredAgents[0]?.id || '';
    onSave({
      poeKey,
      defaultModel,
      selectedAgentId: effectiveSelected,
      agents: filteredAgents
    });
  };

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.modal} onClick={(event) => event.stopPropagation()}>
        <h3>Settings</h3>
        <div style={S.row}>
          <label>POE API Key</label>
          <input
            type="password"
            value={poeKey}
            onChange={(event) => setPoeKey(event.target.value)}
            placeholder="sk-..."
            style={S.input}
          />
        </div>
        <div style={S.row}>
          <label>Default Model</label>
          <select
            value={defaultModel}
            onChange={(event) => setDefaultModel(event.target.value)}
            style={S.input}
            disabled={modelsLoading}
          >
            {modelsLoading ? (
              <option value="">Loading models...</option>
            ) : (
              models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))
            )}
          </select>
        </div>
        <div style={S.row}>
          <label>Active Agent</label>
          <select
            value={selectedAgentId}
            onChange={(event) => setSelectedAgentId(event.target.value)}
            style={S.input}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ margin: '12px 0' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={() => setShowWizard(true)} style={S.primary} type="button">
              🧙 Create Assistant Wizard
            </button>
            <button onClick={addAgent} style={S.secondary} type="button">
              + Quick Add Agent
            </button>
          </div>
          <div
            style={{
              marginTop: 8,
              maxHeight: 240,
              overflow: 'auto',
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 8
            }}
          >
            {agents.map((agent) => (
              <div
                key={agent.id}
                style={{ borderBottom: '1px dashed #eee', paddingBottom: 8, marginBottom: 8 }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={agent.name}
                    onChange={(event) => updateAgent(agent.id, { name: event.target.value })}
                    style={S.input}
                  />
                  <button
                    onClick={() => handleEditAgent(agent)}
                    style={S.secondary}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeAgent(agent.id)}
                    style={S.danger}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="System prompt"
                  value={agent.system}
                  onChange={(event) => updateAgent(agent.id, { system: event.target.value })}
                  style={{ ...S.input, resize: 'vertical' }}
                />
                <div>
                  <label>Temperature</label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={agent.temperature}
                    onChange={(event) =>
                      updateAgent(agent.id, { temperature: Number(event.target.value) })
                    }
                    style={{ ...S.input, width: 120 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={S.secondary} type="button">
            Cancel
          </button>
          <button onClick={handleSave} style={S.primary} type="button">
            Save
          </button>
        </div>
      </div>

      {showWizard && (
        <AssistantWizard
          initialData={editingAgent}
          availableModels={models}
          onSave={handleWizardSave}
          onCancel={handleWizardCancel}
        />
      )}
    </div>
  );
}

const S = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.35)',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    width: 720,
    maxWidth: '92vw',
    padding: 16,
    boxShadow: '0 12px 40px rgba(0,0,0,.2)'
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    margin: '10px 0'
  },
  input: {
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: 8,
    width: '100%'
  },
  primary: {
    background: '#1f76ff',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  secondary: {
    background: '#f2f4f7',
    border: '1px solid #d0d5dd',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  danger: {
    background: '#ffe5e5',
    border: '1px solid #ffb3b3',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer'
  }
};
