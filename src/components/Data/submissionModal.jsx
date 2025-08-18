import React from 'react';
import './submissionModal.css';

const SubmissionsModal = ({ isOpen, onClose, submissions, formName }) => {
  if (!isOpen) return null;

  // Function to format field values for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', ') || 'N/A';
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Function to format field names for display
  const formatFieldName = (fieldName) => {
    // Convert camelCase or snake_case to Title Case
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Filter out system fields
  const filterSystemFields = (key) => {
    const systemFields = ['id', 'formId', 'formID', 'timestamp', 'createdAt', 'updatedAt', '_id'];
    return !systemFields.includes(key);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formName ? `${formName} - Submissions` : 'Form Submissions'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {submissions.length === 0 ? (
            <div className="empty-submissions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
              <h3>No Submissions Yet</h3>
              <p>This form hasn't received any submissions.</p>
            </div>
          ) : (
            <div className="submissions-list">
              <div className="submissions-summary">
                <p>Total Submissions: <strong>{submissions.length}</strong></p>
              </div>
              {submissions.map((submission, index) => {
                // Extract timestamp from various possible fields
                const timestamp = submission.timestamp || submission.createdAt || submission.submittedAt;
                const dateStr = timestamp ? new Date(timestamp).toLocaleString() : null;
                
                // Check if submission has nested data structure
                const actualData = submission.data || submission;
                
                // Get all fields to display
                const fieldsToDisplay = Object.entries(actualData)
                  .filter(([key]) => filterSystemFields(key))
                  .sort(([a], [b]) => a.localeCompare(b));

                return (
                  <div key={submission.id || index} className="submission-item">
                    <div className="submission-header">
                      <span className="submission-id">Submission #{index + 1}</span>
                      {dateStr && (
                        <span className="submission-date" title={dateStr}>
                          {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <div className="submission-data">
                      {fieldsToDisplay.length === 0 ? (
                        <div className="no-data">
                          <p>No data fields available</p>
                        </div>
                      ) : (
                        fieldsToDisplay.map(([key, value]) => {
                          // Handle nested data object
                          if (key === 'data' && typeof value === 'object' && !Array.isArray(value)) {
                            // Flatten nested data fields
                            return Object.entries(value)
                              .filter(([nestedKey]) => filterSystemFields(nestedKey))
                              .map(([nestedKey, nestedValue]) => (
                                <div key={nestedKey} className="data-field">
                                  <span className="field-label">{formatFieldName(nestedKey)}:</span>
                                  <span className="field-value">
                                    {formatValue(nestedValue)}
                                  </span>
                                </div>
                              ));
                          }
                          
                          return (
                            <div key={key} className="data-field">
                              <span className="field-label">{formatFieldName(key)}:</span>
                              <span className="field-value">
                                {formatValue(value)}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionsModal;