// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, getFriendsList, getPendingRequests } from '../api/user';


// C++'tan gelecek verilerin TypeScript kalıpları
interface User {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
}

interface FriendRequest {
  id: string;
  senderName: string;
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending'>('online');

  // Dinamik State'ler (Veritabanından gelecek veriler)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);
  
  // Yüklenme ve Hata State'leri
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Sayfa açıldığında verileri çeken fonksiyon
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 3 isteği aynı anda (paralel) atarak sayfa açılışını hızlandırıyoruz
        const [userData, friendsData, pendingData] = await Promise.all([
          getCurrentUser(),
          getFriendsList(),
          getPendingRequests()
        ]);

        setCurrentUser(userData);
        setFriends(friendsData);
        setPending(pendingData);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        setError(t('dash_error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token'); // Çıkışta token'ı sil
    navigate('/login');
  };

  // Yükleniyor Ekranı
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#1e1f22] text-white font-sans items-center justify-center flex-col gap-4">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-400 font-medium">{t('dash_loading')}</span>
      </div>
    );
  }

  const onlineFriends = friends.filter(f => f.status === 'online');

  return (
    <div className="flex h-screen w-full bg-[#1e1f22] text-white font-sans overflow-hidden">
      
      {/* 1. SÜTUN: Sunucular Listesi */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 shrink-0 z-10 border-r border-[#1e1f22]/50">
        <div className="w-12 h-12 bg-blue-600 rounded-[16px] flex justify-center items-center cursor-pointer shadow-lg shadow-blue-500/20 transition-all hover:rounded-xl">
          <span className="text-xl font-bold">E</span>
        </div>
        <div className="w-8 h-[2px] bg-[#313338] my-1 rounded-full"></div>
        
        {/* Örnek Sunucu */}
        <div className="w-12 h-12 bg-[#313338] hover:bg-green-500 rounded-[24px] hover:rounded-[16px] flex justify-center items-center cursor-pointer transition-all">
          S1
        </div>
        <div className="w-12 h-12 bg-[#313338] hover:bg-green-500 rounded-[24px] hover:rounded-[16px] text-green-500 hover:text-white flex justify-center items-center cursor-pointer transition-all">
          <span className="text-2xl">+</span>
        </div>

        <div className="mt-auto flex flex-col gap-3 items-center">
          <button onClick={() => i18n.changeLanguage(i18n.language.includes('tr') ? 'en' : 'tr')} className="text-xs text-gray-500 hover:text-white transition uppercase font-bold">
            {i18n.language.substring(0, 2)}
          </button>
          <button onClick={handleLogout} title={t('dash_logout')} className="w-12 h-12 bg-[#313338] hover:bg-red-500 rounded-[24px] hover:rounded-[16px] text-red-500 hover:text-white flex justify-center items-center cursor-pointer transition-all">
            <span className="text-xl">🚪</span>
          </button>
        </div>
      </div>

      {/* 2. SÜTUN: Özel Mesajlar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col shrink-0 rounded-tl-lg shadow-xl z-20">
        <div className="p-3 shadow-sm border-b border-[#1e1f22]/50">
          <button className="w-full bg-[#1e1f22] text-gray-400 text-sm p-2 rounded text-left hover:bg-[#111214] transition">
            {t('dash_search')}
          </button>
        </div>

        <div className="px-3 mt-4 flex-1 overflow-y-auto">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider hover:text-gray-300 cursor-pointer px-2">
            {t('dash_direct_messages')}
          </h2>
          
          {/* Dinamik Arkadaş Listesi (Sol Bar İçin) */}
          {friends.length === 0 ? (
            <div className="text-xs text-gray-500 px-2 italic mt-2">Kimse yok.</div>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="flex items-center gap-3 p-2 rounded hover:bg-[#3f4147] cursor-pointer transition group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
                    {friend.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#2b2d31] rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium text-sm truncate">{friend.name}</span>
              </div>
            ))
          )}
        </div>
        
        {/* Kullanıcı Profil Alt Çubuğu (Dinamik) */}
        <div className="bg-[#232428] p-3 flex items-center gap-3 mt-auto">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser?.name.charAt(0) || "U"}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-bold leading-none mb-1 truncate">{currentUser?.name || "Kullanıcı"}</span>
            <span className="text-[11px] text-green-500 leading-none">Çevrimiçi</span>
          </div>
          <div className="flex gap-2 text-gray-400 shrink-0">
            <button className="hover:text-white transition">🎤</button>
            <button className="hover:text-white transition">⚙️</button>
          </div>
        </div>
      </div>

      {/* 3. SÜTUN: Ana İçerik */}
      <div className="flex-1 bg-[#313338] flex flex-col rounded-tl-lg">
        {/* Üst Bar */}
        <div className="h-12 border-b border-[#1e1f22] flex items-center px-4 gap-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-gray-200">
            <span className="text-xl">🧑‍🤝‍🧑</span> {t('dash_friends')}
          </div>
          <div className="w-[1px] h-6 bg-gray-600"></div>
          
          <div className="flex gap-4 text-sm font-medium">
            <button onClick={() => setActiveTab('online')} className={`${activeTab === 'online' ? 'text-white bg-[#3f4147]' : 'text-gray-400 hover:bg-[#3f4147] hover:text-gray-200'} px-3 py-1 rounded transition`}>
              {t('dash_online')}
            </button>
            <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'text-white bg-[#3f4147]' : 'text-gray-400 hover:bg-[#3f4147] hover:text-gray-200'} px-3 py-1 rounded transition`}>
              {t('dash_all')}
            </button>
            <button onClick={() => setActiveTab('pending')} className={`${activeTab === 'pending' ? 'text-white bg-[#3f4147]' : 'text-gray-400 hover:bg-[#3f4147] hover:text-gray-200'} px-3 py-1 rounded transition flex items-center gap-2`}>
              {t('dash_pending')} 
              {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pending.length}</span>}
            </button>
          </div>
          
          <button className="ml-auto bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded transition shadow-lg shadow-green-500/20">
            {t('dash_add_friend')}
          </button>
        </div>

        {/* Dinamik İçerik Alanı */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {error && <div className="p-4 mb-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">{error}</div>}

          {/* ALL (TÜMÜ) TABI */}
          {activeTab === 'all' && (
            friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-48 h-48 bg-[url('https://cdn-icons-png.flaticon.com/512/7486/7486744.png')] bg-cover opacity-20 mb-6 grayscale filter"></div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">{t('dash_no_friends')}</h3>
                <p className="text-sm">{t('dash_add_first_friend')}</p>
                <button className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition">
                  {t('dash_add_friend')}
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">{t('dash_all')} - {friends.length}</h3>
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-3 border-t border-[#3f4147] hover:bg-[#3f4147]/50 rounded transition group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">{friend.name.charAt(0)}</div>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#313338] rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <div className="font-bold text-gray-200">{friend.name}</div>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                      <button className="w-10 h-10 rounded-full bg-[#2b2d31] flex justify-center items-center text-gray-300 hover:text-white transition shadow-lg">💬</button>
                      <button className="w-10 h-10 rounded-full bg-[#2b2d31] flex justify-center items-center text-red-400 hover:text-red-500 transition shadow-lg">✖</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ONLINE (ÇEVRİMİÇİ) TABI */}
          {activeTab === 'online' && (
             onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-7xl mb-4 opacity-20">👻</div>
                <p>{t('dash_no_online')}</p>
              </div>
             ) : (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">{t('dash_online')} - {onlineFriends.length}</h3>
                {onlineFriends.map(friend => (
                   <div key={friend.id} className="flex items-center justify-between p-3 border-t border-[#3f4147] hover:bg-[#3f4147]/50 rounded transition group cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">{friend.name.charAt(0)}</div>
                     <div className="font-bold text-gray-200">{friend.name}</div>
                   </div>
                   <div className="opacity-0 group-hover:opacity-100 transition">
                     <button className="w-10 h-10 rounded-full bg-[#2b2d31] flex justify-center items-center text-gray-300 hover:text-white transition shadow-lg">💬</button>
                   </div>
                 </div>
                ))}
              </div>
             )
          )}

          {/* PENDING (İSTEKLER) TABI */}
          {activeTab === 'pending' && (
            pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-40 h-40 bg-[url('https://cdn-icons-png.flaticon.com/512/4812/4812165.png')] bg-cover opacity-20 mb-6 grayscale filter"></div>
                <p>Bekleyen arkadaşlık isteği yok.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">{t('dash_pending')} - {pending.length}</h3>
                {pending.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 border-t border-[#3f4147] hover:bg-[#3f4147]/50 rounded transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">{req.senderName.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-gray-200">{req.senderName}</div>
                        <div className="text-xs text-gray-400">Gelen Arkadaşlık İsteği</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-9 h-9 rounded-full bg-[#2b2d31] flex justify-center items-center text-green-500 hover:bg-green-500 hover:text-white transition shadow">✓</button>
                      <button className="w-9 h-9 rounded-full bg-[#2b2d31] flex justify-center items-center text-red-500 hover:bg-red-500 hover:text-white transition shadow">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;