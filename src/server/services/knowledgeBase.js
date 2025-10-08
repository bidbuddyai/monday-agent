// Knowledge Base Management
// Stores custom instructions and knowledge files per board/agent

const knowledgeStore = new Map();

/**
 * Get knowledge base for a specific board and agent
 */
function getKnowledgeBase(boardId, agentId) {
  const key = `${boardId}:${agentId}`;
  return knowledgeStore.get(key) || {
    instructions: '',
    files: []
  };
}

/**
 * Set knowledge base for a specific board and agent
 */
function setKnowledgeBase(boardId, agentId, knowledge) {
  const key = `${boardId}:${agentId}`;
  knowledgeStore.set(key, {
    instructions: knowledge.instructions || '',
    files: Array.isArray(knowledge.files) ? knowledge.files : [],
    updatedAt: new Date().toISOString()
  });
}

/**
 * Add a knowledge file
 */
function addKnowledgeFile(boardId, agentId, file) {
  const kb = getKnowledgeBase(boardId, agentId);
  kb.files.push({
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    content: file.content,
    type: file.type || 'text',
    uploadedAt: new Date().toISOString()
  });
  setKnowledgeBase(boardId, agentId, kb);
  return kb.files[kb.files.length - 1];
}

/**
 * Remove a knowledge file
 */
function removeKnowledgeFile(boardId, agentId, fileId) {
  const kb = getKnowledgeBase(boardId, agentId);
  kb.files = kb.files.filter(f => f.id !== fileId);
  setKnowledgeBase(boardId, agentId, kb);
}

/**
 * Build context string from knowledge base
 */
function buildKnowledgeContext(boardId, agentId) {
  const kb = getKnowledgeBase(boardId, agentId);
  const parts = [];

  if (kb.instructions) {
    parts.push(`Custom Instructions:\n${kb.instructions}`);
  }

  if (kb.files.length > 0) {
    parts.push('\nKnowledge Base Files:');
    kb.files.forEach(file => {
      parts.push(`\n--- ${file.name} ---`);
      parts.push(file.content);
      parts.push('--- End ---\n');
    });
  }

  return parts.length > 0 ? '\n\n' + parts.join('\n') : '';
}

module.exports = {
  getKnowledgeBase,
  setKnowledgeBase,
  addKnowledgeFile,
  removeKnowledgeFile,
  buildKnowledgeContext
};
