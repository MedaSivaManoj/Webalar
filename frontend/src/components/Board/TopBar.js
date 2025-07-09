import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TypingEffect from '../Auth/TypingEffect';

const ACCENT_COLORS = ["#1976d2", "#388e3c", "#d32f2f", "#fbc02d", "#7b1fa2", "#00838f"];

const TopBar = ({
  setShowModal,
  darkMode,
  setDarkMode,
  accent,
  setAccent,
  topBarBg,
  topBarBorder,
}) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 0 16px',
        zIndex: 100,
        pointerEvents: 'none',
        background: topBarBg,
        boxShadow: '0 4px 24px 0 rgba(33, 150, 243, 0.13)',
        borderBottom: topBarBorder,
        minHeight: 70,
        transition: 'box-shadow 0.2s, background 0.3s',
        backdropFilter: 'blur(6px)',
      }}
    >
      <button
        className="add-task-btn"
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          left: 0,
          background: `linear-gradient(90deg, var(--accent, ${accent}) 60%, #2196f3 100%)`,
          color: '#fff',
          fontWeight: 800,
          fontSize: 18,
          borderRadius: 10,
          border: 'none',
          boxShadow: `0 4px 16px ${accent}80`,
          padding: '12px 28px',
          letterSpacing: 1.2,
          transition: 'background 0.2s, transform 0.1s, box-shadow 0.2s',
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
        onClick={() => setShowModal(true)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowModal(true); }}
        tabIndex={0}
        aria-label="Create a new task"
        title="Create a new task"
      >
        <span style={{fontWeight: 900, fontSize: 22, marginRight: 2, verticalAlign: 'middle', display: 'flex', alignItems: 'center'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9.25" y="4" width="3.5" height="14" rx="1.75" fill="white"/><rect x="18" y="9.25" width="3.5" height="14" rx="1.75" transform="rotate(90 18 9.25)" fill="white"/></svg>
        </span>
        New Task
      </button>
      <div
        style={{
          pointerEvents: 'auto',
          fontWeight: 700,
          fontSize: '1.6rem',
          color: darkMode ? accent : '#1976d2',
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          letterSpacing: 1.1,
          textShadow: darkMode ? '0 2px 8px #222' : '0 2px 8px #bbdefb',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {user && user.username ? (
          <TypingEffect text={`Hello, ${user.username}`} speed={40} />
        ) : ''}
      </div>

      {/* Menu icon at top-right */}
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 18,
          position: 'relative',
        }}
      >
        <button
          aria-label="Open menu"
          title="Open menu"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 32px 8px 8px', // extra right padding for label
            borderRadius: 8,
            color: darkMode ? accent : '#1976d2',
            fontSize: 20,
            outline: profileOpen ? `2px solid ${accent}` : 'none',
            boxShadow: profileOpen ? `0 0 0 2px ${accent}33` : 'none',
            transition: 'box-shadow 0.2s, outline 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 0,
            minWidth: 100, // ensure enough width for icon+label
            minHeight: 44,
            overflow: 'visible',
            gap: 8,
            fontWeight: 700,
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
            maxWidth: 180,
          }}
          onClick={() => setProfileOpen(v => !v)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setProfileOpen(v => !v); }}
          tabIndex={0}
        >
          {/* Menu (hamburger) icon */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="6" width="28" height="3.5" rx="1.75" fill="currentColor"/>
            <rect y="12.25" width="28" height="3.5" rx="1.75" fill="currentColor"/>
            <rect y="18.5" width="28" height="3.5" rx="1.75" fill="currentColor"/>
          </svg>
          <span style={{fontSize: 17, color: 'inherit', fontWeight: 700, userSelect: 'none', marginLeft: 2, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100, display: 'inline-block'}}>Menu</span>
        </button>
        {profileOpen && (
          <div
            style={{
              position: 'absolute',
              top: 54,
              right: 0,
              minWidth: 240,
              background: darkMode ? '#23272f' : '#fff',
              color: darkMode ? '#fff' : '#222',
              borderRadius: 16,
              boxShadow: '0 8px 32px 0 rgba(33, 150, 243, 0.13)',
              border: darkMode ? '1.5px solid #37474f' : '1.5px solid #e3f2fd',
              zIndex: 999,
              padding: '24px 28px 18px 28px', // extra padding
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              animation: 'fadeIn 0.18s',
            }}
            tabIndex={-1}
            aria-label="Menu"
          >
            {/* X mark to close dropdown */}
            <button
              aria-label="Close menu"
              title="Close menu"
              onClick={() => setProfileOpen(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                color: darkMode ? accent : '#1976d2',
                fontSize: 22,
                cursor: 'pointer',
                borderRadius: 6,
                padding: 4,
                zIndex: 1001,
                transition: 'background 0.2s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="5" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/><line x1="15" y1="5" x2="5" y2="15" stroke="currentColor" strokeWidth="2"/></svg>
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 0',
                textAlign: 'left',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                color: darkMode ? accent : accent,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              tabIndex={0}
              aria-label="Logout"
              onClick={handleLogout}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="9" width="10" height="2" rx="1" fill="currentColor"/><rect x="13.7071" y="5.29289" width="2" height="8" rx="1" transform="rotate(45 13.7071 5.29289)" fill="currentColor"/><rect x="13.7071" y="14.7071" width="2" height="8" rx="1" transform="rotate(-45 13.7071 14.7071)" fill="currentColor"/></svg>
              Logout
            </button>
            <div style={{ fontSize: 15, color: darkMode ? '#90caf9' : accent, marginBottom: 8, fontWeight: 600 }}>Accent Color</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {ACCENT_COLORS.map(color => (
                <button
                  key={color}
                  aria-label={`Set accent color to ${color}`}
                  title={`Set accent color to ${color}`}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: color,
                    border: color === accent ? `2.5px solid ${darkMode ? '#fff' : '#1976d2'}` : '2px solid #bbb',
                    margin: '0 2px',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: color === accent ? `0 0 0 2px ${color}55` : 'none',
                    transition: 'box-shadow 0.2s, border 0.2s',
                  }}
                  onClick={() => setAccent(color)}
                  tabIndex={0}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 15 }}>Theme:</span>
              <button aria-label="Light mode" style={{padding:'4px 12px',borderRadius:6,border:!darkMode?`2px solid ${accent}`:'1.5px solid #bbb',background:!darkMode?accent+'20':'#fff',color:!darkMode?accent:'#222',cursor:'pointer'}} onClick={e=>{e.stopPropagation();setDarkMode(false);}}>Light</button>
              <button aria-label="Dark mode" style={{padding:'4px 12px',borderRadius:6,border:darkMode?`2px solid ${accent}`:'1.5px solid #bbb',background:darkMode?accent+'20':'#23272f',color:darkMode?accent:'#fff',cursor:'pointer'}} onClick={e=>{e.stopPropagation();setDarkMode(true);}}>Dark</button>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: none; }}`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
