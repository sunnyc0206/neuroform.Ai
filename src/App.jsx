import React from 'react';
import DynamicForm from './components/DynamicForm';
import FormCreator from './components/FormCreater';
import DataRender from './components/Data/dataRender';
import "./App.css";
import FormList from './components/FormList';
import Help from './components/Help';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import BirdsBackground from './components/BirdsBackground';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
      <div className="app">
      {/* LeetCode Style Header with Navigation */}
      <div className="app-header">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          <div className="logo-text">
            <span className="logo-main">NeuroForm</span>
            <span className="logo-accent">.AI</span>
          </div>
        </div>

        <div className="nav-menu">
          <button 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => handleNavClick('/')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span>Form Creator</span>
          </button>
          <button 
            className={`nav-item ${location.pathname === '/form-list' ? 'active' : ''}`}
            onClick={() => handleNavClick('/form-list')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Form List</span>
          </button>
          <button 
            className={`nav-item ${location.pathname === '/data-list' ? 'active' : ''}`}
            onClick={() => handleNavClick('/data-list')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Data List</span>
          </button>
          <button 
            className={`nav-item ${location.pathname === '/help' ? 'active' : ''}`}
            onClick={() => handleNavClick('/help')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Help</span>
          </button>
        </div>

        <div className="header-actions">
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Connected</span>
          </div>
          
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          <div className="user-menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content - No Sidebar */}
      <div className="main-content">
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<FormCreator />} />
            <Route path="/form-list" element={<FormList />} />
            <Route path="/data-list" element={<DataRender />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="main_app">
      <BirdsBackground />
      <Router>
        <AppContent />
    </Router>
    <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;
