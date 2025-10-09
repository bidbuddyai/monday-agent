import React, { useState } from 'react';
import '../styles/OnboardingModal.css';

function OnboardingModal({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to Monday AI Assistant! 🤖",
      content: (
        <div className="step-welcome">
          <h2>Your AI-Powered Board Assistant</h2>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <span>Chat with AI to manage board items</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Parse documents and extract data</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span>Search and update items with natural language</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span>Create custom assistants with knowledge bases</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Setup Required: Poe API Key 🔑",
      content: (
        <div className="step-api-key">
          <h3>Get Your API Key</h3>
          <div className="setup-steps">
            <div className="setup-step">
              <div className="step-number">1</div>
              <div>Visit <a href="https://poe.com/api_key" target="_blank" rel="noopener noreferrer">poe.com/api_key</a></div>
            </div>
            <div className="setup-step">
              <div className="step-number">2</div>
              <div>Copy your API key</div>
            </div>
            <div className="setup-step">
              <div className="step-number">3</div>
              <div>Click Settings (⚙️) and paste it in the Poe API Key field</div>
            </div>
          </div>
          <div className="warning-box">
            <strong>⚠️ Important:</strong> The assistant won't work without this key!
          </div>
        </div>
      )
    },
    {
      title: "How to Use 💬",
      content: (
        <div className="step-usage">
          <h3>Getting Started</h3>
          <div className="usage-list">
            <div className="usage-item">
              <strong>Chat:</strong> Type messages like "Create a new item called Project Alpha"
            </div>
            <div className="usage-item">
              <strong>Upload Files:</strong> Click the 📎 button to parse documents
            </div>
            <div className="usage-item">
              <strong>Confirm Actions:</strong> Review and approve changes before they're applied
            </div>
            <div className="usage-item">
              <strong>View Activity:</strong> Check recent AI actions in the activity feed
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Customize Your Assistant 🎨",
      content: (
        <div className="step-customize">
          <h3>Advanced Features</h3>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <span><strong>Settings:</strong> Configure multiple custom assistants</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span><strong>Knowledge Base:</strong> Upload reference files for your assistant</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <span><strong>Custom Instructions:</strong> Set specific behavior guidelines</span>
            </div>
          </div>
          <div className="finish-message">
            <h4>🚀 You're all set!</h4>
            <p>Ready to start using your AI assistant?</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button className="btn-skip" onClick={onSkip} title="Skip onboarding">
          Skip ×
        </button>
        
        <div className="step-indicator">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="step-header">
          <h1>{steps[currentStep].title}</h1>
        </div>
        
        <div className="step-content">
          {steps[currentStep].content}
        </div>
        
        <div className="step-navigation">
          {currentStep > 0 && (
            <button className="btn-back" onClick={handleBack}>
              ← Back
            </button>
          )}
          <div style={{flex: 1}} />
          {currentStep < steps.length - 1 ? (
            <button className="btn-next" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button className="btn-finish" onClick={handleFinish}>
              🚀 Let's Get Started!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;