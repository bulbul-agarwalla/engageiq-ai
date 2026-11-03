import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LiveSessionPage from './pages/LiveSessionPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ReportsListPage from './pages/ReportsListPage';
import SessionReportPage from './pages/SessionReportPage';
import ExportPage from './pages/ExportPage';
import NudgePreferences from './components/NudgePreferences';
import './styles/globals.css';

function ProtectedRoute({ children, allowedRole }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#080C15',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94A3B8',
          gap: '12px',
        }}
      >
        <div className="live-pulse-dot" />
        <span>Authenticating session...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />;
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
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Application */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/app" element={<RoleHomeRedirect />} />

            {/* Instructor Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/live"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <LiveSessionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses/:id"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <CourseDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <ReportsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/sessions/:id"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <SessionReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <ExportPage />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/nudge"
              element={
                <ProtectedRoute allowedRole="student">
                  <NudgePreferences />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
