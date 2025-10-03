import React from 'react';

function ConfirmationDialog({ action, onConfirm, onCancel, disabled }) {
  if (!action) return null;

  return (
    <div className="action-confirmation">
      <h3>📋 Confirm Action</h3>
      {action.summary && <p className="action-summary">{action.summary}</p>}
      {action.confidence && (
        <div className="confidence-scores">
          <strong>Confidence Scores:</strong>
          {Object.entries(action.confidence).map(([field, score]) => (
            <div key={field} className="confidence-item">
              <span>{field}</span>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${score * 100}%` }} />
              </div>
              <span>{(score * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
      <pre className="action-payload">
        {JSON.stringify(action.payload, null, 2)}
      </pre>
      <div className="action-buttons">
        <button className="btn-confirm" onClick={onConfirm} disabled={disabled}>
          ✓ Confirm & Execute
        </button>
        <button className="btn-cancel" onClick={onCancel} disabled={disabled}>
          ✗ Cancel
        </button>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
