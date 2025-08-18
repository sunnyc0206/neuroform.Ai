import React, { useState, useRef, useCallback, useEffect } from "react";
import compromise from "compromise";
import suggestions from "./suggestions";
import "./form.css";
import DynamicForm from "./DynamicForm";

const FormCreator = () => {
  const [chatMessages, setChatMessages] = useState([
    { user: false, message: `Hi! I'm your AI Form Builder Assistant 🤖\n\nI can help you create forms using natural language. Just tell me what you need!\n\nTry saying things like:\n• "I need a contact form"\n• "Create a registration form"\n• "Make a survey with name, email, and feedback"\n• "Build a form for job applications"`, typing: false },
  ]);
  const [formFields, setFormFields] = useState([]);
  const [formName, setFormName] = useState("");
  const [formCreated, setFormCreated] = useState(false);
  const [askForFormName, setAskForFormName] = useState(false);
  const [command, setCommand] = useState("");
  const [showCreateFormButton, setShowCreateFormButton] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  const updateFormFields = useCallback((updatedFields) => {
    setFormFields(updatedFields);
    console.log(updatedFields);
  }, []);
  
  const updateFormName = useCallback((updatedName) => {
    setFormName(updatedName);
  }, []);

  const addBotMessage = (message) => {
    setChatMessages((prevMessages) => [...prevMessages, { user: false, message: message, typing: false }]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          addBotMessage("I didn't hear anything. Please try again.");
        } else if (event.error === 'not-allowed') {
          addBotMessage("Please allow microphone access to use voice input.");
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      addBotMessage("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        addBotMessage("Error starting speech recognition. Please try again.");
        setIsListening(false);
      }
    }
  };

  const simulateTyping = (message, isUser = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { user: isUser, message: message, typing: false },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    setCommand(e.target.value);
  };

  // Enhanced field type detection
  const detectFieldType = (fieldName, context = "") => {
    const name = fieldName.toLowerCase();
    const fullContext = (context + " " + name).toLowerCase();
    
    // Email patterns
    if (name.includes('email') || name.includes('mail') || name.includes('e-mail')) {
      return 'email';
    }
    
    // Phone patterns
    if (name.includes('phone') || name.includes('tel') || name.includes('mobile') || 
        name.includes('contact') || name.includes('number') && fullContext.includes('contact')) {
      return 'tel';
    }
    
    // Date patterns
    if (name.includes('date') || name.includes('dob') || name.includes('birth') || 
        name.includes('deadline') || name.includes('when')) {
      return 'date';
    }
    
    // Number patterns
    if (name.includes('age') || name.includes('quantity') || name.includes('amount') || 
        name.includes('price') || name.includes('cost') || name.includes('year') ||
        name.includes('zip') || name.includes('postal') || name.includes('count')) {
      return 'number';
    }
    
    // Textarea patterns
    if (name.includes('message') || name.includes('comment') || name.includes('feedback') || 
        name.includes('description') || name.includes('note') || name.includes('address') ||
        name.includes('about') || name.includes('bio') || name.includes('summary')) {
      return 'textarea';
    }
    
    // Dropdown patterns
    if (name.includes('country') || name.includes('state') || name.includes('city') || 
        name.includes('category') || name.includes('type') || name.includes('department') ||
        name.includes('role') || name.includes('position')) {
      return 'dropdown';
    }
    
    // Radio button patterns
    if (name.includes('gender') || name.includes('yes/no') || name.includes('agree') ||
        name.includes('choice') || name.includes('option')) {
      return 'radiobutton';
    }
    
    // Checkbox patterns
    if (name.includes('agree') || name.includes('terms') || name.includes('subscribe') ||
        name.includes('accept') || name.includes('confirm')) {
      return 'checkbox';
    }
    
    // Default to text
    return 'text';
  };

  // Smart form template generator
  const generateFormTemplate = (formType) => {
    const templates = {
      contact: [
        { name: 'Full Name', type: 'text' },
        { name: 'Email', type: 'email' },
        { name: 'Phone', type: 'tel' },
        { name: 'Subject', type: 'text' },
        { name: 'Message', type: 'textarea' }
      ],
      registration: [
        { name: 'First Name', type: 'text' },
        { name: 'Last Name', type: 'text' },
        { name: 'Email', type: 'email' },
        { name: 'Password', type: 'text' },
        { name: 'Phone', type: 'tel' },
        { name: 'Date of Birth', type: 'date' },
        { name: 'Country', type: 'dropdown', options: ['USA', 'Canada', 'UK', 'Australia', 'Other'] },
        { name: 'Terms and Conditions', type: 'checkbox' }
      ],
      survey: [
        { name: 'Name', type: 'text' },
        { name: 'Email', type: 'email' },
        { name: 'Age', type: 'number' },
        { name: 'Experience', type: 'dropdown', options: ['Excellent', 'Good', 'Average', 'Poor'] },
        { name: 'Feedback', type: 'textarea' },
        { name: 'Would Recommend', type: 'radiobutton', options: ['Yes', 'No', 'Maybe'] }
      ],
      job: [
        { name: 'Full Name', type: 'text' },
        { name: 'Email', type: 'email' },
        { name: 'Phone', type: 'tel' },
        { name: 'Position', type: 'dropdown', options: ['Developer', 'Designer', 'Manager', 'Other'] },
        { name: 'Years of Experience', type: 'number' },
        { name: 'Resume', type: 'text' },
        { name: 'Cover Letter', type: 'textarea' }
      ],
      feedback: [
        { name: 'Name', type: 'text' },
        { name: 'Email', type: 'email' },
        { name: 'Rating', type: 'dropdown', options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
        { name: 'Comments', type: 'textarea' }
      ],
      event: [
        { name: 'Name', type: 'text' },
        { name: 'Email', type: 'email' },
        { name: 'Phone', type: 'tel' },
        { name: 'Event Date', type: 'date' },
        { name: 'Number of Guests', type: 'number' },
        { name: 'Special Requirements', type: 'textarea' }
      ]
    };
    
    return templates[formType] || [];
  };

  // Enhanced intent detection
  const determineIntent = (parsedInput) => {
    const text = parsedInput.text().toLowerCase();
    
    // Greeting patterns
    if (text.match(/^(hi|hello|hey|good|greet)/)) {
      return "greeting";
    }
    
    // Form creation patterns - much more flexible
    if (text.includes('create') || text.includes('make') || text.includes('build') || 
        text.includes('need') || text.includes('want') || text.includes('form') ||
        text.includes('generate') || text.includes('design')) {
      
      // Check for specific form types
      if (text.includes('contact')) return "createContactForm";
      if (text.includes('registration') || text.includes('register')) return "createRegistrationForm";
      if (text.includes('survey')) return "createSurveyForm";
      if (text.includes('job') || text.includes('application')) return "createJobForm";
      if (text.includes('feedback')) return "createFeedbackForm";
      if (text.includes('event')) return "createEventForm";
      
      return "createForm";
    }
    
    // Adding fields
    if (text.includes('add') && (text.includes('field') || text.includes('input'))) {
      if (text.includes('radio')) return "addRadioButton";
      if (text.includes('drop')) return "addDropDown";
      return "addField";
    }
    
    return "unknown";
  };

  // Smart field extraction from natural language
  const extractFieldsFromNaturalLanguage = (text) => {
    const fields = [];
    
    // Remove common words
    const cleanText = text.replace(/\b(i|need|want|create|make|build|form|with|a|an|the|for|and|or|please|can|you|help|me)\b/gi, '');
    
    // Look for field patterns
    // Pattern 1: "name, email, phone" (comma separated)
    const commaPattern = cleanText.match(/([a-z\s]+)(?:,|and)/gi);
    if (commaPattern) {
      commaPattern.forEach(match => {
        const fieldName = match.replace(/,|and/gi, '').trim();
        if (fieldName) {
          const type = detectFieldType(fieldName, text);
          fields.push({
            name: fieldName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            type: type
          });
        }
      });
    }
    
    // Pattern 2: Look for specific keywords that indicate fields
    const fieldKeywords = [
      'name', 'email', 'phone', 'address', 'message', 'comment', 'feedback',
      'age', 'date', 'birth', 'gender', 'country', 'city', 'state',
      'password', 'username', 'subject', 'title', 'description'
    ];
    
    fieldKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword) && !fields.some(f => f.name.toLowerCase().includes(keyword))) {
        const type = detectFieldType(keyword, text);
        fields.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          type: type
        });
      }
    });
    
    // If no fields detected, provide helpful defaults based on context
    if (fields.length === 0) {
      // Try to detect what kind of form they want
      if (text.includes('contact')) {
        return generateFormTemplate('contact');
      }
      if (text.includes('register') || text.includes('registration')) {
        return generateFormTemplate('registration');
      }
      if (text.includes('survey')) {
        return generateFormTemplate('survey');
      }
      
      // Default basic form
      return [
        { name: 'Name', type: 'text' },
        { name: 'Email', type: 'email' },
        { name: 'Message', type: 'textarea' }
      ];
    }
    
    return fields;
  };

  const extractFields = (parsedInput) => {
    const text = parsedInput.text();
    return extractFieldsFromNaturalLanguage(text);
  };

  const extractNewField = (parsedInput) => {
    const text = parsedInput.text();
    
    // Extract field name - more intelligent extraction
    let fieldName = '';
    let fieldType = 'text';
    let options = [];
    
    // Look for field name
    const fieldMatch = text.match(/field\s+([a-z\s]+?)(?:\s+as|\s+with|\s+type|$)/i);
    if (fieldMatch) {
      fieldName = fieldMatch[1].trim();
    } else {
      // Try to extract from "add [fieldname]"
      const addMatch = text.match(/add\s+([a-z\s]+?)(?:\s+field|\s+as|\s+with|$)/i);
      if (addMatch) {
        fieldName = addMatch[1].trim();
      }
    }
    
    // Detect type
    fieldType = detectFieldType(fieldName, text);
    
    // Extract options for dropdown/radio
    const optionsMatch = text.match(/options?\s*:?\s*(.+)/i);
    if (optionsMatch) {
      options = optionsMatch[1].split(/,|and/).map(opt => opt.trim());
    }
    
    return {
      name: fieldName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      type: fieldType,
      options: options
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userMessage = command.trim();
    if (!userMessage) return;
    
    const userMessageObj = { user: true, message: userMessage, typing: false };
    setChatMessages((prevMessages) => [...prevMessages, userMessageObj]);

    const parsedInput = compromise(userMessage);
    const intent = determineIntent(parsedInput);

    // Handle specific form templates
    if (intent.startsWith("create") && intent.includes("Form")) {
      const formType = intent.replace("create", "").replace("Form", "").toLowerCase();
      const fields = generateFormTemplate(formType);
      setFormFields(fields);
      setAskForFormName(true);
      setShowCreateFormButton(false);
      setCommand("");
      simulateTyping(`Great! I've prepared a ${formType} form template for you with ${fields.length} fields. What would you like to name this form?`);
    } else if (intent === "createForm") {
      const fields = extractFields(parsedInput);
      setFormFields(fields);
      setAskForFormName(true);
      setShowCreateFormButton(false);
      setCommand("");
      simulateTyping(`Perfect! I've understood your requirements and created a form with ${fields.length} fields. What would you like to name this form?`);
    } else if (askForFormName) {
      setFormName(userMessage);
      setAskForFormName(false);
      setFormCreated(true);
      setCommand("");
      simulateTyping(`Excellent! Your form "${userMessage}" has been created with the following fields:\n\n${formFields.map(f => `• ${f.name} (${f.type})`).join('\n')}\n\n📋 Click the preview button below to view and save your form.\n\nYou can also add more fields by saying things like "add phone number" or "add dropdown for country"`);
    } else if (intent === "addField" || intent === "addRadioButton" || intent === "addDropDown") {
      const newField = extractNewField(parsedInput);
      console.log(newField);
      if (formName && !askForFormName) {
        setFormFields((prevFields) => [...prevFields, newField]);
        simulateTyping(`Added "${newField.name}" field (${newField.type}) to your form. You can continue adding more fields or click the preview button to save the form.`);
      } else {
        simulateTyping("Please create a form first. Try saying 'Create a contact form' or 'I need a registration form'");
      }
    } else if (intent === "greeting") {
      const botResponse = "Hello! I'm here to help you create forms. You can say things like:\n• 'Create a contact form'\n• 'I need a registration form'\n• 'Make a survey'\n• 'Build a form with name, email, and message'\n\nWhat would you like to create?";
      setShowCreateFormButton(true);
      simulateTyping(botResponse);
    } else {
      const botResponse = "I'm not sure what you mean. Try saying things like:\n• 'Create a contact form'\n• 'I need a registration form'\n• 'Build a form with name and email'\n• 'Add phone number field'\n\nWhat would you like to do?";
      simulateTyping(botResponse);
      setShowCreateFormButton(true);
    }
    setCommand("");
  };

  const handleSuggestionClick = (suggestion) => {
    // Add the suggestion as a user message
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { user: true, message: suggestion, typing: false }
    ]);
    
    // Process the suggestion
    setCommand("");
    const parsedInput = compromise(suggestion);
    const intent = determineIntent(parsedInput);
    
    // Handle the suggestion based on intent
    if (suggestion.toLowerCase().includes('contact form')) {
      const fields = generateFormTemplate('contact');
      setFormFields(fields);
      setAskForFormName(true);
      setShowCreateFormButton(false);
      simulateTyping(`Great! I've prepared a contact form template with ${fields.length} fields. What would you like to name this form?`);
    } else if (suggestion.toLowerCase().includes('registration')) {
      const fields = generateFormTemplate('registration');
      setFormFields(fields);
      setAskForFormName(true);
      setShowCreateFormButton(false);
      simulateTyping(`Perfect! I've created a registration form template with ${fields.length} fields. What would you like to name this form?`);
    } else if (suggestion.toLowerCase().includes('survey')) {
      const fields = generateFormTemplate('survey');
      setFormFields(fields);
      setAskForFormName(true);
      setShowCreateFormButton(false);
      simulateTyping(`Excellent! I've set up a survey form template with ${fields.length} fields. What would you like to name this form?`);
    } else if (suggestion.toLowerCase().includes('feedback')) {
      const fields = generateFormTemplate('feedback');
      setFormFields(fields);
      setAskForFormName(true);
      setShowCreateFormButton(false);
      simulateTyping(`Great! I've created a feedback form template with ${fields.length} fields. What would you like to name this form?`);
    } else if (suggestion.toLowerCase().includes('add')) {
      const newField = extractNewField(parsedInput);
      if (formName && !askForFormName) {
        setFormFields((prevFields) => [...prevFields, newField]);
        simulateTyping(`Added "${newField.name}" field (${newField.type}) to your form.`);
      }
    }
  };

  const handleCreateFormClick = () => {
    // Add as user message
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { user: true, message: "I want to create a form", typing: false }
    ]);
    
    simulateTyping("What kind of form would you like to create? You can say:\n• 'Contact form'\n• 'Registration form'\n• 'Survey form'\n• Or describe your own: 'A form with name, email, and feedback'");
    setShowCreateFormButton(false);
    inputRef.current?.focus();
  };

  const openFormPreview = () => {
    setShowFormModal(true);
  };

  const closeFormPreview = () => {
    setShowFormModal(false);
  };
  
  // Make closeFormPreview available globally for DynamicForm
  useEffect(() => {
    window.closeFormPreview = closeFormPreview;
    return () => {
      delete window.closeFormPreview;
    };
  }, []);

  return (
    <>
      <div className="chat-container">
        <div className="chat-wrapper">
          <div className="chat-header">
            {/* Removed title and status for cleaner look */}
          </div>
          
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.user ? 'user' : 'bot'}`}>
                {!msg.user && <div className="bot-avatar">🤖</div>}
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.message}</p>
                </div>
                {msg.user && <div className="user-avatar">👤</div>}
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="bot-avatar">🤖</div>
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-container">
            {/* Suggestions */}
            <div className="suggestions">
              <button onClick={() => handleSuggestionClick("Contact form with name, email, phone")}>
                Contact Form
              </button>
              <button onClick={() => handleSuggestionClick("Registration form with username, email, password")}>
                Registration
              </button>
              <button onClick={() => handleSuggestionClick("Feedback form with rating and comments")}>
                Feedback
              </button>
              <button onClick={() => handleSuggestionClick("Survey form with multiple choice questions")}>
                Survey
              </button>
            </div>

            {/* Quick Action Button */}
            <button 
              className="create-form-button" 
              onClick={handleCreateFormClick}
            >
              ✨ Quick Create Form
            </button>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="chat-input-form">
              <div className="chat-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={handleInputChange}
                  placeholder={formCreated ? "Add more fields or describe changes..." : "Describe your form naturally, e.g., 'I need a contact form'"}
                  className="chat-input"
                />
                <div className="input-actions">
                  <button 
                    type="button"
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                    title={isListening ? "Stop listening" : "Start voice input"}
                    aria-label="Voice input"
                  >
                    {isListening ? (
                      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                    )}
                  </button>
                  <button 
                    type="submit" 
                    className="send-button"
                    disabled={!command.trim() || isTyping}
                    aria-label="Send message"
                  >
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Form Preview Button */}
        {formCreated && (
          <div className="form-preview-button" onClick={openFormPreview}>
            <div className="preview-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="preview-info">
              <span className="preview-title">Form Preview</span>
              <span className="preview-subtitle">Click to view & save</span>
            </div>
            {formFields.length > 0 && <div className="preview-dot-notification"></div>}
          </div>
        )}
      </div>

      {/* Form Preview Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={closeFormPreview}>
          <div className="modal form-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Form Preview: {formName}</h2>
              <button
                onClick={closeFormPreview}
                className="close-modal-button"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <DynamicForm
                formFields={formFields}
                formName={formName}
                updateFormFields={updateFormFields}
                updateFormName={updateFormName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormCreator;
