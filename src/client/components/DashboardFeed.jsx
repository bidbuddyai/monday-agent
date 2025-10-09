import React, { useEffect, useState } from 'react';
import mondaySdk from 'monday-sdk-js';
import { API_BASE } from '../config';
import '../styles/DashboardFeed.css';

const monday = mondaySdk();

export default function DashboardFeed({ boardId }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let interval;

    const fetchFeed = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/poe/feed?boardId=${boardId}`);
        if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
        const data = await res.json();
        if (!active) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setError(null);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load feed', err);
        setError('Unable to load feed');
      }
    };

    if (boardId) {
      fetchFeed();
      interval = setInterval(fetchFeed, 10000);
    }

    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [boardId]);

  const getActionIcon = (type) => {
    switch (type) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'parse': return '📄';
      case 'search': return '🔍';
      default: return '•';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'create': return '#00ca72';
      case 'update': return '#0073ea';
      case 'parse': return '#fdab3d';
      case 'search': return '#a25ddc';
      default: return '#676879';
    }
  };

  const handleItemClick = async (item) => {
    if (!item.itemId) return;

    try {
      await monday.execute('openItemCard', { itemId: parseInt(item.itemId) });
    } catch (err) {
      console.error('Failed to open item card:', err);
    }
  };

  return (
    <div className="dashboard-feed">
      <div className="feed-header">
        <h3>Recent AI Actions</h3>
      </div>
      {error && <div className="feed-error">{error}</div>}
      {!error && !items.length && (
        <div className="feed-empty">No assistant activity yet.</div>
      )}
      <div className="actions-list">
        {items.map((item, index) => (
          <div
            key={`${item.ts}-${index}`}
            className={`action-item ${item.itemId ? 'clickable' : ''}`}
            onClick={() => handleItemClick(item)}
            style={{ borderLeft: `4px solid ${getActionColor(item.type)}` }}
          >
            <div className="action-header">
              <span className="action-icon">{getActionIcon(item.type)}</span>
              <span className="action-type" style={{ color: getActionColor(item.type) }}>
                {item.type.toUpperCase()}
              </span>
              <span className="action-time">
                {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="action-content">
              <div className="action-note">
                {item.note || `Item: ${item.itemId || 'n/a'}`}
              </div>
              {item.changedColumns && item.changedColumns.length > 0 && (
                <div className="changed-columns">
                  {item.changedColumns.map((col, idx) => (
                    <span key={idx} className="column-badge">{col}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
