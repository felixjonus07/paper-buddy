import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import GroupDashboard from './pages/admin/GroupDashboard';
import CashierDashboard from './pages/cashier/CashierDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/UI/ChatBot';

function App() {
  return (
    <Router>
      <div className="global-layout">
        <div className="global-content">
          <Routes>
            <Route path="/" element={<Home />} />
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
          </Routes>
        </div>
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;
