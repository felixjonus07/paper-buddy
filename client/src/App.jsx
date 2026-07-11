import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import GroupDashboard from './pages/admin/GroupDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatButton from './components/AI/AIChatButton';

function App() {
  return (
    <Router>
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
      </Routes>
      <AIChatButton />
    </Router>
  );
}

export default App;
