import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './form-styles.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HireVehicle from './pages/HireVehicle';
import RentVehicle from './pages/RentVehicle';
import HireOuts from './pages/HireOuts';
import Chat from './pages/Chat';

// Simple Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rent-vehicle" 
          element={
            <ProtectedRoute>
              <RentVehicle />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hire-vehicle" 
          element={
            <ProtectedRoute>
              <HireVehicle />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hire-outs" 
          element={
            <ProtectedRoute>
              <HireOuts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
