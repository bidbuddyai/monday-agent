# Implementation Plan - Onboarding & Enhancement Features

## Overview
This document outlines the implementation plan for six major feature additions to the Monday AI Assistant app. These features will significantly improve user experience, assistant configuration, document processing, and activity visibility.

---

## 1. Onboarding Flow (First-Time User Guidance)

### Goal
Provide a welcoming, guided experience for new users that ensures proper setup and explains key features.

### Implementation Tasks

#### 1.1 Create OnboardingModal Component
**File**: `src/client/components/OnboardingModal.jsx`

```jsx
import React, { useState } from 'react';
import './OnboardingModal.css';

function OnboardingModal({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to Monday AI Assistant! 🤖",
      content: (
        <div>
          <h2>Your AI-Powered Board Assistant</h2>
          <ul>
            <li>📝 Chat with AI to manage board items</li>
            <li>📊 Parse documents and extract data</li>
            <li>🔍 Search and update items with natural language</li>
            <li>📚 Create custom assistants with knowledge bases</li>
          </ul>
        </div>
      )
    },
    {
      title: "Setup Required: Poe API Key 🔑",
      content: (
        <div>
          <h3>Get Your API Key</h3>
          <ol>
            <li>Visit <a href="https://poe.com/api_key" target="_blank">poe.com/api_key</a></li>
            <li>Copy your API key</li>
            <li>Click Settings (⚙️) and paste it in the Poe API Key field</li>
          </ol>
          <p><strong>Note:</strong> The assistant won't work without this key!</p>
        </div>
      )
    },
    {
      title: "How to Use 💬",
      content: (
        <div>
          <h3>Getting Started</h3>
          <ul>
            <li><strong>Chat:</strong> Type messages like "Create a new item called Project Alpha"</li>
            <li><strong>Upload Files:</strong> Click the 📎 button to parse documents</li>
            <li><strong>Confirm Actions:</strong> Review and approve changes before they're applied</li>
            <li><strong>View Activity:</strong> Check recent AI actions in the activity feed</li>
          </ul>
        </div>
      )
    },
    {
      title: "Customize Your Assistant 🎨",
      content: (
        <div>
          <h3>Advanced Features</h3>
          <ul>
            <li><strong>Settings:</strong> Configure multiple custom assistants</li>
            <li><strong>Knowledge Base:</strong> Upload reference files for your assistant</li>
            <li><strong>Custom Instructions:</strong> Set specific behavior guidelines</li>
          </ul>
          <button className="btn-finish">Let's Get Started!</button>
        </div>
      )
    }
  ];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button className="btn-skip" onClick={onSkip}>Skip ×</button>
        
        <div className="step-indicator">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>
        
        <div className="step-content">
          {steps[currentStep].content}
        </div>
        
        <div className="step-navigation">
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(currentStep - 1)}>
              ← Back
            </button>
          )}
          <div style={{flex: 1}} />
          {currentStep < steps.length - 1 ? (
            <button onClick={() => setCurrentStep(currentStep + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn-primary" onClick={onComplete}>
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
```

#### 1.2 Implement First-Time Detection
**File**: `src/client/App.jsx`

Add state and logic to detect first-time users:

```jsx
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  const checkOnboarding = async () => {
    const monday = mondaySdk();
    
    // Check if onboarding was completed
    const result = await monday.storage.instance.getItem('onboardingCompleted');
    
    // Also check if Poe API key is missing
    const hasPoeKey = settings?.poeKey && settings.poeKey.length > 0;
    
    // Show onboarding if not completed AND no API key
    if (!result?.data?.value && !hasPoeKey) {
      setShowOnboarding(true);
    }
  };
  
  checkOnboarding();
}, [settings]);
```

#### 1.3 Add Completion Persistence
```jsx
const handleOnboardingComplete = async () => {
  const monday = mondaySdk();
  await monday.storage.instance.setItem('onboardingCompleted', 'true');
  setShowOnboarding(false);
};

const handleOnboardingSkip = async () => {
  const monday = mondaySdk();
  await monday.storage.instance.setItem('onboardingCompleted', 'true');
  setShowOnboarding(false);
};
```

### Styling
**File**: `src/client/styles/OnboardingModal.css`

