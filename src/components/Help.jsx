import React, { useState } from 'react';
import './Help.css';

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'form-creation', label: 'Form Creation', icon: '📝' },
    { id: 'form-management', label: 'Form Management', icon: '📋' },
    { id: 'data-management', label: 'Data Management', icon: '📊' },
    { id: 'validation', label: 'Validation Rules', icon: '✅' },
    { id: 'shortcuts', label: 'Tips & Shortcuts', icon: '⚡' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { id: 'faq', label: 'FAQ', icon: '❓' }
  ];

  const content = {
    'getting-started': (
      <div className="help-content">
        <h2>🚀 Getting Started with NeuroForm.AI</h2>
        <p>Welcome to NeuroForm.AI - your intelligent form builder powered by natural language processing!</p>
        
        <div className="guide-section">
          <h3>Quick Start Guide</h3>
          <ol className="guide-list">
            <li>
              <strong>Create Your First Form:</strong>
              <p>Navigate to the Form Creator tab and use natural language to describe your form.</p>
              <div className="code-example">
                Example: "Create a form with name as text, email as email, age as number"
              </div>
            </li>
            <li>
              <strong>Fill Out Forms:</strong>
              <p>Go to Form List to see all your forms and click on any form to fill it out.</p>
            </li>
            <li>
              <strong>View Submissions:</strong>
              <p>Check the Data List tab to see all form submissions and analyze your data.</p>
            </li>
          </ol>
        </div>

        <div className="guide-section">
          <h3>Key Features</h3>
          <ul className="feature-list">
            <li>✨ Natural language form creation</li>
            <li>🎨 Dark/Light theme support</li>
            <li>💾 Local browser storage (IndexedDB)</li>
            <li>📱 Responsive design</li>
            <li>🔒 Input validation</li>
            <li>📊 Data visualization</li>
          </ul>
        </div>
      </div>
    ),

    'form-creation': (
      <div className="help-content">
        <h2>📝 Form Creation Guide</h2>
        
        <div className="guide-section">
          <h3>Using the Chat Interface</h3>
          <p>The AI assistant understands natural language commands for form creation:</p>
          
          <div className="expandable-item">
            <div 
              className="expandable-header"
              onClick={() => toggleExpand('chat-examples')}
            >
              <span>Chat Command Examples</span>
              <span className="expand-icon">{expandedItems['chat-examples'] ? '−' : '+'}</span>
            </div>
            {expandedItems['chat-examples'] && (
              <div className="expandable-content">
                <ul className="example-list">
                  <li>
                    <code>"Create a contact form"</code>
                    <p>Creates a basic contact form with common fields</p>
                  </li>
                  <li>
                    <code>"Add field email as email"</code>
                    <p>Adds an email field with validation</p>
                  </li>
                  <li>
                    <code>"Add dropdown for country with options USA, Canada, Mexico"</code>
                    <p>Creates a dropdown field with specified options</p>
                  </li>
                  <li>
                    <code>"Add radio button for gender with options Male, Female, Other"</code>
                    <p>Creates radio button group</p>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="guide-section">
          <h3>Manual Form Builder</h3>
          <p>You can also create forms manually using the form builder interface:</p>
          
          <ol className="guide-list">
            <li>Enter a form name (3-50 characters)</li>
            <li>Click "Add Field" to add new fields</li>
            <li>Configure field type and options</li>
            <li>Mark fields as required if needed</li>
            <li>Click "Save Form" to save your form</li>
          </ol>
        </div>

        <div className="guide-section">
          <h3>Supported Field Types</h3>
          <table className="field-types-table">
            <thead>
              <tr>
                <th>Field Type</th>
                <th>Description</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Text</td>
                <td>Single line text input</td>
                <td>Max length, required</td>
              </tr>
              <tr>
                <td>Number</td>
                <td>Numeric input only</td>
                <td>Number format, min/max</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>Email address input</td>
                <td>Email format validation</td>
              </tr>
              <tr>
                <td>Phone/Tel</td>
                <td>Phone number input</td>
                <td>Phone format validation</td>
              </tr>
              <tr>
                <td>Date</td>
                <td>Date picker</td>
                <td>Date format</td>
              </tr>
              <tr>
                <td>Textarea</td>
                <td>Multi-line text input</td>
                <td>Max length</td>
              </tr>
              <tr>
                <td>Dropdown</td>
                <td>Select from options</td>
                <td>Required selection</td>
              </tr>
              <tr>
                <td>Radio Button</td>
                <td>Single choice from options</td>
                <td>Required selection</td>
              </tr>
              <tr>
                <td>Checkbox</td>
                <td>Yes/No selection</td>
                <td>Required check</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),

    'form-management': (
      <div className="help-content">
        <h2>📋 Form Management</h2>
        
        <div className="guide-section">
          <h3>Managing Your Forms</h3>
          <p>The Form List section allows you to manage and interact with your forms:</p>
          
          <div className="expandable-item">
            <div 
              className="expandable-header"
              onClick={() => toggleExpand('form-actions')}
            >
              <span>Available Actions</span>
              <span className="expand-icon">{expandedItems['form-actions'] ? '−' : '+'}</span>
            </div>
            {expandedItems['form-actions'] && (
              <div className="expandable-content">
                <ul className="action-list">
                  <li>
                    <strong>Fill Form:</strong> Click on any form card to open and fill it
                  </li>
                  <li>
                    <strong>Add Fields:</strong> Click "+ Add Field" button to add new fields to existing forms
                  </li>
                  <li>
                    <strong>View Field Count:</strong> See the number of fields in each form
                  </li>
                  <li>
                    <strong>Submit Data:</strong> Fill and submit form responses
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="guide-section">
          <h3>Updating Forms</h3>
          <p>Forms can be updated in two ways:</p>
          
          <ol className="guide-list">
            <li>
              <strong>From Form Creator:</strong>
              <p>Create a form with the same name to update its fields</p>
            </li>
            <li>
              <strong>From Form List:</strong>
              <p>Use the "+ Add Field" button on any form card</p>
            </li>
          </ol>
          
          <div className="info-box">
            <strong>💡 Tip:</strong> Form IDs remain constant when updating, so all submissions stay linked to the correct form.
          </div>
        </div>
      </div>
    ),

    'data-management': (
      <div className="help-content">
        <h2>📊 Data Management</h2>
        
        <div className="guide-section">
          <h3>Viewing Submissions</h3>
          <p>The Data List section displays all form submissions:</p>
          
          <ul className="feature-list">
            <li>Click on any form to view its submissions</li>
            <li>See submission count for each form</li>
            <li>View detailed submission data in modal</li>
            <li>Timestamps for each submission</li>
            <li>Formatted field values</li>
          </ul>
        </div>

        <div className="guide-section">
          <h3>Data Storage</h3>
          <p>All data is stored locally in your browser using IndexedDB:</p>
          
          <div className="expandable-item">
            <div 
              className="expandable-header"
              onClick={() => toggleExpand('storage-info')}
            >
              <span>Storage Information</span>
              <span className="expand-icon">{expandedItems['storage-info'] ? '−' : '+'}</span>
            </div>
            {expandedItems['storage-info'] && (
              <div className="expandable-content">
                <ul className="info-list">
                  <li>✅ Data persists between sessions</li>
                  <li>✅ No server required</li>
                  <li>✅ Can store GBs of data</li>
                  <li>⚠️ Data is browser-specific</li>
                  <li>⚠️ Clearing browser data will delete forms</li>
                  <li>⚠️ No automatic backups</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="guide-section">
          <h3>Data Privacy</h3>
          <div className="info-box success">
            <strong>🔒 Your Data is Private:</strong> All data is stored locally in your browser. No data is sent to any server or third party.
          </div>
        </div>
      </div>
    ),

    'validation': (
      <div className="help-content">
        <h2>✅ Validation Rules</h2>
        
        <div className="guide-section">
          <h3>Form Name Validation</h3>
          <ul className="validation-list">
            <li>Required field</li>
            <li>3-50 characters long</li>
            <li>Any characters allowed</li>
          </ul>
        </div>

        <div className="guide-section">
          <h3>Field Name Validation</h3>
          <ul className="validation-list">
            <li>Must start with a letter</li>
            <li>Can contain letters, numbers, underscores, spaces</li>
            <li>Maximum 30 characters</li>
            <li>No duplicate field names (case-insensitive)</li>
          </ul>
        </div>

        <div className="guide-section">
          <h3>Field Type Validations</h3>
          
          <div className="expandable-item">
            <div 
              className="expandable-header"
              onClick={() => toggleExpand('field-validations')}
            >
              <span>Specific Field Validations</span>
              <span className="expand-icon">{expandedItems['field-validations'] ? '−' : '+'}</span>
            </div>
            {expandedItems['field-validations'] && (
              <div className="expandable-content">
                <dl className="validation-details">
                  <dt>Email</dt>
                  <dd>Standard email format: user@domain.com</dd>
                  
                  <dt>Phone</dt>
                  <dd>Numbers, spaces, dashes, parentheses, plus sign</dd>
                  
                  <dt>Number</dt>
                  <dd>Valid numeric values only</dd>
                  
                  <dt>Date</dt>
                  <dd>Valid date format</dd>
                  
                  <dt>Dropdown/Radio</dt>
                  <dd>At least 2 options required</dd>
                </dl>
              </div>
            )}
          </div>
        </div>

        <div className="guide-section">
          <h3>Required Fields</h3>
          <p>Fields marked as required must be filled before form submission. Look for the red asterisk (*) next to required field labels.</p>
        </div>
      </div>
    ),

    'shortcuts': (
      <div className="help-content">
        <h2>⚡ Tips & Shortcuts</h2>
        
        <div className="guide-section">
          <h3>Pro Tips</h3>
          <ul className="tips-list">
            <li>
              <strong>Quick Form Creation:</strong>
              <p>Use natural language in the chat to quickly create complex forms</p>
            </li>
            <li>
              <strong>Bulk Field Addition:</strong>
              <p>Describe multiple fields in one chat message</p>
            </li>
            <li>
              <strong>Form Templates:</strong>
              <p>Say "Create a contact form" or "Create a survey form" for common templates</p>
            </li>
            <li>
              <strong>Field Updates:</strong>
              <p>Use the same form name to update existing forms</p>
            </li>
            <li>
              <strong>Theme Toggle:</strong>
              <p>Click the theme button in header for dark/light mode</p>
            </li>
          </ul>
        </div>

        <div className="guide-section">
          <h3>Keyboard Shortcuts</h3>
          <table className="shortcuts-table">
            <tbody>
              <tr>
                <td><kbd>Enter</kbd></td>
                <td>Submit chat message</td>
              </tr>
              <tr>
                <td><kbd>Esc</kbd></td>
                <td>Close modals</td>
              </tr>
              <tr>
                <td><kbd>Tab</kbd></td>
                <td>Navigate between fields</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="guide-section">
          <h3>Best Practices</h3>
          <ol className="best-practices">
            <li>Use descriptive form and field names</li>
            <li>Mark important fields as required</li>
            <li>Provide clear options for dropdowns</li>
            <li>Test your forms before sharing</li>
            <li>Regularly check submissions in Data List</li>
          </ol>
        </div>
      </div>
    ),

    'troubleshooting': (
      <div className="help-content">
        <h2>🔧 Troubleshooting</h2>
        
        <div className="guide-section">
          <h3>Common Issues</h3>
          
          <div className="expandable-item">
            <div 
              className="expandable-header"
              onClick={() => toggleExpand('issue-1')}
            >
              <span>Forms not saving</span>
              <span className="expand-icon">{expandedItems['issue-1'] ? '−' : '+'}</span>
            </div>
            {expandedItems['issue-1'] && (
              <div className="expandable-content">
                <p><strong>Solution:</strong></p>
                <ul>
                  <li>Ensure form name is valid (3-50 characters)</li>
                  <li>Add at least one field to the form</li>
                  <li>Check browser console for errors</li>
                  <li>Verify browser supports IndexedDB</li>
                </ul>
              </div>
            )}
          </div>

          <div className="expandable-item">
            <div 
              className="expandable-header"
              onClick={() => toggleExpand('issue-2')}
            >
              <span>Data not persisting</span>
              <span className="expand-icon">{expandedItems['issue-2'] ? '−' : '+'}</span>
            </div>
            {expandedItems['issue-2'] && (
              <div className="expandable-content">
                <p><strong>Solution:</strong></p>
                <ul>
                  <li>Don't use private/incognito browsing</li>
                  <li>Check browser storage settings</li>
                  <li>Ensure sufficient storage space</li>
                  <li>Don't clear browser data</li>
                </ul>
              </div>
            )}
          </div>

          <div className="expandable-item">
            <div 
              className="expandable-header"
              onClick={() => toggleExpand('issue-3')}
            >
              <span>Validation errors</span>
              <span className="expand-icon">{expandedItems['issue-3'] ? '−' : '+'}</span>
            </div>
            {expandedItems['issue-3'] && (
              <div className="expandable-content">
                <p><strong>Solution:</strong></p>
                <ul>
                  <li>Check field format requirements</li>
                  <li>Fill all required fields</li>
                  <li>Use correct email/phone format</li>
                  <li>Ensure field names are unique</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="guide-section">
          <h3>Browser Compatibility</h3>
          <p>NeuroForm.AI works best on modern browsers:</p>
          <ul className="browser-list">
            <li>✅ Chrome 90+</li>
            <li>✅ Firefox 88+</li>
            <li>✅ Safari 14+</li>
            <li>✅ Edge 90+</li>
            <li>⚠️ Limited support for older browsers</li>
          </ul>
        </div>
      </div>
    ),

    'faq': (
      <div className="help-content">
        <h2>❓ Frequently Asked Questions</h2>
        
        <div className="faq-section">
          {[
            {
              q: "Is my data secure?",
              a: "Yes! All data is stored locally in your browser. No data is sent to any server."
            },
            {
              q: "Can I export my data?",
              a: "Currently, data export is not available, but it's planned for future updates."
            },
            {
              q: "How much data can I store?",
              a: "IndexedDB can store several GBs of data, depending on your browser and device."
            },
            {
              q: "Can I share forms with others?",
              a: "Forms are stored locally, so each user has their own set of forms."
            },
            {
              q: "What happens if I clear browser data?",
              a: "All forms and submissions will be permanently deleted. There's no recovery option."
            },
            {
              q: "Can I use this offline?",
              a: "Yes! Once loaded, the app works completely offline."
            },
            {
              q: "How do I update an existing form?",
              a: "Create a form with the same name or use the '+ Add Field' button in Form List."
            },
            {
              q: "Is there a limit to the number of forms?",
              a: "No hard limit, but performance may degrade with thousands of forms."
            }
          ].map((item, index) => (
            <div key={index} className="faq-item">
              <div 
                className="faq-question"
                onClick={() => toggleExpand(`faq-${index}`)}
              >
                <span>{item.q}</span>
                <span className="expand-icon">{expandedItems[`faq-${index}`] ? '−' : '+'}</span>
              </div>
              {expandedItems[`faq-${index}`] && (
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="help-container">
      <div className="help-sidebar">
        <h2>Help Topics</h2>
        <nav className="help-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="help-main">
        {content[activeSection]}
        
        <div className="help-footer">
          <p>Need more help? This application is open source and continuously improving!</p>
          <p className="version-info">Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Help; 