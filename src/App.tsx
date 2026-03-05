// src/App.tsx
import React, { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; // Önceki adımda oluşturduğumuz Login bileşeni
import Dashboard from './pages/Dashboard'; // Birazdan oluşturacağımız ana sayfa
import NotificationManager from './components/NotificationManager';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
// Kullanıcının giriş yapıp yapmadığını kontrol eden güvenlik sarmalayıcısı
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('jwt_token');
  // Token varsa istenen sayfayı göster, yoksa login'e at
  return token ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
    {localStorage.getItem('jwt_token') && <NotificationManager />}
    
      <Routes>
        {/* Herkese açık rotalar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Sadece giriş yapmış kullanıcıların görebileceği rotalar */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Eşleşmeyen her adresi login'e yönlendir */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;