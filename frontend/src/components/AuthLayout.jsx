import { Link } from 'react-router-dom';
export default function AuthLayout({ children }) {
  return <div className="auth-page">
    <header className="navbar">
      <Link className="brand" to="/"><span className="brand-mark">◈</span><span>MyWebLink</span></Link>
      <nav><a href="#features">Features</a><a href="#about">About</a></nav>
    </header>
    <div className="blue-shape" aria-hidden="true" />
    <main className="auth-content"><section className="auth-wrap">{children}</section></main>
  </div>;
}
