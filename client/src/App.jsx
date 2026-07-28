import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/UI/ChatBot';
import GlobalNavbar from './components/UI/GlobalNavbar';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import { AlertProvider } from './context/AlertContext';

const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const GroupDashboard = lazy(() => import('./pages/admin/GroupDashboard'));
const CashierDashboard = lazy(() => import('./pages/cashier/CashierDashboard'));
const MentorDashboard = lazy(() => import('./pages/mentor/MentorDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const CollegeDetail = lazy(() => import('./pages/superadmin/CollegeDetail'));

function App() {
  return (
    <AlertProvider>
      <Router>
        <GlobalNavbar />
        <div className="global-layout" style={{ paddingTop: '72px' }}>
          <div className="global-content">
            <ErrorBoundary>
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
                <Routes>
                  <Route path="/" element={
                    <>
                      <Home />
                      <Contact />
                    </>
                  } />
                
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/user/:username/dashboard"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/:username/dashboard"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/:username/dashboard"
                    element={
                      <ProtectedRoute requiredRole="superadmin">
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/colleges/:collegeId"
                    element={
                      <ProtectedRoute requiredRole="superadmin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/groups/:groupId"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <GroupDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cashier/:username/dashboard"
                    element={
                      <ProtectedRoute requiredRole="cashier">
                        <CashierDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mentor/:username/dashboard"
                    element={
                      <ProtectedRoute requiredRole="mentor">
                        <MentorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mentor/groups/:groupId"
                    element={
                      <ProtectedRoute requiredRole="mentor">
                        <GroupDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
          <ChatBot />
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;
