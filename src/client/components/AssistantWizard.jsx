import React, { useState } from 'react';
import '../styles/AssistantWizard.css';

function AssistantWizard({ onSave, onCancel, initialData = null, availableModels = [] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    id: initialData?.id || `agent-${Date.now()}`,
    name: initialData?.name || '',
    description: initialData?.description || '',
    system: initialData?.system || '',
    model: initialData?.model || 'Claude-Sonnet-4',
    temperature: initialData?.temperature ?? 0.3,
    instructions: initialData?.instructions || '',
    knowledgeFiles: initialData?.knowledgeFiles || []
  });
  
  const [errors, setErrors] = useState({});
  
  const steps = [
    { title: 'Basic Info', icon: '📝' },
    { title: 'System Prompt', icon: '🎯' },
    { title: 'Model Settings', icon: '⚙️' },
    { title: 'Instructions', icon: '📋' },
    { title: 'Review', icon: '✅' }
  ];

  const validateStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        }
        break;
      case 1: // System Prompt
        if (!formData.system.trim()) {
          newErrors.system = 'System prompt is required';
        }
        break;
      case 2: // Model Settings
        if (!formData.model) {
          newErrors.model = 'Model selection is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
    setErrors({});
  };

  const handleFinish = () => {
    if (validateStep()) {
      onSave(formData);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="wizard-step">
            <h3>Assistant Information</h3>
            <p className="step-description">Give your assistant a name and describe what it does.</p>
            
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Bid Assistant, Project Manager"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                className="form-input"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="What does this assistant help with?"
                rows={3}
              />
            </div>
          </div>
        );

      case 1: // System Prompt
        return (
          <div className="wizard-step">
            <h3>System Prompt</h3>
            <p className="step-description">Define your assistant's role and personality.</p>
            
            <div className="form-group">
              <label>System Prompt *</label>
              <textarea
                className={`form-input ${errors.system ? 'error' : ''}`}
                value={formData.system}
                onChange={(e) => updateField('system', e.target.value)}
                placeholder="e.g., You are a helpful assistant that analyzes construction bid documents and extracts key information..."
                rows={8}
              />
              {errors.system && <span className="error-text">{errors.system}</span>}
            </div>

            <div className="help-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Be specific about the assistant's role</li>
                <li>Include any special formatting requirements</li>
                <li>Mention the type of data it should focus on</li>
              </ul>
            </div>
          </div>
        );

      case 2: // Model Settings
        return (
          <div className="wizard-step">
            <h3>Model & Settings</h3>
            <p className="step-description">Choose the AI model and adjust its behavior.</p>
            
            <div className="form-group">
              <label>AI Model *</label>
              <select
                className={`form-input ${errors.model ? 'error' : ''}`}
                value={formData.model}
                onChange={(e) => updateField('model', e.target.value)}
              >
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.provider ? `(${model.provider})` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Claude-Sonnet-4">Claude Sonnet 4 (Anthropic)</option>
                    <option value="GPT-4o">GPT-4o (OpenAI)</option>
                    <option value="GPT-5">GPT-5 (OpenAI)</option>
                    <option value="Gemini-2.5-Pro">Gemini 2.5 Pro (Google)</option>
                  </>
                )}
              </select>
              {errors.model && <span className="error-text">{errors.model}</span>}
            </div>

            <div className="form-group">
              <label>Temperature: {formData.temperature.toFixed(1)}</label>
              <div className="temperature-control">
                <span className="temp-label">Precise</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
                  className="temperature-slider"
                />
                <span className="temp-label">Creative</span>
              </div>
              <p className="help-text">
                Lower values (0.0-0.3) = More focused and consistent<br />
                Higher values (0.7-1.0) = More creative and varied
              </p>
            </div>
          </div>
        );

      case 3: // Custom Instructions
        return (
          <div className="wizard-step">
            <h3>Custom Instructions</h3>
            <p className="step-description">Add any additional guidelines for this assistant (optional).</p>
            
            <div className="form-group">
              <label>Instructions (optional)</label>
              <textarea
                className="form-input"
                value={formData.instructions}
                onChange={(e) => updateField('instructions', e.target.value)}
                placeholder="e.g., Always respond in Spanish, Use bullet points for lists, Focus on cost analysis..."
                rows={6}
              />
            </div>

            <div className="info-box">
              <strong>ℹ️ Note:</strong> Custom instructions are appended to every request
              and can be used to modify the assistant's behavior without changing the main system prompt.
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="wizard-step">
            <h3>Review Your Assistant</h3>
            <p className="step-description">Review your settings before creating the assistant.</p>
            
            <div className="review-section">
              <div className="review-item">
                <strong>Name:</strong>
                <span>{formData.name}</span>
              </div>
              
              {formData.description && (
                <div className="review-item">
                  <strong>Description:</strong>
                  <span>{formData.description}</span>
                </div>
              )}
              
              <div className="review-item">
                <strong>System Prompt:</strong>
                <div className="review-text-box">{formData.system}</div>
              </div>
              
              <div className="review-item">
                <strong>Model:</strong>
                <span>{formData.model}</span>
              </div>
              
              <div className="review-item">
                <strong>Temperature:</strong>
                <span>{formData.temperature.toFixed(1)}</span>
              </div>
              
              {formData.instructions && (
                <div className="review-item">
                  <strong>Custom Instructions:</strong>
                  <div className="review-text-box">{formData.instructions}</div>
                </div>
              )}
            </div>

            <div className="success-box">
              <strong>🎉 Ready to Create!</strong>
              <p>Your assistant "{formData.name}" is configured and ready to use.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard-overlay">
      <div className="wizard-modal">
        <div className="wizard-header">
          <h2>{initialData ? 'Edit Assistant' : 'Create New Assistant'}</h2>
          <button className="btn-close" onClick={onCancel} title="Close">
            ×
          </button>
        </div>

        <div className="wizard-progress">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`progress-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>

        <div className="wizard-content">
          {renderStepContent()}
        </div>

        <div className="wizard-footer">
          {currentStep > 0 && (
            <button className="btn-secondary" onClick={handleBack}>
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {currentStep < steps.length - 1 ? (
            <button className="btn-primary" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button className="btn-success" onClick={handleFinish}>
              {initialData ? '✓ Save Changes' : '✓ Create Assistant'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssistantWizard;
