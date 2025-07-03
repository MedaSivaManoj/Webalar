import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/auth/login`, form);
      setUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="animated-bg">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="auth-container" style={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        border: '1px solid #e3f2fd',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        maxWidth: 420,
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ marginBottom: 24 }}>
          <img src={require('../../logo.svg').default} alt="Logo" style={{ width: 60, marginBottom: 12, filter: 'drop-shadow(0 2px 8px #90caf9)' }} />
          <h2 style={{ color: '#1976d2', fontWeight: 700, letterSpacing: 1 }}>Welcome Back</h2>
          <p style={{ color: '#555', fontSize: '1rem', margin: 0 }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <input name="email" placeholder="Email" onChange={handleChange} required style={{ borderRadius: 8, border: '1px solid #90caf9', background: '#f8fbff' }} />
          <input
            name="password"
            placeholder="Password"
            type="password"
            onChange={handleChange}
            required
            style={{ borderRadius: 8, border: '1px solid #90caf9', background: '#f8fbff' }}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" style={{ borderRadius: 8, boxShadow: '0 2px 8px #90caf9' }}>Login</button>
        </form>
        <p onClick={() => navigate("/register")}>Don't have an account? <span style={{ color: '#1976d2', textDecoration: 'underline' }}>Register</span></p>
      </div>
    </div>
  );
};

export default Login;