```css
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.onboarding-modal {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.step-indicator {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 30px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: var(--primary-blue);
  transform: scale(1.3);
}

.step-dot.completed {
  background: var(--success-green);
}
```

---

## 2. AI Assistant Creation Wizard

### Goal
Provide a guided, multi-step wizard for creating and configuring custom AI assistants.

### Implementation Tasks

#### 2.1 Create AssistantWizard Component
**File**: `src/client/components/AssistantWizard.jsx`

```jsx
function AssistantWizard({ onSave, onCancel, initialData = null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    id: initialData?.id || `agent-${Date.now()}`,
    name: initialData?.name || '',
    description: initialData?.description || '',
    system: initialData?.system || '',
    model: initialData?.model || 'Claude-Sonnet-4',
    temperature: initialData?.temperature || 0.3,
    instructions: initialData?.instructions || '',
    knowledgeFiles: initialData?.knowledgeFiles || []
  });
  
  const [errors, setErrors] = useState({});
  
  const steps = [
    { title: "Basic Info", component: <BasicInfoStep /> },
    { title: "System Prompt", component: <SystemPromptStep /> },
    { title: "Model Settings", component: <ModelSettingsStep /> },
    { title: "Custom Instructions", component: <InstructionsStep /> },
    { title: "Knowledge Files", component: <KnowledgeFilesStep /> }
  ];
  
  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 0 && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (currentStep === 1 && !formData.system.trim()) {
      newErrors.system = "System prompt is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
    }
  };
  
  const handleFinish = () => {
    if (validateStep()) {
      onSave(formData);
    }
  };
  
  // ... render wizard steps
}
```

#### 2.2 Wizard Step Components

**BasicInfoStep**:
```jsx
function BasicInfoStep({ formData, onChange, errors }) {
  return (
    <div className="wizard-step">
      <h3>Assistant Information</h3>
      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="e.g., Bid Assistant, Project Manager"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label>Description (optional)</label>
        <textarea
          value={formData.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="What does this assistant do?"
          rows={3}
        />
      </div>
    </div>
  );
}
```

**SystemPromptStep**, **ModelSettingsStep**, **InstructionsStep**, **KnowledgeFilesStep** follow similar patterns.

#### 2.3 Integration with Settings
Update `SettingsModal.jsx`:

```jsx
const [showWizard, setShowWizard] = useState(false);
const [editingAgent, setEditingAgent] = useState(null);

// Replace "Add Agent" button
<button onClick={() => setShowWizard(true)}>
  🧙‍♂️ Create Assistant Wizard
</button>

// Add wizard modal
{showWizard && (
  <AssistantWizard
    initialData={editingAgent}
    onSave={handleSaveFromWizard}
    onCancel={() => {
      setShowWizard(false);
      setEditingAgent(null);
    }}
  />
)}
```

---

## 3. File Upload and Document Parsing

### Goal
Allow users to upload documents, parse them with AI, and create board items from extracted data.

### Implementation Tasks

#### 3.1 Add File Upload Button
**File**: `src/client/components/ChatView.jsx`

```jsx
const [selectedFile, setSelectedFile] = useState(null);
const [parsing, setParsing] = useState(false);
const [parseResult, setParseResult] = useState(null);

// In the chat header
<div className="chat-controls">
  <input
    type="file"
    ref={fileInputRef}
    style={{ display: 'none' }}
    onChange={handleFileSelect}
    accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png"
  />
  <button 
    className="btn-upload"
    onClick={() => fileInputRef.current?.click()}
    title="Upload document to parse"
  >
    📎
  </button>
  {/* ... other controls */}
</div>
```

