import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './style.css';

function HomeRedirect() {
  const { user, checkingAuth } = useAuth();
  if (checkingAuth) return <div className="loading-screen">Loading...</div>;
  return <Navigate to={user ? '/dashboard' : '/signup'} replace />;
}
export default function App() {
  return <AuthProvider><Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Dashboard />} /></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider>;
}
