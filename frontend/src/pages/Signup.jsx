import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    if (Object.values(form).some((value) => !value.trim())) return setError('All fields are required.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Unable to create account. Please try again.'); }
    finally { setLoading(false); }
  }

  return <AuthLayout><div className="auth-card">
    <div className="eyebrow">START TRACKING TODAY</div><h1>Create account</h1>
    <p className="auth-subtitle">Take control of your money, one transaction at a time.</p>
    <form onSubmit={handleSubmit}>
      <label>Full name<input name="name" placeholder="Enter your name" value={form.name} onChange={change} autoComplete="name" /></label>
      <label>Email address<input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={change} autoComplete="email" /></label>
      <label>Password<input name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={change} autoComplete="new-password" /></label>
      <label>Confirm password<input name="confirmPassword" type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={change} autoComplete="new-password" /></label>
      {error && <p className="message error">{error}</p>}
      <button className="primary-btn" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
  </div></AuthLayout>;
}
