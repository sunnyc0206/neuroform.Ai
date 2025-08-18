import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFormCreatorClick = () => {
    navigate("/");
  };

  const handleFormListClick = () => {
    navigate("/form-list");
  };

  const handleDataListClick = () => {
    navigate("/data-list");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">Main</div>
        <button
          onClick={handleFormCreatorClick}
          className={location.pathname === "/" ? "active" : ""}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          Form Creator
        </button>
        <button
          onClick={handleFormListClick}
          className={location.pathname === "/form-list" ? "active" : ""}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          Form List
        </button>
        <button
          onClick={handleDataListClick}
          className={location.pathname === "/data-list" ? "active" : ""}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"></path>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
          </svg>
          My Submissions
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
