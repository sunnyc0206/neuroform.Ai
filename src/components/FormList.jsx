import React, { useState, useEffect } from "react";
import browserDB from "./Database/browserDB";
import "./FormList.css";
import toast from "react-hot-toast";

const FormList = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [formToUpdate, setFormToUpdate] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const formData = await browserDB.collection("forms").get();
      console.log("Fetched forms:", formData);
      setForms(formData);
    } catch (error) {
      console.error("Error fetching forms:", error);
      setForms([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const openForm = (formId) => {
    const form = forms.find((f) => f.id === formId);
    console.log("Opening form:", form);
    setSelectedForm(formId);
    setFormData({});
  };

  const openAddFieldModal = (e, form) => {
    e.stopPropagation(); // Prevent opening the form
    setFormToUpdate(form);
    setAddFieldModalOpen(true);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setNewFieldRequired(false);
  };

  const closeAddFieldModal = () => {
    setAddFieldModalOpen(false);
    setFormToUpdate(null);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setNewFieldRequired(false);
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      toast.error("Please enter a field name");
      return;
    }
    
    // Validate field name format
    if (!/^[a-zA-Z][a-zA-Z0-9_\s]*$/.test(newFieldName.trim())) {
      toast.error("Field name must start with a letter and contain only letters, numbers, underscores, and spaces");
      return;
    }
    
    if (newFieldName.trim().length > 30) {
      toast.error("Field name must be less than 30 characters");
      return;
    }

    // Validate options for dropdown/radio
    if ((newFieldType === "dropdown" || newFieldType === "radiobutton")) {
      if (!newFieldOptions.trim()) {
        toast.error("Please provide options for this field type");
        return;
      }
      const options = newFieldOptions.split(",").map(opt => opt.trim()).filter(opt => opt);
      if (options.length < 2) {
        toast.error("Please provide at least 2 options");
        return;
      }
    }

    try {
      // Check if field already exists
      const existingField = formToUpdate.fields.find(
        f => f.name.toLowerCase() === newFieldName.trim().toLowerCase()
      );
      
      if (existingField) {
        toast.error(`Field "${newFieldName}" already exists in this form`);
        return;
      }

      // Create new field object
      const newField = {
        name: newFieldName.trim(),
        type: newFieldType,
        required: newFieldRequired,
        options: (newFieldType === "dropdown" || newFieldType === "radiobutton") 
          ? newFieldOptions.split(",").map(opt => opt.trim()).filter(opt => opt)
          : []
      };

      // Update form with new field
      const updatedFields = [...(formToUpdate.fields || []), newField];
      const updatedFormData = {
        ...formToUpdate,
        fields: updatedFields,
        updatedAt: new Date().toISOString()
      };

      await browserDB.collection("forms").update(formToUpdate.id, updatedFormData);
      
      // Refresh forms list
      await fetchForms();
      
      toast.success(`Field "${newFieldName}" added successfully to "${formToUpdate.formIDname}"!`);
      closeAddFieldModal();
    } catch (error) {
      console.error("Error adding field:", error);
      toast.error("Error adding field. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Get field configuration
    const selectedFormObj = forms.find((form) => form.id === selectedForm);
    const field = selectedFormObj?.fields?.find(f => f.name === name);
    
    if (type === 'radio') {
      setFormData({ ...formData, [name]: value });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Real-time validation
      if (field) {
        if (field.type === "email" && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            e.target.setCustomValidity("Please enter a valid email address");
          } else {
            e.target.setCustomValidity("");
          }
        }
        
        if (field.type === "tel" && value) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value)) {
            e.target.setCustomValidity("Please enter a valid phone number");
          } else {
            e.target.setCustomValidity("");
          }
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if form is valid
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    
    setSubmitting(true);

    try {
      const selectedFormObj = forms.find((form) => form.id === selectedForm);
      
      // Validate required fields
      const missingRequired = [];
      selectedFormObj.fields.forEach(field => {
        if (field.required) {
          const value = formData[field.name];
          if (!value || (typeof value === 'string' && !value.trim())) {
            missingRequired.push(field.name);
          }
        }
      });
      
      if (missingRequired.length > 0) {
        toast.error(`Please fill in the required fields: ${missingRequired.join(", ")}`);
        setSubmitting(false);
        return;
      }
      
      const formDataToSubmit = { 
        ...formData, 
        formId: selectedForm,
        formName: selectedFormObj.formIDname,
        submittedAt: new Date().toISOString()
      };
      
      console.log("Submitting form data:", formDataToSubmit);
      await browserDB.collection("submissions").add(formDataToSubmit);
      
      toast.success("Form submitted successfully!");
      setSelectedForm(null);
      setFormData({});
    } catch (error) {
      console.error("Error submitting form data:", error);
      toast.error("Error submitting form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field, index) => {
    const fieldName = field.name;
    const fieldType = field.type || 'text';
    const fieldOptions = field.options || [];
    const isRequired = field.required || false;

    return (
      <div key={index} className="form-field">
        <label htmlFor={fieldName}>
          {fieldName}
          {isRequired && <span className="required">*</span>}
        </label>
        
        {fieldType === "number" || fieldType === "int" ? (
          <input
            type="number"
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleInputChange}
            required={isRequired}
          />
        ) : fieldType === "date" ? (
          <input
            type="date"
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleInputChange}
            required={isRequired}
          />
        ) : fieldType === "email" ? (
          <input
            type="email"
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleInputChange}
            required={isRequired}
          />
        ) : fieldType === "tel" || fieldType === "phone" ? (
          <input
            type="tel"
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleInputChange}
            required={isRequired}
          />
        ) : fieldType === "textarea" ? (
          <textarea
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleInputChange}
            required={isRequired}
            rows="4"
          />
        ) : fieldType === "dropdown" || fieldType === "select" ? (
          <select
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleInputChange}
            required={isRequired}
          >
            <option value="">Select an option</option>
            {fieldOptions.map((option, optionIndex) => (
              <option key={optionIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : fieldType === "radiobutton" || fieldType === "radio" ? (
          <div className="radio_parent">
            {fieldOptions.length > 0 ? (
              fieldOptions.map((option, optionIndex) => (
                <div key={optionIndex} className="radio_options">
                  <input
                    type="radio"
                    id={`${fieldName}-${optionIndex}`}
                    name={fieldName}
                    value={option}
                    checked={formData[fieldName] === option}
                    onChange={handleInputChange}
                    required={isRequired && !formData[fieldName]}
                  />
                  <label htmlFor={`${fieldName}-${optionIndex}`}>
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <p className="no-options">No options available</p>
            )}
          </div>
        ) : fieldType === "checkbox" ? (
          <input
            type="checkbox"
            id={fieldName}
            name={fieldName}
            checked={formData[fieldName] || false}
            onChange={handleInputChange}
          />
        ) : (
          <input
            type="text"
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleInputChange}
            required={isRequired}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="wrapper">
        <div className="form-list">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: 'var(--text-secondary)'
          }}>
            Loading forms...
          </div>
        </div>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="wrapper">
        <div className="form-list">
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: 'var(--text-secondary)'
          }}>
            <h3>No forms available</h3>
            <p>Create a form first to see it here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="form-list">
        {forms.map((form) => (
          <div
            key={form.id}
            className="form-box"
            onClick={() => openForm(form.id)}
          >
            <h2 className="formname">{form.formIDname || 'Untitled Form'}</h2>
            <p className="form-info">
              {form.fields && form.fields.length > 0 
                ? `${form.fields.length} field${form.fields.length > 1 ? 's' : ''}`
                : 'No fields defined'}
            </p>
            <div className="form-actions">
              <button 
                className="add-field-btn"
                onClick={(e) => openAddFieldModal(e, form)}
                title="Add new field to this form"
              >
                + Add Field
              </button>
              <p className="click-to-open">Click card to fill form</p>
            </div>
          </div>
        ))}

        {/* Add Field Modal */}
        {addFieldModalOpen && (
          <div className="modal-overlay">
            <div className="modal add-field-modal">
              <div className="modal-header">
                <h2>Add Field to "{formToUpdate?.formIDname}"</h2>
                <button
                  onClick={closeAddFieldModal}
                  className="close-modal-button"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="field-config">
                  <div className="config-group">
                    <label htmlFor="field-name">Field Name *</label>
                    <input
                      type="text"
                      id="field-name"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g., Email Address"
                      autoFocus
                    />
                  </div>

                  <div className="config-group">
                    <label htmlFor="field-type">Field Type</label>
                    <select
                      id="field-type"
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="date">Date</option>
                      <option value="textarea">Text Area</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="radiobutton">Radio Buttons</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>

                  {(newFieldType === "dropdown" || newFieldType === "radiobutton") && (
                    <div className="config-group">
                      <label htmlFor="field-options">
                        Options (comma-separated) *
                      </label>
                      <input
                        type="text"
                        id="field-options"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        placeholder="e.g., Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="config-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newFieldRequired}
                        onChange={(e) => setNewFieldRequired(e.target.checked)}
                      />
                      Required field
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="cancel-btn"
                      onClick={closeAddFieldModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="add-btn"
                      onClick={handleAddField}
                    >
                      Add Field
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Fill Modal */}
        {selectedForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="form-preview">
                <div className="modal-header">
                  <h2>
                    {forms.find((form) => form.id === selectedForm)?.formIDname || 'Untitled Form'}
                  </h2>
                  <button
                    onClick={() => setSelectedForm(null)}
                    className="close-modal-button"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="form-content">
                  {(() => {
                    const selectedFormObj = forms.find((form) => form.id === selectedForm);
                    const fields = selectedFormObj?.fields || [];
                    
                    if (fields.length === 0) {
                      return (
                        <div className="no-fields">
                          <p>This form has no fields defined.</p>
                        </div>
                      );
                    }
                    
                    return fields.map((field, index) => renderField(field, index));
                  })()}
                  
                  {forms.find((form) => form.id === selectedForm)?.fields?.length > 0 && (
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormList;
