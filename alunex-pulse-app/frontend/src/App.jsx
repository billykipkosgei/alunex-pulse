import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import TimeTracking from './pages/TimeTracking';
import Tasks from './pages/Tasks';
import Departments from './pages/Departments';
import DepartmentAnalytics from './pages/DepartmentAnalytics';
import Chat from './pages/Chat';
import Files from './pages/Files';
import Reports from './pages/Reports';
import Video from './pages/Video';
import Settings from './pages/Settings';

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/time-tracking" element={<Layout><TimeTracking /></Layout>} />
      <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
      <Route path="/departments" element={<Layout><Departments /></Layout>} />
      <Route path="/department-analytics" element={<Layout><DepartmentAnalytics /></Layout>} />
      <Route path="/chat" element={<Layout><Chat /></Layout>} />
      <Route path="/files" element={<Layout><Files /></Layout>} />
      <Route path="/reports" element={<Layout><Reports /></Layout>} />
      <Route path="/video" element={<Layout><Video /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
