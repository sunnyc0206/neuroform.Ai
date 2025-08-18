import React, { useState, useEffect } from 'react';
import browserDB from '../Database/browserDB';
import SubmissionsModal from './submissionModal';
import './data.css';

const DataRender = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all forms
        const formSnapshot = await browserDB.collection('forms').get();
        console.log('Forms fetched:', formSnapshot);

        // Create a map of form IDs to form names
        const formMap = {};
        formSnapshot.forEach(formDoc => {
          const formId = formDoc.id;
          formMap[formId] = formDoc.formIDname || formDoc.name || 'Untitled Form';
        });

        // Fetch all submissions
        const submissionSnapshot = await browserDB.collection('submissions').get();
        console.log('Submissions fetched:', submissionSnapshot);
        
        // Group submissions by form ID
        const formData = {};

        submissionSnapshot.forEach(doc => {
          const submissionData = doc.data || doc;
          const formId = submissionData.formId || submissionData.formID;
          
          if (!formId) {
            console.warn('Submission without formId:', doc);
            return;
          }
          
          if (!formData[formId]) {
            formData[formId] = {
              id: formId,
              formName: formMap[formId] || 'Unknown Form',
              submissions: []
            };
          }
          
          formData[formId].submissions.push({
            id: doc.id || `${formId}_${Date.now()}`,
            ...submissionData
          });
        });

        // Also include forms that have no submissions yet
        Object.keys(formMap).forEach(formId => {
          if (!formData[formId]) {
            formData[formId] = {
              id: formId,
              formName: formMap[formId],
              submissions: []
            };
          }
        });

        // Convert to array and sort
        const sortedForms = Object.values(formData).map(form => ({
          ...form,
          submissions: form.submissions.sort((a, b) => {
            // Sort by timestamp if available, otherwise by ID
            if (a.timestamp && b.timestamp) {
              return new Date(b.timestamp) - new Date(a.timestamp);
            }
            return (a.id || '').localeCompare(b.id || '');
          })
        }));

        console.log('Processed forms:', sortedForms);
        setForms(sortedForms);
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFormClick = async (formId) => {
    console.log('Form clicked:', formId);
    setSelectedForm(formId);

    try {
      // Find the form data from our already fetched data
      const selectedFormData = forms.find(f => f.id === formId);
      
      if (selectedFormData) {
        console.log('Selected form submissions:', selectedFormData.submissions);
        setSubmissions(selectedFormData.submissions);
        setModalOpen(true);
      } else {
        // If not found in cache, fetch directly
        const submissionSnapshot = await browserDB.collection('submissions').get();
        const formSubmissions = submissionSnapshot
          .filter(doc => {
            const submissionData = doc.data || doc;
            return (submissionData.formId === formId || submissionData.formID === formId);
          })
          .map(doc => ({
            id: doc.id || `${formId}_${Date.now()}`,
            ...(doc.data || doc)
          }));
        
        console.log('Fetched submissions for form:', formSubmissions);
        setSubmissions(formSubmissions);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // Still open modal even if there's an error
      setSubmissions([]);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedForm(null);
    setSubmissions([]);
  };

  if (loading) {
    return (
      <div className="formlist">
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
    );
  }

  if (forms.length === 0) {
    return (
      <div className="formlist">
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: 'var(--text-secondary)'
        }}>
          <h3>No forms available</h3>
          <p>Create a form first to see submissions here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="formlist">
      {forms.map(form => {
        return (
          <div key={form.id} className="form-box" onClick={() => handleFormClick(form.id)}>
            <h2>{form.formName}</h2>
            <p>Number of Submissions: {form.submissions.length}</p>
          </div>
        );
      })}
      <SubmissionsModal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        submissions={submissions}
        formName={forms.find(f => f.id === selectedForm)?.formName}
      />
    </div>
  );
};

export default DataRender;
