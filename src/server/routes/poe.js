const express = require('express');
const multer = require('multer');

const router = express.Router();

// ===== DEV STORAGE (replace with Monday storage later) =====
// Per-board settings and knowledge.
const SETTINGS_BY_BOARD = new Map(); // boardId -> Settings
const KNOWLEDGE_BY_BOARD = new Map(); // boardId -> { files: [{id, title, type, size, chunks:[{id, text}]}] }
const ACTION_LOG = new Map(); // boardId -> [{ ts, type, itemId, note }]

/**
 * Settings shape:
 * {
 *   poeKey: string,
 *   defaultModel: string,           // default 'claude-sonnet-4.7'
 *   selectedAgentId: string,
 *   agents: [{ id, name, system, temperature, knowledgeFileIds: string[] }]
 * }
 */

// helpers
const getBoardId = (req) => String(req.body?.boardId || req.query?.boardId || 'global');
const getSettings = (boardId) => SETTINGS_BY_BOARD.get(boardId) || null;
const setSettings = (boardId, s) => SETTINGS_BY_BOARD.set(boardId, s);
const getKnowledge = (boardId) => KNOWLEDGE_BY_BOARD.get(boardId) || { files: [] };
const setKnowledge = (boardId, k) => KNOWLEDGE_BY_BOARD.set(boardId, k);
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

  const agents = Array.isArray(settings.agents)
    ? settings.agents.map((agent) => ({
        ...agent,
        knowledgeFileIds: Array.isArray(agent?.knowledgeFileIds) ? agent.knowledgeFileIds : []
      }))
    : [];

  const next = {
    poeKey: settings.poeKey || '',
    defaultModel: settings.defaultModel || 'claude-sonnet-4.7',
    selectedAgentId:
      settings.selectedAgentId || agents[0]?.id || (settings.agents?.[0]?.id || 'bid-assistant'),
    agents
  };
  setSettings(boardId, next);
  res.json({ ok: true });
});

// ===== KNOWLEDGE MANAGEMENT =====
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

async function fileToText(file) {
  if (file.mimetype === 'application/pdf') {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(file.buffer);
    return data.text || '';
  }
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammothModule = await import('mammoth');
    const mammoth = mammothModule.default || mammothModule;
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || '';
  }
  return file.buffer.toString('utf8');
}

function chunkText(str, chunkSize = 1200) {
  const chunks = [];
  if (!str) return chunks;
  let i = 0;
  while (i < str.length) {
    const slice = str.slice(i, i + chunkSize);
    if (slice.trim()) {
      chunks.push({ id: `c_${i}`, text: slice });
    }
    i += chunkSize;
  }
  return chunks;
}

router.post('/knowledge/upload', upload.single('file'), async (req, res) => {
  try {
    const boardId = getBoardId(req);
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const text = await fileToText(req.file);
    const chunks = chunkText(text);

    const kb = getKnowledge(boardId);
    const fileId = `k_${Date.now()}`;
    kb.files.unshift({
      id: fileId,
      title: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      chunks
    });
    setKnowledge(boardId, kb);

    res.json({ ok: true, fileId, chunks: chunks.length });
  } catch (e) {
    res.status(500).json({ error: 'Parse failed', detail: e?.message });
  }
});

router.get('/knowledge', (req, res) => {
  const kb = getKnowledge(getBoardId(req));
  res.json({
    files: kb.files.map((f) => ({
      id: f.id,
      title: f.title,
      type: f.type,
      size: f.size,
      chunks: f.chunks.length
    }))
  });
});

router.delete('/knowledge/:id', (req, res) => {
  const boardId = getBoardId(req);
  const kb = getKnowledge(boardId);
  const next = { files: kb.files.filter((f) => f.id !== req.params.id) };
  setKnowledge(boardId, next);
  res.json({ ok: true });
});

// ===== CHAT =====
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function topKChunks(kbFiles, query, k = 6) {
  if (!query) return [];
  const tokens = String(query)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => escapeRegExp(token));
  if (!tokens.length) return [];
  const matcher = new RegExp(tokens.join('|'), 'g');
  const scored = [];
  for (const file of kbFiles) {
    for (const chunk of file.chunks) {
      const matches = chunk.text.toLowerCase().match(matcher);
      const score = matches ? matches.length : 0;
      if (score > 0) {
        scored.push({ score, text: chunk.text });
      }
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.text);
}

router.post('/chat', async (req, res) => {
  try {
    const boardId = getBoardId(req);
    const settings = getSettings(boardId) || {};
    const poeKey = settings.poeKey || process.env.POE_API_KEY || null;
    if (!poeKey) return res.status(400).json({ error: 'Missing Poe API key' });

    const model = settings.defaultModel || 'claude-sonnet-4.7';
    const agentId = req.body?.agentId || settings.selectedAgentId || 'bid-assistant';
    const agent =
      (settings.agents || []).find((a) => a.id === agentId) ||
      {
        name: 'Bid Assistant',
        system: 'You parse construction bid docs and extract key fields.',
        temperature: 0.3,
        knowledgeFileIds: []
      };

    const { message, boardSchema } = req.body || {};
    const userMessage = String(message || '').trim();
    if (!userMessage) return res.status(400).json({ error: 'Missing message' });

    const kb = getKnowledge(boardId);
    const attachedFiles = (agent.knowledgeFileIds || [])
      .map((id) => kb.files.find((f) => f.id === id))
      .filter(Boolean);
    const contextChunks = topKChunks(attachedFiles, userMessage, 6);

    const system = [
      agent.system || '',
      boardSchema ? `\nBoard context:\n${boardSchema}` : '',
      contextChunks.length
        ? `\nRelevant knowledge:\n${contextChunks
            .map((text, idx) => `[K${idx + 1}] ${text}`)
            .join('\n\n')}`
        : ''
    ].join('');

    // TODO: Call Poe with: { model, system, temperature: agent.temperature, user: message }
    // For now return the composed prompt to verify:
    const reply = `(${agent.name}) Using model=${model}. System length=${system.length}. User="${userMessage}"`;

    if (req.body?.createdItemId) {
      logAction(boardId, {
        type: 'create',
        itemId: req.body.createdItemId,
        note: `Created by ${agent.name}`
      });
    }

    return res.json({ ok: true, debug: { model, usedChunks: contextChunks.length }, reply });
  } catch (e) {
    console.error('chat error:', e);
    res.status(500).json({ error: 'Internal error', detail: e.message });
  }
});

// ===== DASHBOARD FEED =====
router.get('/feed', (req, res) => {
  res.json({ items: ACTION_LOG.get(getBoardId(req)) || [] });
});

module.exports = router;
