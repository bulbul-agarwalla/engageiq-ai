import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseDetailPage from './pages/CourseDetailPage';
import ReportsListPage from './pages/ReportsListPage';
import SessionReportPage from './pages/SessionReportPage';
import ExportPage from './pages/ExportPage';
import NudgePreferences from './components/NudgePreferences';
import './styles/globals.css';

function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Loading session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleHomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleHomeRedirect />} />
            <Route path="student" element={<StudentDashboard />} />
            <Route path="teacher" element={<TeacherDashboard />} />
            <Route path="teacher/courses/:id" element={<CourseDetailPage />} />
            <Route path="reports" element={<ReportsListPage />} />
            <Route path="reports/sessions/:id" element={<SessionReportPage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="settings/nudge" element={<NudgePreferences />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
