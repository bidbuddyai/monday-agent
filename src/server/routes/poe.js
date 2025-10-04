const express = require('express');
const router = express.Router();

// ===== DEV STORAGE (replace with Monday storage later) =====
const SETTINGS_BY_BOARD = new Map(); // boardId -> { poeKey, defaultModel, selectedAgentId, agents: [...] }
const ACTION_LOG = new Map(); // boardId -> [{ ts, type, itemId, note }]

// helpers
const getBoardId = (req) => String(req.body?.boardId || req.query?.boardId || 'global');
const getSettings = (boardId) => SETTINGS_BY_BOARD.get(boardId) || null;
const setSettings = (boardId, settings) => SETTINGS_BY_BOARD.set(boardId, settings);
const logAction = (boardId, entry) => {
  const arr = ACTION_LOG.get(boardId) || [];
  arr.unshift({ ts: new Date().toISOString(), ...entry });
  ACTION_LOG.set(boardId, arr.slice(0, 50));
};

// ===== SETTINGS API =====
router.get('/settings', (req, res) => {
  res.json(getSettings(getBoardId(req)) || null);
});

router.post('/settings', (req, res) => {
  const boardId = getBoardId(req);
  const { settings } = req.body || {};
  if (!settings) return res.status(400).json({ error: 'Missing settings' });

  const next = {
    poeKey: settings.poeKey || '',
    defaultModel: settings.defaultModel || 'claude-sonnet-4.5',
    selectedAgentId: settings.selectedAgentId || 'bid-assistant',
    agents: Array.isArray(settings.agents) ? settings.agents : []
  };
  setSettings(boardId, next);
  res.json({ ok: true });
});

// ===== CHAT =====
router.post('/chat', async (req, res) => {
  try {
    const boardId = getBoardId(req);
    const saved = getSettings(boardId) || {};
    const poeKey = saved.poeKey || process.env.POE_API_KEY || null;
    if (!poeKey) return res.status(400).json({ error: 'Missing Poe API key' });

    const model = saved.defaultModel || 'claude-sonnet-4.5';
    const agentId = req.body?.agentId || saved.selectedAgentId || 'bid-assistant';
    const agent =
      (saved.agents || []).find((a) => a.id === agentId) ||
      { name: 'Bid Assistant', system: 'You parse bid docs…', temperature: 0.3 };

    const userMessage = String(req.body?.message || '').trim();
    if (!userMessage) return res.status(400).json({ error: 'Missing message' });

    // TODO: Call Poe with poeKey/model/agent/system/temperature + userMessage.
    const reply = `[${agent.name}] (model=${model}, temp=${agent.temperature}) → ${userMessage}`;

    // Optional: log create/update actions for dashboard
    if (req.body?.createdItemId) {
      logAction(boardId, {
        type: 'create',
        itemId: req.body.createdItemId,
        note: `Created by ${agent.name}`
      });
    }

    res.json({ ok: true, reply });
  } catch (e) {
    console.error('Poe chat error:', e);
    res.status(500).json({ error: 'Internal error', detail: e.message });
  }
});

// ===== DASHBOARD FEED =====
router.get('/feed', (req, res) => {
  res.json({ items: ACTION_LOG.get(getBoardId(req)) || [] });
});

module.exports = router;
