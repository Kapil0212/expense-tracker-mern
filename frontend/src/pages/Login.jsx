import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    if (!form.email.trim() || !form.password) return setError('Email and password are required.');
    setLoading(true);
    try { await login(form); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Unable to log in. Please try again.'); }
    finally { setLoading(false); }
  }
  return <AuthLayout><div className="auth-card">
    <div className="eyebrow">WELCOME BACK</div><h1>Login</h1>
    <p className="auth-subtitle">Sign in to view and manage your finances.</p>
    <form onSubmit={handleSubmit}>
      <label>Email address<input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={change} autoComplete="email" /></label>
      <label>Password<input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={change} autoComplete="current-password" /></label>
      {error && <p className="message error">{error}</p>}
      <button className="primary-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
    </form>
    <p className="auth-switch">Don't have an account? <Link to="/signup">Create one</Link></p>
  </div></AuthLayout>;
}
