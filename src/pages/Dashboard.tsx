// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, getFriendsList, getPendingRequests } from '../api/users';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme, changeTheme } = useTheme(); 
  
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending'>('online');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  
  // MODAL STATE'LERİ
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendInput, setFriendInput] = useState('');

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [userData, friendsData, pendingData] = await Promise.all([
          getCurrentUser(),
          getFriendsList(),
          getPendingRequests()
        ]);

        setCurrentUser(userData || null);
        setFriends(friendsData || []);
        setPending(pendingData || []);
        
      } catch (err: any) {
        console.error("Veri çekme hatası:", err);
        if (
          err.response?.status === 403 || 
          err.response?.data?.isBanned === true || 
          err.response?.data?.message?.toLowerCase().includes("banned")
        ) {
          navigate('/banned');
          return;
        }
        setError(t('dash_error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangMenuOpen(false);
  };

  // Arkadaş Ekleme İstediği Gönderme Fonksiyonu
  const handleSendFriendRequest = () => {
    if (!friendInput.trim()) return;
    console.log("C++ Backend'e arkadaş ekleme isteği atılıyor:", friendInput);
    // TODO: İleride buraya C++ API çağrısı eklenecek (Örn: apiClient.post('/friends/request', { username: friendInput }))
    
    setFriendInput('');
    setIsAddFriendOpen(false);
    // Başarılı bildirimi gösterebilirsiniz
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-theme-primary text-theme-text font-sans items-center justify-center flex-col gap-4 transition-colors duration-300">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-theme-muted font-medium">{t('dash_loading')}</span>
      </div>
    );
  }

  const onlineFriends = friends.filter(f => f.status === 'online');
  const currentLang = i18n.language?.substring(0, 2).toUpperCase() || 'TR';

  return (
    <div className="flex h-screen w-full bg-theme-primary text-theme-text font-sans overflow-hidden transition-colors duration-300">
      
      {/* 1. SÜTUN: Sabit Araç Çubuğu */}
      <div className="w-[72px] bg-theme-primary flex flex-col items-center py-3 gap-2 shrink-0 z-30 border-r border-theme-border shadow-xl relative transition-colors duration-300">
        <div className="w-12 h-12 bg-blue-600 rounded-[16px] flex justify-center items-center cursor-pointer shadow-lg shadow-blue-500/20 transition-all hover:rounded-xl">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <div className="w-8 h-[2px] bg-theme-tertiary my-1 rounded-full transition-colors duration-300"></div>

        <div 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
          title="Menüyü Aç/Kapat" 
          className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] flex justify-center items-center cursor-pointer transition-all duration-300 ${isDrawerOpen ? 'bg-theme-tertiary text-blue-500' : 'bg-blue-600/20 text-blue-500 hover:bg-blue-500 hover:text-white'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        
        <div className="w-8 h-[2px] bg-theme-tertiary my-1 rounded-full transition-colors duration-300"></div>
        <div className="w-12 h-12 bg-theme-tertiary hover:bg-green-500 rounded-[24px] hover:rounded-[16px] flex justify-center items-center cursor-pointer transition-all text-theme-text">
          S1
        </div>

        <div className="mt-auto flex flex-col gap-3 items-center relative">
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="text-xs text-theme-muted hover:text-theme-text transition font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-theme-tertiary">
              {currentLang}
            </button>
            {isLangMenuOpen && (
              <div className="absolute bottom-0 left-[50px] w-28 bg-theme-secondary border border-theme-border rounded-xl shadow-2xl py-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                <button onClick={() => changeLanguage('tr')} className={`text-sm px-4 py-2 text-left hover:bg-blue-600 hover:text-white transition ${currentLang === 'TR' ? 'text-blue-500 font-bold' : 'text-theme-text'}`}>Türkçe</button>
                <button onClick={() => changeLanguage('en')} className={`text-sm px-4 py-2 text-left hover:bg-blue-600 hover:text-white transition ${currentLang === 'EN' ? 'text-blue-500 font-bold' : 'text-theme-text'}`}>English</button>
                <button onClick={() => changeLanguage('de')} className={`text-sm px-4 py-2 text-left hover:bg-blue-600 hover:text-white transition ${currentLang === 'DE' ? 'text-blue-500 font-bold' : 'text-theme-text'}`}>Deutsch</button>
              </div>
            )}
          </div>
          
          <button onClick={() => setIsSettingsOpen(true)} title={t('dash_settings')} className="w-12 h-12 bg-theme-tertiary hover:bg-gray-500 rounded-[24px] hover:rounded-[16px] text-theme-muted hover:text-white flex justify-center items-center cursor-pointer transition-all shadow">
            <span className="text-xl">⚙️</span>
          </button>
          <button onClick={handleLogout} title={t('dash_logout')} className="w-12 h-12 bg-theme-tertiary hover:bg-red-500 rounded-[24px] hover:rounded-[16px] text-red-500 hover:text-white flex justify-center items-center cursor-pointer transition-all shadow">
            <span className="text-xl">🚪</span>
          </button>
        </div>
      </div>

      {/* 2. SÜTUN: Çekmece */}
      <div className={`${isDrawerOpen ? 'w-60' : 'w-0'} bg-theme-secondary flex flex-col shrink-0 rounded-tl-lg shadow-2xl z-20 transition-[width,background-color] duration-300 ease-in-out overflow-hidden`}>
        <div className="w-60 h-full flex flex-col">
          <div className="p-3 shadow-sm border-b border-theme-border">
            <button className="w-full bg-theme-primary text-theme-muted text-sm p-2 rounded text-left hover:bg-theme-tertiary transition">
              {t('dash_search')}
            </button>
          </div>

          <div className="px-3 mt-4 flex-1 overflow-y-auto">
            <h2 className="text-[11px] font-bold text-theme-muted uppercase mb-2 tracking-wider hover:text-theme-text cursor-pointer px-2 transition-colors">
              {t('dash_direct_messages')}
            </h2>
            
            {friends.length === 0 ? (
              <div className="text-xs text-theme-muted px-2 italic mt-2">{t('dash_no_one_here', {defaultValue: 'Kimse yok.'})}</div>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="flex items-center gap-3 p-2 rounded hover:bg-theme-tertiary cursor-pointer transition group">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm text-white">
                      {friend.name ? friend.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-theme-secondary rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <span className="text-theme-muted group-hover:text-theme-text font-medium text-sm truncate transition-colors">{friend.name}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="bg-theme-tertiary p-3 flex items-center gap-3 mt-auto transition-colors duration-300 border-t border-theme-border">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0 text-white shadow-lg">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold leading-none mb-1 truncate text-theme-text">{currentUser?.name || "Kullanıcı"}</span>
              <span className="text-[11px] text-green-500 leading-none">Çevrimiçi</span>
            </div>
            <div className="flex gap-2 text-theme-muted shrink-0">
              <button className="hover:text-theme-text transition" title="Mikrofon">🎤</button>
              <button className="hover:text-theme-text transition" title="Kulaklık">🎧</button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SÜTUN: Ana İçerik */}
      <div className="flex-1 bg-theme-tertiary flex flex-col rounded-tl-lg relative z-10 transition-colors duration-300">
        <div className="h-12 border-b border-theme-border flex items-center px-4 gap-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-theme-text">
            <span className="text-xl">🧑‍🤝‍🧑</span> {t('dash_friends')}
          </div>
          <div className="w-[1px] h-6 bg-theme-border"></div>
          
          <div className="flex gap-4 text-sm font-medium">
            <button onClick={() => setActiveTab('online')} className={`${activeTab === 'online' ? 'text-theme-text bg-theme-secondary' : 'text-theme-muted hover:bg-theme-secondary hover:text-theme-text'} px-3 py-1 rounded transition`}>{t('dash_online')}</button>
            <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'text-theme-text bg-theme-secondary' : 'text-theme-muted hover:bg-theme-secondary hover:text-theme-text'} px-3 py-1 rounded transition`}>{t('dash_all')}</button>
            <button onClick={() => setActiveTab('pending')} className={`${activeTab === 'pending' ? 'text-theme-text bg-theme-secondary' : 'text-theme-muted hover:bg-theme-secondary hover:text-theme-text'} px-3 py-1 rounded transition flex items-center gap-2`}>
              {t('dash_pending')} 
              {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pending.length}</span>}
            </button>
          </div>
          
          <button 
            onClick={() => setIsAddFriendOpen(true)}
            className="ml-auto bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded transition shadow-lg shadow-green-500/20"
          >
            {t('dash_add_friend')}
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {error && <div className="p-4 mb-4 bg-red-500/20 border border-red-500 text-red-500 rounded-lg">{error}</div>}

          {/* TÜMÜ */}
          {activeTab === 'all' && (
            friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-theme-muted">
                <div className="w-48 h-48 bg-[url('https://cdn-icons-png.flaticon.com/512/7486/7486744.png')] bg-cover opacity-20 mb-6 grayscale filter"></div>
                <h3 className="text-xl font-bold text-theme-text mb-2">{t('dash_no_friends')}</h3>
                <p className="text-sm">{t('dash_add_first_friend')}</p>
                <button onClick={() => setIsAddFriendOpen(true)} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition">{t('dash_add_friend')}</button>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-theme-muted uppercase mb-4 tracking-wider">{t('dash_all')} - {friends.length}</h3>
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-3 border-t border-theme-border hover:bg-theme-secondary rounded transition group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">{friend.name ? friend.name.charAt(0).toUpperCase() : "?"}</div>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-theme-tertiary rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <div className="font-bold text-theme-text">{friend.name}</div>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                      <button className="w-10 h-10 rounded-full bg-theme-primary flex justify-center items-center text-theme-muted hover:text-theme-text transition shadow-lg">💬</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ÇEVRİMİÇİ */}
          {activeTab === 'online' && (
             onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-theme-muted">
                <div className="text-7xl mb-4 opacity-20">👻</div>
                <p>{t('dash_no_online')}</p>
              </div>
             ) : (
              <div>
                <h3 className="text-xs font-bold text-theme-muted uppercase mb-4 tracking-wider">{t('dash_online')} - {onlineFriends.length}</h3>
                {onlineFriends.map(friend => (
                   <div key={friend.id} className="flex items-center justify-between p-3 border-t border-theme-border hover:bg-theme-secondary rounded transition group cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">{friend.name ? friend.name.charAt(0).toUpperCase() : "?"}</div>
                     <div className="font-bold text-theme-text">{friend.name}</div>
                   </div>
                   <div className="opacity-0 group-hover:opacity-100 transition">
                     <button className="w-10 h-10 rounded-full bg-theme-primary flex justify-center items-center text-theme-muted hover:text-theme-text transition shadow-lg">💬</button>
                   </div>
                 </div>
                ))}
              </div>
             )
          )}

          {/* İSTEKLER */}
          {activeTab === 'pending' && (
            pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-theme-muted">
                <div className="w-40 h-40 bg-[url('https://cdn-icons-png.flaticon.com/512/4812/4812165.png')] bg-cover opacity-20 mb-6 grayscale filter"></div>
                <p>Bekleyen arkadaşlık isteği yok.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-theme-muted uppercase mb-4 tracking-wider">{t('dash_pending')} - {pending.length}</h3>
                {pending.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 border-t border-theme-border hover:bg-theme-secondary rounded transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">{req.senderName ? req.senderName.charAt(0).toUpperCase() : "?"}</div>
                      <div>
                        <div className="font-bold text-theme-text">{req.senderName}</div>
                        <div className="text-xs text-theme-muted">Gelen Arkadaşlık İsteği</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-9 h-9 rounded-full bg-theme-primary flex justify-center items-center text-green-500 hover:bg-green-500 hover:text-white transition shadow">✓</button>
                      <button className="w-9 h-9 rounded-full bg-theme-primary flex justify-center items-center text-red-500 hover:bg-red-500 hover:text-white transition shadow">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1) AYARLAR MODALI */}
      {/* ========================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-theme-secondary w-full max-w-lg rounded-2xl shadow-2xl border border-theme-border overflow-hidden relative">
            
            <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-tertiary">
              <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
                <span>⚙️</span> {t('dash_settings_title')}
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 rounded-full bg-theme-primary hover:bg-red-500 text-theme-muted hover:text-white flex items-center justify-center transition-all">✖</button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 bg-theme-primary rounded-xl border border-theme-border">
                <div>
                  <div className="font-bold text-theme-text mb-1">{t('dash_settings_profile')}</div>
                  <div className="text-xs text-theme-muted">{t('dash_settings_profile_desc')}</div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition shadow-md shadow-blue-600/20">{t('dash_settings_edit')}</button>
              </div>

              <div className="flex justify-between items-center p-4 bg-theme-primary rounded-xl border border-theme-border">
                <div>
                  <div className="font-bold text-theme-text mb-1">{t('dash_settings_theme')}</div>
                  <div className="text-xs text-theme-muted">{t('dash_settings_theme_desc')}</div>
                </div>
                <select value={theme} onChange={(e) => changeTheme(e.target.value as any)} className="bg-theme-secondary text-theme-text text-sm p-2 rounded-lg border border-theme-border focus:outline-none cursor-pointer">
                  <option value="dark">{t('dash_theme_dark', {defaultValue: 'Karanlık'})}</option>
                  <option value="light">{t('dash_theme_light', {defaultValue: 'Aydınlık'})}</option>
                  <option value="dracula">{t('dash_theme_dracula', {defaultValue: 'Dracula'})}</option>
                  <option value="orange">{t('dash_theme_orange', {defaultValue: 'Turuncu Mod'})}</option>
                  <option value="lime">{t('dash_theme_lime', {defaultValue: 'Lime Mod'})}</option>
                  <option value="pink">{t('dash_theme_pink', {defaultValue: 'Pembe Mod'})}</option>
                  <option value="purple">{t('dash_theme_purple', {defaultValue: 'Mor Mod'})}</option>
                </select>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                <div>
                  <div className="font-bold text-red-500 mb-1">{t('dash_settings_danger')}</div>
                  <div className="text-xs text-red-500/70">{t('dash_settings_danger_desc')}</div>
                </div>
                <button className="px-4 py-2 bg-transparent border border-red-500 hover:bg-red-500 text-red-500 hover:text-white text-sm font-bold rounded-lg transition">{t('dash_settings_delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2) ARKADAŞ EKLE MODALI (YENİ) */}
      {/* ========================================================= */}
      {isAddFriendOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-theme-secondary w-full max-w-md rounded-2xl shadow-2xl border border-theme-border overflow-hidden relative">
            
            <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-tertiary">
              <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
                <span>👤</span> {t('dash_add_friend')}
              </h2>
              <button onClick={() => setIsAddFriendOpen(false)} className="w-8 h-8 rounded-full bg-theme-primary hover:bg-red-500 text-theme-muted hover:text-white flex items-center justify-center transition-all">✖</button>
            </div>

            <div className="p-6">
              <p className="text-sm text-theme-muted mb-4">
                {t('dash_add_friend_desc', {defaultValue: 'Eklemek istediğin arkadaşının kullanıcı adını veya e-posta adresini gir.'})}
              </p>
              
              <input 
                type="text" 
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                placeholder={t('dash_add_friend_placeholder', {defaultValue: 'Kullanıcı adı veya e-posta...'})}
                className="w-full bg-theme-primary text-theme-text p-3 rounded-lg border border-theme-border focus:border-blue-500 focus:outline-none transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSendFriendRequest()}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsAddFriendOpen(false)}
                  className="px-4 py-2 bg-transparent hover:bg-theme-primary text-theme-muted hover:text-theme-text text-sm font-bold rounded-lg transition"
                >
                  {t('dash_cancel', {defaultValue: 'İptal'})}
                </button>
                <button 
                  onClick={handleSendFriendRequest}
                  disabled={!friendInput.trim()}
                  className="px-6 py-2 bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition shadow-md shadow-blue-600/20"
                >
                  {t('dash_send_request', {defaultValue: 'İstek Gönder'})}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;