#### 3.2 Implement File Upload Flow
```jsx
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  setSelectedFile(file);
  setParsing(true);
  
  try {
    // Upload file to Monday storage
    const monday = mondaySdk();
    const context = await monday.get('context');
    const boardId = context.data.boardId;
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('boardId', boardId);
    
    // Upload to get public URL
    const uploadRes = await fetch(`${API_BASE}/api/upload-file`, {
      method: 'POST',
      body: formData
    });
    
    const { fileUrl } = await uploadRes.json();
    
    // Call parse-file endpoint
    const parseRes = await fetch(`${API_BASE}/api/poe/parse-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileUrl,
        boardId,
        message: `Parse this file and extract relevant information`
      })
    });
    
    const data = await parseRes.json();
    
    if (!parseRes.ok) {
      throw new Error(data.error || 'Failed to parse file');
    }
    
    // Show parse result modal
    setParseResult(data);
    
  } catch (err) {
    console.error('File parsing error:', err);
    setError(`Failed to parse file: ${err.message}`);
  } finally {
    setParsing(false);
    setSelectedFile(null);
  }
};
```

#### 3.3 Create Parse Results Preview Modal
**File**: `src/client/components/ParseResultModal.jsx`

```jsx
function ParseResultModal({ result, onCreateItem, onCancel }) {
  const [editedData, setEditedData] = useState({
    itemName: result.data?.item_name || '',
    columnValues: result.data?.column_values || {}
  });
  
  return (
    <div className="modal-overlay">
      <div className="parse-result-modal">
        <h2>📄 Extracted Data Preview</h2>
        
        <div className="form-group">
          <label>Item Name</label>
          <input
            type="text"
            value={editedData.itemName}
            onChange={e => setEditedData({
              ...editedData,
              itemName: e.target.value
            })}
          />
        </div>
        
        <h3>Column Values</h3>
        <div className="column-values">
          {Object.entries(editedData.columnValues).map(([colId, value]) => (
            <div key={colId} className="form-group">
              <label>{colId}</label>
              <input
                type="text"
                value={JSON.stringify(value)}
                onChange={e => setEditedData({
                  ...editedData,
                  columnValues: {
                    ...editedData.columnValues,
                    [colId]: JSON.parse(e.target.value)
                  }
                })}
              />
            </div>
          ))}
        </div>
        
        {result.warnings && result.warnings.length > 0 && (
          <div className="warnings">
            <h4>⚠️ Warnings</h4>
            <ul>
              {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
        
        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={() => onCreateItem(editedData)}
          >
            ✓ Create Item
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 3.4 Create Item from Parse Flow
```jsx
const handleCreateFromParse = async (data) => {
  try {
    const response = await fetch(`${API_BASE}/api/poe/execute-tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolCall: {
          function: 'create_monday_item',
          arguments: {
            board_id: boardId,
            item_name: data.itemName,
            column_values: data.columnValues
          }
        },
        boardId
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create item');
    }
    
    // Success feedback
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✓ Created new item: ${data.itemName}`,
      ts: new Date().toISOString()
    }]);
    
    setParseResult(null);
    
  } catch (err) {
    console.error('Create item error:', err);
    setError(`Failed to create item: ${err.message}`);
  }
};
```

#### 3.5 Backend File Upload Endpoint
**File**: `src/server/routes/upload.js`

```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mondayClient = require('../monday-client');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    const { boardId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // Upload to Monday as an asset
    const query = `
      mutation($file: File!) {
        add_file_to_update(file: $file) {
          id
          url
        }
      }
    `;
    
    const result = await mondayClient.query(query, {
      variables: { file: file.buffer }
    });
    
    const fileUrl = result.data.add_file_to_update.url;
    
    res.json({ fileUrl });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 4. Knowledge File Storage (Persistent)

### Goal
Replace in-memory knowledge storage with persistent Monday Storage API.

### Implementation Tasks

#### 4.1 Update Knowledge Store with Persistence
**File**: `src/server/utils/knowledgeStore.js`

```javascript
const mondayClient = require('../monday-client');

class KnowledgeStore {
  constructor() {
    this.cache = new Map(); // In-memory cache
  }
  
  async getKey(boardId, agentId) {
    return `knowledge_${boardId}_${agentId}`;
  }
  
  async getKnowledgeBase(boardId, agentId) {
    const key = await this.getKey(boardId, agentId);
    
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // Load from Monday storage
    try {
      const query = `
        query($key: String!) {
          storage_values(key: $key) {
            value
          }
        }
      `;
      
      const result = await mondayClient.query(query, {
        variables: { key }
      });
      
      if (result.data?.storage_values?.value) {
        const data = JSON.parse(result.data.storage_values.value);
        this.cache.set(key, data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load knowledge from storage:', error);
    }
    
    // Return default empty structure
    return { instructions: '', files: [] };
  }
  
  async setKnowledgeBase(boardId, agentId, data) {
    const key = await this.getKey(boardId, agentId);
    
    // Update cache
    this.cache.set(key, data);
    
    // Persist to Monday storage
    try {
      const mutation = `
        mutation($key: String!, $value: String!) {
          set_storage_value(key: $key, value: $value) {
            success
          }
        }
      `;
      
      await mondayClient.query(mutation, {
        variables: {
          key,
          value: JSON.stringify(data)
        }
      });
    } catch (error) {
      console.error('Failed to save knowledge to storage:', error);
      throw error;
    }
  }
  
  async addFile(boardId, agentId, file) {
    const kb = await this.getKnowledgeBase(boardId, agentId);
    kb.files.push(file);
    await this.setKnowledgeBase(boardId, agentId, kb);
  }
  
  async removeFile(boardId, agentId, fileId) {
    const kb = await this.getKnowledgeBase(boardId, agentId);
    kb.files = kb.files.filter(f => f.id !== fileId);
    await this.setKnowledgeBase(boardId, agentId, kb);
  }
  
  async setInstructions(boardId, agentId, instructions) {
    const kb = await this.getKnowledgeBase(boardId, agentId);
    kb.instructions = instructions;
    await this.setKnowledgeBase(boardId, agentId, kb);
  }
}

module.exports = new KnowledgeStore();
```

#### 4.2 Update POE Routes to Use Persistent Storage
**File**: `src/server/routes/poe.js`

```javascript
// Update all references to knowledgeStore to use async/await

router.get('/api/poe/knowledge', async (req, res) => {
  try {
    const { boardId, agentId } = req.query;
    const kb = await knowledgeStore.getKnowledgeBase(boardId, agentId);
    res.json(kb);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/poe/knowledge', async (req, res) => {
  try {
    const { boardId, agentId, instructions } = req.body;
    await knowledgeStore.setInstructions(boardId, agentId, instructions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Similar updates for file endpoints
```

---

## 5. Knowledge Base Management UI

### Goal
Provide UI to manage knowledge files and custom instructions per assistant.

### Implementation Tasks

#### 5.1 Create Knowledge Base Modal
**File**: `src/client/components/KnowledgeBaseModal.jsx`

```jsx
function KnowledgeBaseModal({ agent, boardId, onClose }) {
  const [knowledge, setKnowledge] = useState({ instructions: '', files: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    loadKnowledge();
  }, [agent.id]);
  
  const loadKnowledge = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/poe/knowledge?boardId=${boardId}&agentId=${agent.id}`
      );
      const data = await res.json();
      setKnowledge(data);
    } catch (err) {
      console.error('Failed to load knowledge:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveInstructions = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/poe/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          agentId: agent.id,
          instructions: knowledge.instructions
        })
      });
      alert('Instructions saved!');
    } catch (err) {
      alert('Failed to save instructions');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddFile = async () => {
    const name = prompt('File name:');
    const content = prompt('File content (paste text):');
    
    if (!name || !content) return;
    
    try {
      await fetch(`${API_BASE}/api/poe/knowledge/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          agentId: agent.id,
          name,
          content
        })
      });
      loadKnowledge(); // Reload
    } catch (err) {
      alert('Failed to add file');
    }
  };
  
  const handleDeleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    
    try {
      await fetch(`${API_BASE}/api/poe/knowledge/file/${fileId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, agentId: agent.id })
      });
      loadKnowledge(); // Reload
    } catch (err) {
      alert('Failed to delete file');
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="knowledge-modal">
        <div className="modal-header">
          <h2>📚 Knowledge Base - {agent.name}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="section">
              <h3>Custom Instructions</h3>
              <textarea
                value={knowledge.instructions}
                onChange={e => setKnowledge({
                  ...knowledge,
                  instructions: e.target.value
                })}
                rows={6}
                placeholder="Enter any special instructions for this assistant..."
              />
              <button onClick={handleSaveInstructions} disabled={saving}>
                {saving ? 'Saving...' : 'Save Instructions'}
              </button>
            </div>
            
            <div className="section">
              <h3>Knowledge Files</h3>
              <div className="file-list">
                {knowledge.files.map(file => (
                  <div key={file.id} className="file-item">
                    <span>📄 {file.name}</span>
                    <button onClick={() => handleDeleteFile(file.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleAddFile}>+ Add File</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

#### 5.2 Add to Settings Modal
Update `SettingsModal.jsx`:

```jsx
const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
const [selectedAgentForKnowledge, setSelectedAgentForKnowledge] = useState(null);

// In the agent list, add a button
<button onClick={() => {
  setSelectedAgentForKnowledge(agent);
  setShowKnowledgeModal(true);
}}>
  📚 Knowledge
</button>

// Render modal
{showKnowledgeModal && (
  <KnowledgeBaseModal
    agent={selectedAgentForKnowledge}
    boardId={boardId}
    onClose={() => {
      setShowKnowledgeModal(false);
      setSelectedAgentForKnowledge(null);
    }}
  />
)}
```

---

## 6. Enhanced Activity Feed

### Goal
Make the activity feed more informative and interactive with item names, change details, and clickable items.

### Implementation Tasks

#### 6.1 Enhance Backend Logging
**File**: `src/server/utils/actionLogger.js`

```javascript
async function logAction(boardId, type, details) {
  try {
    // If itemId provided, fetch item name
    let itemName = null;
    if (details.itemId) {
      try {
        const query = `
          query($itemId: ID!) {
            items(ids: [$itemId]) {
              name
            }
          }
        `;
        const result = await mondayClient.query(query, {
          variables: { itemId: details.itemId }
        });
        itemName = result.data?.items?.[0]?.name;
      } catch (err) {
        console.error('Failed to fetch item name:', err);
      }
    }
    
    // Extract column names if column updates provided
    let changedColumns = [];
    if (details.columnValues) {
      changedColumns = Object.keys(details.columnValues);
    }
    
    const action = {
      type,
      timestamp: new Date().toISOString(),
      itemId: details.itemId,
      itemName: itemName || details.itemName || `Item ${details.itemId}`,
      note: buildNote(type, details, changedColumns, itemName),
      changedColumns,
      ...details
    };
    
    // Store action
    const actions = actionsMap.get(boardId) || [];
    actions.unshift(action);
    if (actions.length > 50) actions.pop();
    actionsMap.set(boardId, actions);
    
    return action;
  } catch (error) {
    console.error('Action logging error:', error);
  }
}

function buildNote(type, details, changedColumns, itemName) {
  switch (type) {
    case 'create':
      return `Created item: ${itemName}`;
    case 'update':
      if (changedColumns.length > 0) {
        return `Updated ${changedColumns.join(', ')} for ${itemName}`;
      }
      return `Updated ${itemName}`;
    case 'parse':
      return `Parsed file: ${details.fileName}`;
    case 'search':
      return `Found ${details.count || 0} items matching "${details.query}"`;
    default:
      return details.note || type;
  }
}
```

#### 6.2 Update Tool Execution to Log Details
**File**: `src/server/routes/poe.js`

```javascript
// In execute-tool endpoint for update_monday_item
const columnValues = toolCall.arguments.column_values || {};
const columnKeys = Object.keys(columnValues);

await logAction(boardId, 'update', {
  itemId,
  columnValues,
  columnKeys,
  note: `Updated ${columnKeys.join(', ')}`
});
```

#### 6.3 Enhance DashboardFeed Component
**File**: `src/client/components/DashboardFeed.jsx`

```jsx
import mondaySdk from 'monday-sdk-js';

function DashboardFeed({ boardId }) {
  const [actions, setActions] = useState([]);
  const monday = mondaySdk();
  
  // ... existing loading logic
  
  const handleItemClick = async (itemId) => {
    try {
      await monday.execute('openItemCard', { itemId });
    } catch (err) {
      console.error('Failed to open item:', err);
    }
  };
  
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
      case 'create': return '#00ca72'; // green
      case 'update': return '#0073ea'; // blue
      case 'parse': return '#fdab3d'; // orange
      case 'search': return '#a25ddc'; // purple
      default: return '#676879'; // gray
    }
  };
  
  return (
    <div className="dashboard-feed">
      <h3>Recent AI Actions</h3>
      <div className="actions-list">
        {actions.map((action, idx) => (
          <div 
            key={idx} 
            className="action-item"
            onClick={() => action.itemId && handleItemClick(action.itemId)}
            style={{ 
              cursor: action.itemId ? 'pointer' : 'default',
              borderLeft: `4px solid ${getActionColor(action.type)}`
            }}
          >
            <div className="action-header">
              <span className="action-icon">{getActionIcon(action.type)}</span>
              <span className="action-type" style={{ color: getActionColor(action.type) }}>
                {action.type.toUpperCase()}
              </span>
              <span className="action-time">
                {new Date(action.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="action-content">
              <div className="action-note">{action.note}</div>
              {action.changedColumns && action.changedColumns.length > 0 && (
                <div className="changed-columns">
                  {action.changedColumns.map(col => (
                    <span key={col} className="column-badge">{col}</span>
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
```

#### 6.4 Update Styles
**File**: `src/client/styles/DashboardFeed.css`

```css
.action-item {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.action-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(2px);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.action-icon {
  font-size: 16px;
}

.action-type {
  font-weight: 600;
  font-size: 12px;
}

.action-time {
  margin-left: auto;
  font-size: 11px;
  color: #676879;
}

.action-note {
  font-size: 14px;
  color: #323338;
}

.changed-columns {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.column-badge {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #676879;
}
```

---

## Testing Checklist

### Onboarding
- [ ] First-time user sees onboarding modal
- [ ] Can navigate through all steps
- [ ] Onboarding saves completion flag
- [ ] Doesn't show again after completion
- [ ] Skip button works and saves flag

### Assistant Wizard
- [ ] Can create new assistant through wizard
- [ ] All 5 steps work correctly
- [ ] Validation prevents invalid data
- [ ] Can edit existing assistant
- [ ] Assistant appears in dropdown after creation

### File Upload
- [ ] Paperclip button appears in ChatView
- [ ] Can select and upload file
- [ ] Parse progress shows
- [ ] Parse result modal displays extracted data
- [ ] Can edit values before creation
- [ ] Create item works from parsed data

### Knowledge Base
- [ ] Knowledge persists across server restarts
- [ ] Can view knowledge for an assistant
- [ ] Can add custom instructions
- [ ] Can add/delete knowledge files
- [ ] Instructions affect AI responses

### Activity Feed
- [ ] Shows item names instead of IDs
- [ ] Displays changed column names
- [ ] Items are clickable
- [ ] Color coding works
- [ ] Icons display correctly
- [ ] Updates in real-time

---

## Deployment Steps

1. **Build the updated client**:
   ```bash
   npm run build
   ```

2. **Test locally**:
   ```bash
   npm run dev
   ```

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add onboarding, wizard, file upload, knowledge base, and enhanced activity feed"
   git push
   ```

4. **Deploy to Monday Code**:
   ```bash
   mapps code:push
   ```

5. **Build and deploy app features**:
   ```bash
   mapps app-features:build
   mapps app-features:deploy
   ```

6. **Create new version and promote**:
   ```bash
   mapps app-versions:create -k
   # Get version ID and promote
   mapps app-versions:promote -i <version_id>
   ```

---

## File Structure Summary

### New Files to Create:
```
src/client/components/
  ├── OnboardingModal.jsx
  ├── AssistantWizard.jsx
  ├── ParseResultModal.jsx
  └── KnowledgeBaseModal.jsx

src/client/styles/
  ├── OnboardingModal.css
  ├── AssistantWizard.css
  ├── ParseResultModal.css
  └── KnowledgeBaseModal.css

src/server/routes/
  └── upload.js

src/server/utils/
  └── knowledgeStore.js (update existing)
```

### Files to Update:
```
src/client/
  ├── App.jsx (add onboarding logic)
  └── components/
      ├── ChatView.jsx (add file upload)
      ├── SettingsModal.jsx (integrate wizard & knowledge)
      └── DashboardFeed.jsx (enhance display)

src/server/
  └── routes/
      └── poe.js (update knowledge endpoints)
```

---

## Next Steps

Ready to start implementation! The plan is broken into 16 clear tasks that can be tackled in order. Each section has detailed code examples and implementation guidance.

Would you like to start with any specific feature first, or proceed in the order listed?
