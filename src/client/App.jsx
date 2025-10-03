import React, { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';
import ChatView from './components/ChatView';
import SettingsView from './components/SettingsView';

const monday = mondaySdk();

function App() {
  const [context, setContext] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [settings, setSettings] = useState({
    model: 'Claude-Sonnet-4.5',
    customInstructions: '',
    poeApiKey: ''
  });
  const [view, setView] = useState('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Get Monday context
      monday.listen('context', async (res) => {
        setContext(res.data);
        if (res.data.boardId) {
          await fetchBoardData(res.data.boardId);
        }
      });

      // Load settings
      await loadSettings();
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to initialize app');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await monday.storage.instance.getItem('app_settings');
      if (res.data?.value) {
        setSettings(JSON.parse(res.data.value));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const fetchBoardData = async (boardId) => {
    try {
      const response = await monday.api(`
        query ($boardId: [ID!]) {
          boards(ids: $boardId) {
            id
            name
            columns {
              id
              title
              type
              settings_str
            }
            groups {
              id
              title
            }
          }
        }
      `, { variables: { boardId: [boardId] } });

      const board = response.data.boards[0];
      
      // Parse column settings
      board.columns = board.columns.map(col => {
        if (col.settings_str) {
          try {
            col.settings = JSON.parse(col.settings_str);
          } catch (e) {
            col.settings = {};
          }
        }
        return col;
      });

      setBoardData(board);
    } catch (error) {
      console.error('Error fetching board:', error);
      monday.execute('notice', {
        message: 'Failed to load board data',
        type: 'error'
      });
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      
      // Save settings to storage
      await monday.storage.instance.setItem(
        'app_settings',
        JSON.stringify(newSettings)
      );
      
      // Save API key securely if provided
      if (newSettings.poeApiKey) {
        await monday.storage.instance.setItem(
          'POE_API_KEY',
          newSettings.poeApiKey,
          { shared: false }
        );
      }

      monday.execute('notice', {
        message: 'Settings saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      monday.execute('notice', {
        message: 'Failed to save settings',
        type: 'error'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading AI Assistant...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!context || !boardData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading board data...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>🤖 AI Assistant</h1>
          <span className="board-badge">{boardData.name}</span>
        </div>
        <div className="header-actions">
          <button
            className={`tab-button ${view === 'chat' ? 'active' : ''}`}
            onClick={() => setView('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`tab-button ${view === 'settings' ? 'active' : ''}`}
            onClick={() => setView('settings')}
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="app-content">
        {view === 'chat' ? (
          <ChatView
            context={context}
            boardData={boardData}
            settings={settings}
            onRefreshBoard={() => fetchBoardData(context.boardId)}
          />
        ) : (
          <SettingsView
            settings={settings}
            onSave={saveSettings}
            boardData={boardData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
