import React, { useCallback, useEffect, useMemo, useState } from 'react';
import mondaySdk from 'monday-sdk-js';
import ChatView from './components/ChatView';
import DashboardFeed from './components/DashboardFeed';
import SettingsModal from './components/SettingsModal';

const monday = mondaySdk();

const DEFAULT_AGENT = {
  id: 'bid-assistant',
  name: 'Bid Assistant',
  system: 'You parse construction bid docs and extract key fields for project teams.',
  temperature: 0.3,
  knowledgeFileIds: []
};

const normalizeSettings = (incoming) => {
  const base = incoming || {};
  const rawAgents =
    Array.isArray(base.agents) && base.agents.length ? base.agents : [DEFAULT_AGENT];
  const agents = rawAgents.map((agent, index) => {
    const temperature = Number(agent?.temperature);
    return {
      id: agent?.id || (index === 0 ? DEFAULT_AGENT.id : `agent-${index + 1}`),
      name: agent?.name || (index === 0 ? DEFAULT_AGENT.name : `Agent ${index + 1}`),
      system: agent?.system || '',
      temperature: Number.isFinite(temperature) ? temperature : DEFAULT_AGENT.temperature,
      knowledgeFileIds: Array.isArray(agent?.knowledgeFileIds) ? agent.knowledgeFileIds : []
    };
  });
  const selected = agents.find((agent) => agent.id === base.selectedAgentId)?.id || agents[0].id;
  return {
    poeKey: base.poeKey || '',
    defaultModel: base.defaultModel || 'claude-sonnet-4.7',
    selectedAgentId: selected,
    agents
  };
};

function App() {
  const [boardId, setBoardId] = useState('global');
  const [boardName, setBoardName] = useState('Board');
  const [boardData, setBoardData] = useState(null);
  const [settings, setSettings] = useState(() => normalizeSettings(null));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState(null);

  useEffect(() => {
    try {
      monday.listen('context', (res) => {
        const data = res?.data || {};
        if (data.boardId) {
          setBoardId(String(data.boardId));
        }
        if (data.boardName) {
          setBoardName(data.boardName);
        }
      });
    } catch (err) {
      console.warn('Monday context not available, using default board', err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadBoardSchema = async () => {
      if (!boardId || boardId === 'global') {
        setBoardData(null);
        return;
      }
      const numericBoardId = Number(boardId);
      if (!Number.isFinite(numericBoardId)) {
        setBoardData(null);
        return;
      }
      try {
        const query = `
          query ($boardIds: [Int!]) {
            boards(ids: $boardIds) {
              id
              name
              groups { id title }
              columns { id title type }
            }
          }
        `;
        const response = await monday.api(query, { variables: { boardIds: [numericBoardId] } });
        if (cancelled) return;
        const nextBoard = response?.data?.boards?.[0] || null;
        setBoardData(nextBoard);
        if (nextBoard?.name) {
          setBoardName(nextBoard.name);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to load board schema', err);
          setBoardData(null);
        }
      }
    };

    loadBoardSchema();
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const loadSettings = useCallback(async () => {
    if (!boardId) return;
    setIsLoadingSettings(true);
    setSettingsError(null);
    try {
      const res = await fetch(`/api/poe/settings?boardId=${boardId}`);
      if (!res.ok) throw new Error(`Failed to fetch settings (${res.status})`);
      const data = await res.json();
      setSettings(normalizeSettings(data));
    } catch (err) {
      console.error('Failed to load settings', err);
      setSettingsError('Unable to load settings');
      setSettings(normalizeSettings(null));
    } finally {
      setIsLoadingSettings(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const persistSettings = useCallback(
    async (nextSettings) => {
      const payload = normalizeSettings(nextSettings);
      setSettings(payload);
      try {
        const res = await fetch('/api/poe/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardId, settings: payload })
        });
        if (!res.ok) throw new Error(`Failed to save settings (${res.status})`);
        setSettingsError(null);
        return payload;
      } catch (err) {
        console.error('Failed to save settings', err);
        setSettingsError('Unable to save settings');
        throw err;
      }
    },
    [boardId]
  );

  const handleModalSave = async (next) => {
    try {
      await persistSettings(next);
      setIsSettingsOpen(false);
    } catch (err) {
      // Error already logged; keep modal open for correction
    }
  };

  const handleSelectAgent = async (agentId) => {
    const next = { ...settings, selectedAgentId: agentId };
    try {
      await persistSettings(next);
    } catch (err) {
      // If saving fails we still update locally; error banner will show
      setSettings(next);
    }
  };

  const headerTitle = useMemo(() => {
    return `${boardName || 'Board'} • ${boardId}`;
  }, [boardId, boardName]);

  const boardSchemaString = useMemo(() => {
    if (!boardData) return '';
    const groups = Array.isArray(boardData.groups)
      ? boardData.groups.map((group) => `${group.id}:${group.title}`).join(', ')
      : '';
    const columns = Array.isArray(boardData.columns)
      ? boardData.columns.map((column) => `${column.id}:${column.title}(${column.type})`).join(', ')
      : '';
    return `Board="${boardData.name}" | Groups=[${groups}] | Columns=[${columns}]`;
  }, [boardData]);

  if (isLoadingSettings) {
    return (
      <div style={styles.centered}>
        <div>Loading settings…</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Assistant</h1>
          <div style={styles.subtitle}>{headerTitle}</div>
        </div>
        <div style={styles.headerActions}>
          {settingsError && <span style={styles.errorText}>{settingsError}</span>}
          <button type="button" style={styles.primaryButton} onClick={() => setIsSettingsOpen(true)}>
            Open Settings
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <ChatView
          boardId={boardId}
          boardSchema={boardSchemaString}
          settings={settings}
          onSelectAgent={handleSelectAgent}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <DashboardFeed boardId={boardId} />
      </main>

      <SettingsModal
        open={isSettingsOpen}
        boardId={boardId}
        initial={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleModalSave}
      />
    </div>
  );
}

const styles = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f6f7fb'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #e3e8ef',
    background: '#fff'
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  primaryButton: {
    background: '#2563eb',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    display: 'flex',
    gap: 16,
    padding: 16,
    overflow: 'hidden'
  },
  centered: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13
  }
};

export default App;
