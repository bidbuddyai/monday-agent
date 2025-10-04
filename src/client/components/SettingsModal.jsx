import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_MODEL = 'claude-sonnet-4.7';
const DEFAULT_AGENT = {
  id: 'bid-assistant',
  name: 'Bid Assistant',
  system: 'You parse construction bid docs and extract key fields...',
  temperature: 0.3,
  knowledgeFileIds: []
};

const sanitizeAgents = (agents) => {
  const source = Array.isArray(agents) && agents.length ? agents : [DEFAULT_AGENT];
  return source.map((agent, index) => {
    const temperature = Number(agent?.temperature);
    return {
      id: agent?.id || (index === 0 ? DEFAULT_AGENT.id : `agent-${index + 1}`),
      name: agent?.name || (index === 0 ? DEFAULT_AGENT.name : `Agent ${index + 1}`),
      system: agent?.system || '',
      temperature: Number.isFinite(temperature) ? temperature : DEFAULT_AGENT.temperature,
      knowledgeFileIds: Array.isArray(agent?.knowledgeFileIds) ? agent.knowledgeFileIds : []
    };
  });
};

export default function SettingsModal({ open, boardId, onClose, initial, onSave }) {
  const [poeKey, setPoeKey] = useState(initial?.poeKey || '');
  const [defaultModel, setDefaultModel] = useState(initial?.defaultModel || DEFAULT_MODEL);
  const [selectedAgentId, setSelectedAgentId] = useState(
    initial?.selectedAgentId || DEFAULT_AGENT.id
  );
  const [agents, setAgents] = useState(() => sanitizeAgents(initial?.agents));

  const [knowledgeFiles, setKnowledgeFiles] = useState([]);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const boardQuery = useMemo(() => (boardId ? `?boardId=${boardId}` : ''), [boardId]);

  useEffect(() => {
    if (!open) return;
    setPoeKey(initial?.poeKey || '');
    setDefaultModel(initial?.defaultModel || DEFAULT_MODEL);
    const sanitizedAgents = sanitizeAgents(initial?.agents);
    setAgents(sanitizedAgents);
    setSelectedAgentId(
      initial?.selectedAgentId || sanitizedAgents[0]?.id || DEFAULT_AGENT.id
    );
  }, [open, initial]);

  const fetchKnowledge = async () => {
    try {
      setIsKnowledgeLoading(true);
      setKnowledgeError(null);
      const res = await fetch(`/api/poe/knowledge${boardQuery}`);
      if (!res.ok) throw new Error(`Failed to load knowledge (${res.status})`);
      const data = await res.json();
      const files = Array.isArray(data?.files) ? data.files : [];
      setKnowledgeFiles(files);
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          knowledgeFileIds: (agent.knowledgeFileIds || []).filter((id) =>
            files.some((file) => file.id === id)
          )
        }))
      );
    } catch (err) {
      console.error('Failed to fetch knowledge', err);
      setKnowledgeError(err.message);
    } finally {
      setIsKnowledgeLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchKnowledge();
  }, [open, boardQuery]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setKnowledgeError(null);
      const formData = new FormData();
      formData.append('file', file);
      if (boardId) {
        formData.append('boardId', boardId);
      }
      const res = await fetch(`/api/poe/knowledge/upload${boardQuery}`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || `Upload failed (${res.status})`);
      }
      await fetchKnowledge();
    } catch (err) {
      console.error('Knowledge upload failed', err);
      setKnowledgeError(err.message);
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDeleteKnowledge = async (fileId) => {
    try {
      const res = await fetch(`/api/poe/knowledge/${fileId}${boardQuery}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`Failed to delete file (${res.status})`);
      setKnowledgeFiles((prev) => prev.filter((file) => file.id !== fileId));
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          knowledgeFileIds: (agent.knowledgeFileIds || []).filter((id) => id !== fileId)
        }))
      );
    } catch (err) {
      console.error('Delete knowledge failed', err);
      setKnowledgeError(err.message);
    }
  };

  if (!open) return null;

  const addAgent = () => {
    const id = `agent-${Math.random().toString(36).slice(2, 8)}`;
    setAgents((prev) => [
      ...prev,
      { id, name: 'New Agent', system: '', temperature: 0.2, knowledgeFileIds: [] }
    ]);
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

  const handleKnowledgeSelect = (agentId, event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    updateAgent(agentId, { knowledgeFileIds: selected });
  };

  const handleSave = () => {
    const filteredAgents = agents
      .filter((agent) => agent.id && agent.name)
      .map((agent) => ({
        ...agent,
        temperature: Number.isFinite(Number(agent.temperature))
          ? Number(agent.temperature)
          : DEFAULT_AGENT.temperature,
        knowledgeFileIds: Array.from(
          new Set((agent.knowledgeFileIds || []).filter((id) => id && typeof id === 'string'))
        )
      }));

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
          >
            <option value="claude-sonnet-4.7">Claude-Sonnet-4.7</option>
            <option value="claude-haiku-4.1">Claude-Haiku-4.1</option>
            <option value="gpt-5">GPT-5</option>
            <option value="gemini-2.5-pro">Gemini-2.5-Pro</option>
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

        <div style={S.sectionHeader}>Agents</div>
        <button onClick={addAgent} style={S.secondary} type="button">
          + Add Agent
        </button>
        <div style={S.agentList}>
          {agents.map((agent) => (
            <div key={agent.id} style={S.agentCard}>
              <div style={S.agentHeader}>
                <input
                  value={agent.name}
                  onChange={(event) => updateAgent(agent.id, { name: event.target.value })}
                  style={S.input}
                />
                <button onClick={() => removeAgent(agent.id)} style={S.danger} type="button">
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
              <div style={S.inlineRow}>
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
              <div style={S.inlineRow}>
                <label>Knowledge</label>
                <select
                  multiple
                  value={agent.knowledgeFileIds}
                  onChange={(event) => handleKnowledgeSelect(agent.id, event)}
                  style={{ ...S.input, height: 96 }}
                >
                  {knowledgeFiles.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.title} ({file.chunks} chunks)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div style={S.sectionHeader}>Knowledge Base</div>
        <div style={S.inlineRow}>
          <button onClick={handleUploadClick} style={S.secondary} type="button" disabled={isUploading}>
            {isUploading ? 'Uploading…' : 'Upload Knowledge'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.csv,.json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {isKnowledgeLoading && <span style={S.infoText}>Loading…</span>}
          {knowledgeError && <span style={S.errorText}>{knowledgeError}</span>}
        </div>

        <div style={S.knowledgeList}>
          {!knowledgeFiles.length && !isKnowledgeLoading && (
            <div style={S.empty}>No knowledge uploaded yet.</div>
          )}
          {knowledgeFiles.map((file) => (
            <div key={file.id} style={S.knowledgeItem}>
              <div>
                <div style={S.knowledgeTitle}>{file.title}</div>
                <div style={S.knowledgeMeta}>
                  {(file.size / 1024).toFixed(1)} KB • {file.chunks} chunks • {file.type}
                </div>
              </div>
              <button
                onClick={() => handleDeleteKnowledge(file.id)}
                style={S.danger}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={S.footer}>
          <button onClick={onClose} style={S.secondary} type="button">
            Cancel
          </button>
          <button onClick={handleSave} style={S.primary} type="button">
            Save
          </button>
        </div>
      </div>
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
    width: 780,
    maxWidth: '92vw',
    padding: 20,
    maxHeight: '92vh',
    overflowY: 'auto',
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
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13
  },
  infoText: {
    color: '#64748b',
    fontSize: 13
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: 600
  },
  agentList: {
    marginTop: 8,
    maxHeight: 260,
    overflow: 'auto',
    border: '1px solid #eee',
    borderRadius: 8,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  agentCard: {
    borderBottom: '1px dashed #eee',
    paddingBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  agentHeader: {
    display: 'flex',
    gap: 8
  },
  inlineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  knowledgeList: {
    marginTop: 8,
    border: '1px solid #eee',
    borderRadius: 8,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 220,
    overflowY: 'auto'
  },
  knowledgeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 6,
    borderBottom: '1px dashed #f1f5f9'
  },
  knowledgeTitle: {
    fontWeight: 600,
    fontSize: 14
  },
  knowledgeMeta: {
    fontSize: 12,
    color: '#64748b'
  },
  empty: {
    fontSize: 13,
    color: '#6b7280'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16
  }
};

