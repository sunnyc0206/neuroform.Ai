import React, { useEffect, useState } from "react";
import browserDB from "./Database/browserDB";
import ConfirmationModal from "./ConfirmationModal.jsx";
import "./DynamicForm.css";
import toast from "react-hot-toast";

const DynamicForm = ({ formFields, formName, updateFormFields, updateFormName }) => {
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [fields, setFields] = useState(formFields);
  const [Name, setName] = useState(formName);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [formNameError, setFormNameError] = useState("");
  
  // Add Field Modal States
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  useEffect(() => {
    setFields(formFields);
    setName(formName);
  }, [formFields, formName]);

  useEffect(() => {
    updateFormFields(fields);
  }, [fields, updateFormFields]);

  const validateFormName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Form name is required";
    }
    if (name.trim().length < 3) {
      return "Form name must be at least 3 characters";
    }
    if (name.trim().length > 50) {
      return "Form name must be less than 50 characters";
    }
    return "";
  };

  const validateFieldName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Field name is required";
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_\s]*$/.test(name)) {
      return "Field name must start with a letter and contain only letters, numbers, underscores, and spaces";
    }
    return "";
  };

  const openAddFieldModal = () => {
    setAddFieldModalOpen(true);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setNewFieldRequired(false);
  };

  const closeAddFieldModal = () => {
    setAddFieldModalOpen(false);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setNewFieldRequired(false);
  };

  const handleAddField = () => {
    // Validate field name
    const fieldNameError = validateFieldName(newFieldName);
    if (fieldNameError) {
      toast.error(fieldNameError);
      return;
    }

    // Check for duplicate field names
    const isDuplicate = fields.some(
      field => field.name.toLowerCase() === newFieldName.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error("A field with this name already exists");
      return;
    }

    // Validate options for dropdown and radio
    if ((newFieldType === "dropdown" || newFieldType === "radiobutton") && !newFieldOptions.trim()) {
      toast.error("Please provide options for " + newFieldType);
      return;
    }

    // Create new field object
    const newField = {
      name: newFieldName.trim(),
      type: newFieldType,
      required: newFieldRequired
    };

    // Add options if needed
    if (newFieldType === "dropdown" || newFieldType === "radiobutton") {
      newField.options = newFieldOptions.split(",").map(opt => opt.trim()).filter(opt => opt);
    }

    // Add the field
    setFields([...fields, newField]);
    
    // Close modal
    closeAddFieldModal();
  };

  const addField = () => {
    openAddFieldModal();
  };

  const handleOpenModal = () => {
    if (!Name || typeof Name !== "string" || Name.trim() === "") {
      const name = prompt("Enter form name");
      if (name) {
        const error = validateFormName(name);
        if (error) {
          toast.error(error);
          return;
        }
        setName(name);
        setFormNameError("");
      }
      return;
    }
    
    const error = validateFormName(Name);
    if (error) {
      setFormNameError(error);
      return;
    }
    
    if (fields.length === 0) {
      toast.error("Please add at least one field to the form");
      return;
    }
    
    setFormNameError("");
    setConfirmationModalOpen(true);
  };

  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    handleCloseModal();
    handleSubmit(e);
  };

  const removeField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form name first
      if (!Name || Name.trim().length === 0) {
        toast.error("Please enter a form name");
        const nameInput = document.querySelector('.form-name-input');
        if (nameInput) nameInput.focus();
        return;
      }
      
      const formNameToUse = Name.trim();
      
      // Final validation with minimum 3 characters
      const nameError = validateFormName(formNameToUse);
      if (nameError) {
        toast.error(nameError);
        const nameInput = document.querySelector('.form-name-input');
        if (nameInput) nameInput.focus();
        return;
      }
      
      if (fields.length === 0) {
        toast.error("Cannot save a form without fields");
        return;
      }
      
      // Step 1: Check if form with this name already exists
      console.log("Checking for existing form with name:", formNameToUse);
      const existingForms = await browserDB.collection("forms").get();
      const existingForm = existingForms.find(form => form.formIDname === formNameToUse);
      
      let formId;
      
      if (existingForm) {
        // Update existing form
        console.log("Found existing form, updating:", existingForm.id);
        
        // Merge new fields with existing fields (avoiding duplicates)
        const existingFieldNames = existingForm.fields.map(f => f.name.toLowerCase());
        const newFields = fields.filter(field => !existingFieldNames.includes(field.name.toLowerCase()));
        const mergedFields = [...existingForm.fields, ...newFields];
        
        const updatedFormData = {
          formIDname: formNameToUse,
          fields: mergedFields.map(field => ({
            name: field.name,
            type: field.type,
            options: field.options || [],
            required: field.required || false
          })),
          updatedAt: new Date().toISOString()
        };
        
        await browserDB.collection("forms").update(existingForm.id, updatedFormData);
        formId = existingForm.id;
        console.log("✅ Form updated successfully with ID:", formId);
        toast.success(`✅ Form "${formNameToUse}" has been updated successfully!`);
        
      } else {
        // Create new form
        console.log("Creating new form:", formNameToUse);
        
        const formData = {
          formIDname: formNameToUse,
          fields: fields.map(field => ({
            name: field.name,
            type: field.type,
            options: field.options || [],
            required: field.required || false
          })),
          createdAt: new Date().toISOString()
        };

        console.log("Saving form structure:", formData);
        const formDoc = await browserDB.collection("forms").add(formData);
        formId = formDoc.id;
        console.log("✅ New form created with ID:", formId);
        toast.success(`✅ Form "${formNameToUse}" has been created successfully!`);
        // Close the modal after successful save
        if (window.closeFormPreview) {
          window.closeFormPreview();
        }
      }

      // Step 2: Validate and collect form submission data
      const formDataSubmission = {};
      const validationErrors = {};
      
      fields.forEach(field => {
        let value = null;
        
        if (field.type === "radiobutton") {
          const selectedRadiobutton = document.querySelector(
            `input[name="${field.name}"]:checked`
          );
          if (selectedRadiobutton) {
            value = selectedRadiobutton.value;
          }
        } else if (field.type === "dropdown") {
          const selectedDropdown = document.querySelector(
            `select[name="${field.name}"]`
          );
          if (selectedDropdown && selectedDropdown.value !== "") {
            value = selectedDropdown.value;
          }
        } else {
          const fieldElement = document.getElementById(field.name);
          if (fieldElement && fieldElement.value) {
            value = fieldElement.value;
            
            // Type-specific validation
            if (field.type === "email" && value) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                validationErrors[field.name] = "Invalid email address";
              }
            }
            
            if (field.type === "tel" && value) {
              const phoneRegex = /^[\d\s\-\+\(\)]+$/;
              if (!phoneRegex.test(value)) {
                validationErrors[field.name] = "Invalid phone number";
              }
            }
            
            if (field.type === "number" && value) {
              if (isNaN(value)) {
                validationErrors[field.name] = "Must be a valid number";
              }
            }
          }
        }
        
        if (value !== null && value !== undefined && value !== "") {
          formDataSubmission[field.name] = value;
        }
      });

      // Show validation errors if any
      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, error]) => `${field}: ${error}`)
          .join("\n");
        toast.error(`Please fix the following errors:\n${errorMessages}`);
        return;
      }

      // Step 3: Save submission data only if any fields were filled
      if (Object.keys(formDataSubmission).length > 0) {
        console.log("Saving submission data:", formDataSubmission);
        const submission = await browserDB.collection("submissions").add({
          formId: formId,
          formName: formNameToUse,
          data: formDataSubmission,
          submittedAt: new Date().toISOString()
        });
        console.log("✅ Submission saved with ID:", submission.id);
        
        // Clear form fields after successful submission
        fields.forEach(field => {
          if (field.type === "radiobutton") {
            const radioButtons = document.querySelectorAll(
              `input[name="${field.name}"]`
            );
            radioButtons.forEach(radio => radio.checked = false);
          } else if (field.type === "dropdown") {
            const dropdown = document.querySelector(`select[name="${field.name}"]`);
            if (dropdown) dropdown.value = "";
          } else {
            const input = document.getElementById(field.name);
            if (input) input.value = "";
          }
        });
        
        setFormData({});
        setErrors({});
      }
      
    } catch (error) {
      console.error("❌ Error saving form/submission:", error);
      toast.error("❌Opps!Error saving form");
    }
  };

  const handleAddOption = (fieldIndex) => {
    const newFields = [...fields];
    const selectedField = newFields[fieldIndex];
    const newOption = prompt("Enter the new option");
    if (newOption && newOption.trim()) {
      selectedField.options = selectedField.options
        ? [...selectedField.options, newOption.trim()]
        : [newOption.trim()];
      setFields(newFields);
    }
  };

  const handleRemoveOption = (fieldIndex) => {
    const newFields = [...fields];
    const selectedField = newFields[fieldIndex];
    const optionToRemove = prompt(
      `Enter the option to remove from: ${selectedField.options?.join(", ")}`
    );
    if (optionToRemove && selectedField.options) {
      selectedField.options = selectedField.options.filter(
        (opt) => opt !== optionToRemove
      );
      setFields(newFields);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    // Real-time validation for specific types
    if (type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors({ ...errors, [name]: "Invalid email format" });
      }
    }
  };

  const handleFormNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    
    // Show validation error in real-time
    if (value.trim().length > 0) {
      const error = validateFormName(value);
      setFormNameError(error);
    } else {
      setFormNameError(""); // Don't show error for empty field until submit
    }
    
    // Update parent component's form name if callback provided
    if (updateFormName) {
      updateFormName(value);
    }
  };

  return (
    <div className="dynamic-form-container">
      {/* Form Header Section */}
      <div className="form-header-section">
        <div className="form-title-wrapper">
          <div className="form-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div className="form-title-content">
            <input
              type="text"
              className={`form-name-input ${formNameError ? 'error' : ''}`}
              placeholder="Enter form name (min. 3 characters)..."
              value={Name}
              onChange={handleFormNameChange}
              required
              minLength="3"
              maxLength="50"
            />
            {formNameError && <span className="error-message">{formNameError}</span>}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-fields-container">
          {fields.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <h3>No fields added yet</h3>
              <p>Start by adding fields to your form using the chat interface</p>
            </div>
          ) : (
            <>
              <div className="fields-grid">
                {fields.map((field, index) => (
                  <div key={index} className={`form-field-wrapper ${field.type === 'textarea' ? 'full-width' : ''}`}>
                    <div className="field-header">
                      <label htmlFor={field.name} className="field-label">
                        {field.label || field.name}
                        {field.required && <span className="required-indicator">*</span>}
                      </label>
                      <button
                        type="button"
                        className="field-delete-btn"
                        onClick={() => removeField(index)}
                        title="Delete field"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="field-input-wrapper">
                      {field.type === "textarea" ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          className={`form-textarea ${errors[field.name] ? 'error' : ''}`}
                          placeholder={`Enter ${field.label || field.name}...`}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          required={field.required}
                          rows="4"
                        />
                      ) : field.type === "dropdown" ? (
                        <div className="dropdown-wrapper">
                          <select
                            id={field.name}
                            name={field.name}
                            className={`form-select ${errors[field.name] ? 'error' : ''}`}
                            value={formData[field.name] || ""}
                            onChange={handleInputChange}
                            required={field.required}
                          >
                            <option value="">Choose {field.label || field.name}</option>
                            {field.options?.map((option, optIndex) => (
                              <option key={optIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <div className="option-actions">
                            <button
                              type="button"
                              className="option-btn"
                              onClick={() => handleAddOption(index)}
                              title="Add option"
                            >
                              + Add Option
                            </button>
                            {field.options && field.options.length > 0 && (
                              <button
                                type="button"
                                className="option-btn remove"
                                onClick={() => handleRemoveOption(index)}
                                title="Remove option"
                              >
                                Remove Option
                              </button>
                            )}
                          </div>
                        </div>
                      ) : field.type === "radiobutton" ? (
                        <div className="radio-wrapper">
                          <div className="radio-group">
                            {field.options?.map((option, optIndex) => (
                              <label key={optIndex} className="radio-label">
                                <input
                                  type="radio"
                                  name={field.name}
                                  value={option}
                                  checked={formData[field.name] === option}
                                  onChange={handleInputChange}
                                  required={field.required}
                                  className="radio-input"
                                />
                                <span className="radio-custom"></span>
                                <span className="radio-text">{option}</span>
                              </label>
                            ))}
                          </div>
                          <div className="option-actions">
                            <button
                              type="button"
                              className="option-btn"
                              onClick={() => handleAddOption(index)}
                              title="Add option"
                            >
                              + Add Option
                            </button>
                            {field.options && field.options.length > 0 && (
                              <button
                                type="button"
                                className="option-btn remove"
                                onClick={() => handleRemoveOption(index)}
                                title="Remove option"
                              >
                                Remove Option
                              </button>
                            )}
                          </div>
                        </div>
                      ) : field.type === "checkbox" ? (
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            id={field.name}
                            name={field.name}
                            className="checkbox-input"
                            checked={formData[field.name] || false}
                            onChange={handleInputChange}
                            required={field.required}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="checkbox-text">I agree to the terms</span>
                        </label>
                      ) : (
                        <input
                          type={field.type || "text"}
                          id={field.name}
                          name={field.name}
                          className={`form-input ${errors[field.name] ? 'error' : ''}`}
                          placeholder={`Enter ${field.label || field.name}...`}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          required={field.required}
                          min={field.type === "number" ? field.min : undefined}
                          max={field.type === "number" ? field.max : undefined}
                        />
                      )}
                      {errors[field.name] && (
                        <span className="field-error-message">{errors[field.name]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add Field Button */}
              <div className="add-field-section">
                <button type="button" className="add-field-btn" onClick={addField}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Add New Field
                </button>
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        {fields.length > 0 && (
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => {
              setFormData({});
              setErrors({});
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Reset Form
            </button>
            <button type="submit" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Form
            </button>
          </div>
        )}
      </form>

      {/* Add Field Modal */}
      {addFieldModalOpen && (
        <div className="modal-overlay" onClick={closeAddFieldModal}>
          <div className="modal add-field-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Field</h2>
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
    </div>
  );
};

export default DynamicForm;
