import React from "react";

const DarkModeToggle = ({ darkMode, onToggle }) => (
  <button
    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 22,
      marginLeft: 8,
      color: darkMode ? "#fff" : "#1976d2",
      outline: "none",
      display: "flex",
      alignItems: "center",
      transition: "color 0.2s",
    }}
    onClick={onToggle}
    tabIndex={0}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
  >
    {darkMode ? (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" fill="#fff" stroke="#1976d2" strokeWidth="2"/><path d="M11 3a8 8 0 0 0 0 16 8 8 0 0 1 0-16z" fill="#1976d2"/></svg>
    ) : (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" fill="#1976d2" stroke="#1976d2" strokeWidth="2"/><path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.64 5.64l1.42 1.42M15.54 15.54l1.42 1.42M5.64 16.36l1.42-1.42M15.54 6.46l1.42-1.42" stroke="#fff" strokeWidth="1.5"/></svg>
    )}
  </button>
);

export default DarkModeToggle;
