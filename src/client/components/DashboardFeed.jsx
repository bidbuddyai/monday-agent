import React, { useEffect, useState } from 'react';

export default function DashboardFeed({ boardId }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let interval;

    const fetchFeed = async () => {
      try {
        const res = await fetch(`/api/poe/feed?boardId=${boardId}`);
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

  return (
    <div style={styles.panel}>
      <div style={styles.header}>Recent Actions</div>
      {error && <div style={styles.error}>{error}</div>}
      {!error && !items.length && (
        <div style={styles.empty}>No assistant activity yet.</div>
      )}
      <ul style={styles.list}>
        {items.map((item, index) => (
          <li key={`${item.ts}-${index}`} style={styles.item}>
            <div style={styles.meta}>
              <span style={styles.type}>{item.type}</span>
              <span>{new Date(item.ts).toLocaleString()}</span>
            </div>
            <div style={styles.body}>
              <strong>Item:</strong> {item.itemId || 'n/a'}
              {item.note && <div style={styles.note}>{item.note}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  panel: {
    border: '1px solid #e3e8ef',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
    minWidth: 260,
    maxWidth: 360,
    flex: '0 0 320px',
    height: '100%',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  header: {
    fontSize: 16,
    fontWeight: 600
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    overflowY: 'auto'
  },
  item: {
    border: '1px solid #f0f0f5',
    borderRadius: 8,
    padding: 12,
    background: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#64748b'
  },
  type: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 600
  },
  body: {
    fontSize: 14,
    color: '#1f2937'
  },
  note: {
    marginTop: 4,
    fontSize: 13,
    color: '#475569'
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    padding: 8,
    borderRadius: 6,
    color: '#b91c1c',
    fontSize: 13
  },
  empty: {
    fontSize: 13,
    color: '#6b7280'
  }
};
