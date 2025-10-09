import React, { useState } from 'react';
import '../styles/ParseResultModal.css';

function ParseResultModal({ result, onCreateItem, onCancel }) {
  const [editedData, setEditedData] = useState({
    itemName: result.data?.item_name || result.data?.name || 'New Item',
    columnValues: result.data?.column_values || {}
  });

  const handleColumnChange = (colId, value) => {
    setEditedData({
      ...editedData,
      columnValues: {
        ...editedData.columnValues,
        [colId]: value
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="parse-result-modal">
        <div className="modal-header">
          <h2>📄 Extracted Data Preview</h2>
          <button className="btn-close" onClick={onCancel} title="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {result.fileName && (
            <div className="file-info">
              <span className="file-icon">📎</span>
              <span className="file-name">{result.fileName}</span>
            </div>
          )}

          <div className="form-section">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              className="form-input"
              value={editedData.itemName}
              onChange={(e) => setEditedData({ ...editedData, itemName: e.target.value })}
              placeholder="Enter item name"
            />
          </div>

          {Object.keys(editedData.columnValues).length > 0 && (
            <div className="form-section">
              <h3 className="section-title">Column Values</h3>
              <div className="column-values">
                {Object.entries(editedData.columnValues).map(([colId, value]) => (
                  <div key={colId} className="column-field">
                    <label className="form-label">{colId}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={typeof value === 'object' ? JSON.stringify(value) : value}
                      onChange={(e) => {
                        try {
                          // Try to parse as JSON if it looks like an object
                          const newValue = e.target.value.startsWith('{') || e.target.value.startsWith('[')
                            ? JSON.parse(e.target.value)
                            : e.target.value;
                          handleColumnChange(colId, newValue);
                        } catch {
                          // If parse fails, keep as string
                          handleColumnChange(colId, e.target.value);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="warnings-section">
              <h4 className="warnings-title">⚠️ Warnings</h4>
              <ul className="warnings-list">
                {result.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.data?.confidence && (
            <div className="confidence-section">
              <h4 className="confidence-title">Confidence Scores</h4>
              <div className="confidence-list">
                {Object.entries(result.data.confidence).map(([field, score]) => (
                  <div key={field} className="confidence-item">
                    <span className="confidence-field">{field}</span>
                    <div className="confidence-bar-container">
                      <div 
                        className="confidence-bar-fill" 
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                    <span className="confidence-value">{(score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onCreateItem(editedData)}
            disabled={!editedData.itemName.trim()}
          >
            ✓ Create Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParseResultModal;
