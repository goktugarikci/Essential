// src/pages/ServerView.tsx
import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import KanbanBoard from '../components/KanbanBoard';

const ServerView: React.FC = () => {
  // Aktif olarak seçili olan kanal
  const [activeChannelId, setActiveChannelId] = useState<string>('c1');

  // 1. YAN MENÜ: Sunucu Kanalları (Sidebar İçeriği)
  const serverSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sunucu Adı ve Ayarlar Menüsü Başlığı */}
      <div style={{ 
        padding: '15px', 
        borderBottom: '1px solid #1e1f22', 
        fontWeight: 'bold', 
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Yazılım Topluluğu</span>
        <span>⌄</span>
      </div>

      {/* Kanal Listesi */}
      <div style={{ padding: '10px', flexGrow: 1, overflowY: 'auto' }}>
        
        {/* Metin Kanalları Kategorisi */}
        <div style={{ fontSize: '12px', color: '#949ba4', fontWeight: 'bold', marginBottom: '5px', marginTop: '10px' }}>
          ﹀ METİN KANALLARI
        </div>
        <div 
          onClick={() => setActiveChannelId('c1')}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            backgroundColor: activeChannelId === 'c1' ? '#3f4147' : 'transparent',
            color: activeChannelId === 'c1' ? '#fff' : '#949ba4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <span style={{ fontSize: '18px', color: '#80848e' }}>#</span> genel-sohbet
        </div>
        <div 
          onClick={() => setActiveChannelId('c2')}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            backgroundColor: activeChannelId === 'c2' ? '#3f4147' : 'transparent',
            color: activeChannelId === 'c2' ? '#fff' : '#949ba4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <span style={{ fontSize: '18px', color: '#80848e' }}>#</span> duyurular
        </div>

        {/* Kanban Kanalları Kategorisi */}
        <div style={{ fontSize: '12px', color: '#949ba4', fontWeight: 'bold', marginBottom: '5px', marginTop: '20px' }}>
          ﹀ PROJE YÖNETİMİ
        </div>
        <div 
          onClick={() => setActiveChannelId('k1')}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            backgroundColor: activeChannelId === 'k1' ? '#3f4147' : 'transparent',
            color: activeChannelId === 'k1' ? '#fff' : '#949ba4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <span style={{ fontSize: '16px' }}>📋</span> Geliştirme Panosu
        </div>

        {/* Ses Kanalları Kategorisi */}
        <div style={{ fontSize: '12px', color: '#949ba4', fontWeight: 'bold', marginBottom: '5px', marginTop: '20px' }}>
          ﹀ SES KANALLARI
        </div>
        <div style={{ padding: '8px', borderRadius: '4px', cursor: 'pointer', color: '#949ba4', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🔊</span> Toplantı Odası
        </div>
      </div>

      {/* Kullanıcı Durum Çubuğu (En Alt) */}
      <div style={{ padding: '10px', backgroundColor: '#232428', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#5865F2', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
          U
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>KullaniciAdi</span>
          <span style={{ fontSize: '12px', color: '#949ba4' }}>Çevrimiçi</span>
        </div>
        <div style={{ display: 'flex', gap: '5px', color: '#b5bac1' }}>
          <span style={{ cursor: 'pointer' }}>🎤</span>
          <span style={{ cursor: 'pointer' }}>🎧</span>
          <span style={{ cursor: 'pointer' }}>⚙️</span>
        </div>
      </div>
    </div>
  );

  // 2. ANA İÇERİK: Mesajlaşma Alanı (Sohbet)
  const chatContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Üst Bar: Kanal Adı */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #1e1f22', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px', color: '#80848e' }}>#</span>
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{activeChannelId === 'c1' ? 'genel-sohbet' : 'duyurular'}</span>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#3f4147', margin: '0 10px' }} />
        <span style={{ color: '#949ba4', fontSize: '14px' }}>Topluluk üyeleriyle iletişim alanı.</span>
      </div>

      {/* Mesajların Listelendiği Alan */}
      <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ed4245', flexShrink: 0 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '15px' }}>Ali_Backend</span>
              <span style={{ color: '#949ba4', fontSize: '12px' }}>Bugün 14:30</span>
            </div>
            <div style={{ color: '#dbdee1', marginTop: '4px', lineHeight: '1.4' }}>
              Arkadaşlar merhaba, yeni veritabanı şemasını repoya pushladım. İnceleyebilir misiniz?
            </div>
          </div>
        </div>
      </div>

      {/* Mesaj Gönderme Kutusu */}
      <div style={{ padding: '0 20px 20px 20px' }}>
        <div style={{ 
          backgroundColor: '#383a40', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10px 15px',
          gap: '15px'
        }}>
          <span style={{ fontSize: '20px', color: '#b5bac1', cursor: 'pointer' }}>+</span>
          <input 
            type="text" 
            placeholder="Mesaj gönder..." 
            style={{ 
              flexGrow: 1, 
              backgroundColor: 'transparent', 
              border: 'none', 
              color: '#dbdee1', 
              outline: 'none',
              fontSize: '15px'
            }} 
          />
          <span style={{ fontSize: '20px', color: '#b5bac1', cursor: 'pointer' }}>😀</span>
        </div>
      </div>
    </div>
  );

  // Kanban mı yoksa Sohbet mi gösterileceğini belirleyen fonksiyon
  const renderMainContent = () => {
    if (activeChannelId.startsWith('k')) {
      return <KanbanBoard />;
    }
    return chatContent;
  };

  return (
    <MainLayout sidebarContent={serverSidebar} mainContent={renderMainContent()} />
  );
}; // Hatanın kaynağı olan eksik parantez burada eklendi

export default ServerView;