import React, { useState, useContext } from "react";
import TypingEffect from "./TypingEffect";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/auth/login`, form);
      setUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Add global styles for spinner and shake animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #fceabb 0%, #f8b500 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background gradients and complex shapes */}
      <div className="animated-bg">
        {/* Animated gradient waves */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: 180, zIndex: 0 }} viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,80 C360,180 1080,0 1440,100 L1440,0 L0,0 Z" fill="#fffde4" opacity="0.7">
            <animate attributeName="d" dur="6s" repeatCount="indefinite"
              values="M0,80 C360,180 1080,0 1440,100 L1440,0 L0,0 Z;M0,100 C400,0 1040,180 1440,80 L1440,0 L0,0 Z;M0,80 C360,180 1080,0 1440,100 L1440,0 L0,0 Z" />
          </path>
        </svg>
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100vw', height: 180, zIndex: 0 }} viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,100 C400,0 1040,180 1440,80 L1440,180 L0,180 Z" fill="#ffe29f" opacity="0.7">
            <animate attributeName="d" dur="7s" repeatCount="indefinite"
              values="M0,100 C400,0 1040,180 1440,80 L1440,180 L0,180 Z;M0,80 C360,180 1080,0 1440,100 L1440,180 L0,180 Z;M0,100 C400,0 1040,180 1440,80 L1440,180 L0,180 Z" />
          </path>
        </svg>
        {/* Animated floating squares */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 12}%`,
            top: `${10 + (i % 2) * 60}px`,
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #fffde4 0%, #f8b500 100%)',
            opacity: 0.18 + (i % 3) * 0.07,
            borderRadius: 8,
            animation: `floatSquare${i % 4} 6s ease-in-out infinite`,
            zIndex: 0
          }} />
        ))}
      </div>
      <div className="auth-page-container" style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 1100,
        zIndex: 2,
        position: 'relative',
        minHeight: 540,
        boxSizing: 'border-box',
        padding: '2vw 0',
      }}>
        {/* Left: Project Name Typing Effect */}
        <div className="auth-welcome-container" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '2rem 1rem',
          minWidth: 320,
          maxWidth: 440,
          zIndex: 2,
        }}>
          <div style={{
            background: 'linear-gradient(120deg, #f8b500 60%, #fceabb 100%)',
            borderRadius: 18,
            boxShadow: '0 8px 32px 0 #ffe29f',
            padding: '2.5rem 1.5rem',
            width: '100%',
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)',
          }}>
            <img src={require('../../logo.svg').default} alt="Logo" style={{ width: 70, marginBottom: 18, filter: 'drop-shadow(0 2px 8px #fff)' }} />
            <span style={{
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '2.1rem',
              color: '#fff',
              letterSpacing: 1.2,
              textShadow: '0 2px 16px #f8b500, 0 1px 0 #fffde4',
              background: 'linear-gradient(90deg, #f8b500 40%, #fffde4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
              marginBottom: 0,
              textAlign: 'center',
              lineHeight: 1.2
            }}>
              Real-Time collaborative to do board
            </span>
          </div>
        </div>
        {/* Right: Login Form */}
        <div className="auth-container auth-form-container" style={{
          background: 'linear-gradient(135deg, #fffde4 0%, #fff 100%)',
          boxShadow: '0 8px 32px 0 #ffe29f',
          border: '1px solid #ffe29f',
          borderRadius: '18px',
          padding: '2.5rem 2rem',
          maxWidth: 420,
          minWidth: 320,
          width: '100%',
          position: 'relative',
          zIndex: 2,
          marginLeft: 32,
          transition: 'box-shadow 0.2s, transform 0.2s',
          animation: 'popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
        tabIndex={0}
        onFocus={e => e.currentTarget.style.boxShadow = '0 8px 32px 0 #f8b500'}
        onBlur={e => e.currentTarget.style.boxShadow = '0 8px 32px 0 #ffe29f'}
        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'}
        onMouseOut={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h2 style={{ color: '#f8b500', fontWeight: 800, letterSpacing: 1, fontSize: 28, marginBottom: 4, textShadow: '0 2px 8px #fffde4, 0 1px 0 #f8b500' }}>Welcome Back</h2>
            <p style={{ color: '#b28704', fontSize: '1rem', margin: 0, fontWeight: 600 }}>Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off" style={{ width: '100%' }}>
            <div style={{ position: 'relative', marginBottom: 18, width: '100%' }}>
              <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#f8b500', fontSize: 18, pointerEvents: 'none' }} />
              <input
                name="email"
                placeholder="Email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                onChange={handleChange}
                required
                style={{
                  borderRadius: 8,
                  border: '1.5px solid #f8b500',
                  background: '#fffde4',
                  paddingLeft: 40,
                  height: 40,
                  width: '100%',
                  fontSize: 16,
                  boxShadow: '0 1px 4px #ffe29f',
                  transition: 'box-shadow 0.2s',
                  marginBottom: 0,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#b28704',
                }}
              />
            </div>
            <div style={{ position: 'relative', marginBottom: 18, width: '100%' }}>
              <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#f8b500', fontSize: 18, pointerEvents: 'none' }} />
              <input
                name="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                onChange={handleChange}
                required
                style={{
                  borderRadius: 8,
                  border: '1.5px solid #f8b500',
                  background: '#fffde4',
                  paddingLeft: 40,
                  height: 40,
                  width: '100%',
                  fontSize: 16,
                  boxShadow: '0 1px 4px #ffe29f',
                  transition: 'box-shadow 0.2s',
                  marginBottom: 0,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#b28704',
                }}
              />
              <span
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#f8b500', fontSize: 18, background: 'none', border: 'none', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {error && (
              <p className="error" style={{
                color: '#d32f2f',
                background: '#fff3f3',
                borderRadius: 6,
                padding: '8px 12px',
                margin: '0 0 12px 0',
                fontWeight: 500,
                boxShadow: '0 2px 8px #ffcdd2',
                animation: 'shake 0.3s'
              }}>{error}</p>
            )}
            <button
              type="submit"
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px #ffe29f',
                background: loading ? '#ffe29f' : 'linear-gradient(90deg, #f8b500 60%, #ffe29f 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                padding: '10px 0',
                marginTop: 4,
                width: '100%',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
                letterSpacing: 1.1,
              }}
              disabled={loading}
              className="login-btn"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="spinner" style={{
                    width: 18, height: 18, border: '3px solid #fff', borderTop: '3px solid #ffe29f', borderRadius: '50%', display: 'inline-block', marginRight: 8, animation: 'spin 0.7s linear infinite', verticalAlign: 'middle'
                  }}></span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <p onClick={() => navigate("/register")}
            style={{ marginTop: 18, color: '#b28704', cursor: 'pointer', fontSize: 15, textAlign: 'center' }}
          >
            Don't have an account?{' '}
            <span style={{ color: '#f8b500', textDecoration: 'underline', fontWeight: 600 }}>Register</span>
          </p>
        </div>
      </div>
      {/* Keyframes for popIn, floatSquare, and SVG wave animation */}
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatSquare0 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-18px);} }
        @keyframes floatSquare1 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(12px);} }
        @keyframes floatSquare2 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        @keyframes floatSquare3 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(16px);} }
      `}</style>
    </div>
  );
};

export default Login;
