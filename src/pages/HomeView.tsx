
import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';

const HomeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending'>('online');

  // Sol menüde görünecek olan Özel Mesajlar listesi
  const dmSidebar = (
    <div style={{ padding: '10px' }}>
      <div style={{ padding: '10px', backgroundColor: '#1e1f22', borderRadius: '4px', marginBottom: '15px', cursor: 'pointer' }}>
        🔍 Konuşma ara...
      </div>
      <h3 style={{ fontSize: '12px', color: '#949ba4', textTransform: 'uppercase', marginBottom: '10px' }}>Özel Mesajlar</h3>
      
      {/* Örnek DM Listesi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#3f4147' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f5c518' }} />
        <span style={{ fontWeight: 500 }}>Ahmet Yılmaz</span>
      </div>
    </div>
  );

  // Sağ tarafta (Ana ekranda) görünecek Arkadaşlık / İstekler alanı
  const friendsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Üst Bar: Sekmeler */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #1e1f22', gap: '20px' }}>
        <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>🧑‍🤝‍🧑 Arkadaşlar</span>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#3f4147' }} />
        
        <button onClick={() => setActiveTab('online')} style={{ background: 'none', border: 'none', color: activeTab === 'online' ? '#fff' : '#949ba4', cursor: 'pointer', fontWeight: 500 }}>Çevrimiçi</button>
        <button onClick={() => setActiveTab('all')} style={{ background: 'none', border: 'none', color: activeTab === 'all' ? '#fff' : '#949ba4', cursor: 'pointer', fontWeight: 500 }}>Tümü</button>
        <button onClick={() => setActiveTab('pending')} style={{ background: 'none', border: 'none', color: activeTab === 'pending' ? '#fff' : '#949ba4', cursor: 'pointer', fontWeight: 500 }}>İstekler <span style={{ backgroundColor: '#f23f43', color: '#fff', padding: '2px 6px', borderRadius: '12px', fontSize: '12px' }}>2</span></button>
        
        <button style={{ marginLeft: 'auto', backgroundColor: '#248046', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Arkadaş Ekle</button>
      </div>

      {/* İçerik Listesi */}
      <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto' }}>
        {activeTab === 'pending' && (
          <div>
            <h4 style={{ color: '#949ba4', marginBottom: '15px' }}>Bekleyen İstekler - 2</h4>
            {/* Örnek İstek Kartı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderTop: '1px solid #3f4147' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eb459e' }} />
                 <div>
                   <div style={{ fontWeight: 'bold' }}>Mehmet_Dev</div>
                   <div style={{ fontSize: '12px', color: '#949ba4' }}>Gelen Arkadaşlık İsteği</div>
                 </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ backgroundColor: '#2b2d31', border: 'none', color: '#248046', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>✔️</button>
                <button style={{ backgroundColor: '#2b2d31', border: 'none', color: '#f23f43', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>❌</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Çevrimiçi/Tümü sekmesi içeriği buraya gelecek */}
        {activeTab === 'online' && <div style={{ color: '#949ba4' }}>Şu an kimse çevrimiçi değil...</div>}
      </div>
    </div>
  );

  return (
    <MainLayout sidebarContent={dmSidebar} mainContent={friendsContent} />
  );
};

export default HomeView;