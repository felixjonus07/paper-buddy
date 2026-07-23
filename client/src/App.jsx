import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admission from './pages/Admission';
import Contact from './pages/Contact';
import Login from './pages/Login';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import GroupDashboard from './pages/admin/GroupDashboard';
import CashierDashboard from './pages/cashier/CashierDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import CollegeDetail from './pages/superadmin/CollegeDetail';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/UI/ChatBot';
import GlobalNavbar from './components/UI/GlobalNavbar';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

import { AlertProvider } from './context/AlertContext';

function App() {
  return (
    <AlertProvider>
      <Router>
        <GlobalNavbar />
        <div className="global-layout" style={{ marginTop: '72px' }}> {/* Add margin top to account for fixed navbar */}
          <div className="global-content">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admission" element={<Admission />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/user/dashboard"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/superadmin/dashboard"
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
                  path="/cashier/dashboard"
                  element={
                    <ProtectedRoute requiredRole="cashier">
                      <CashierDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor/dashboard"
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
            </ErrorBoundary>
          </div>
          <ChatBot />
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;
