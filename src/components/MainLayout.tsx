import React from 'react';

interface MainLayoutProps {
  sidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ sidebarContent, mainContent }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1e1e24', color: '#fff', overflow: 'hidden' }}>
      
      {/* 1. SÜTUN: Sunucular Listesi (En Sol) */}
      <div style={{ width: '70px', backgroundColor: '#18181b', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: '10px' }}>
        {/* Ana Sayfa / DM İkonu */}
        <div style={{ width: '48px', height: '48px', backgroundColor: '#5865F2', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
          🏠
        </div>
        <div style={{ width: '40px', height: '2px', backgroundColor: '#2f3136' }} /> {/* Ayırıcı çizgi */}
        
        {/* Örnek Sunucu İkonları */}
        <div style={{ width: '48px', height: '48px', backgroundColor: '#3ba55c', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}>
          S1
        </div>
        <div style={{ width: '48px', height: '48px', backgroundColor: '#36393f', border: '1px dashed #72767d', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
          +
        </div>
      </div>

      {/* 2. SÜTUN: Dinamik Yan Menü (Kanallar veya DM Listesi) */}
      <div style={{ width: '240px', backgroundColor: '#2b2d31', display: 'flex', flexDirection: 'column' }}>
        {sidebarContent}
      </div>

      {/* 3. SÜTUN: Ana İçerik (Sohbet, Kanban, Arkadaşlar) */}
      <div style={{ flexGrow: 1, backgroundColor: '#313338', display: 'flex', flexDirection: 'column' }}>
        {mainContent}
      </div>
      
    </div>
  );
};

export default MainLayout;