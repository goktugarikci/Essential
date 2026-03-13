// src/App.tsx
import React, { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalar
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';

// Yeni Soket ve Senkronizasyon Yapısı
import { WebSocketProvider } from './contexts/WebSocketContext';
import { useBackgroundSync } from './hooks/useBackgroundSync';

// Kullanıcının giriş yapıp yapmadığını kontrol eden güvenlik sarmalayıcısı
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
  // Token varsa istenen sayfayı göster, yoksa login'e at
  return token ? children : <Navigate to="/login" replace />;
};

// Router içindeki işlemleri ve arka plan senkronizasyonunu yöneten iç bileşen
const AppContent = () => {
  // 30 saniyede bir arkada bildirim ve arkadaş listesini günceller
  useBackgroundSync(30000); 

  return (
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
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* 🚨 DÜZELTME: NotificationManager BURADAN KALDIRILDI! 
          Artık sadece Dashboard.tsx'in üst barında şık bir şekilde duracak. */}
      
      {/* Tüm sistemi tek bir soket hattına bağlar */}
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
      
    </BrowserRouter>
  );
};

export default App;