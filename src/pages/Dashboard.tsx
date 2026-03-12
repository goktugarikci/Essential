// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// API FONKSİYONLARI
import { 
  getCurrentUser, 
  getFriendsList, 
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers
} from '../api/users';

import ChatArea from '../components/ChatArea';

// AYRILMIŞ MODALLAR
import { SearchModal } from '../components/modals/SearchModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import { AddFriendModal } from '../components/modals/AddFriendModal';

interface User {
  id: string;
  name: string;
  email?: string;
  status: 'online' | 'offline' | 'busy';
}

interface FriendRequest {
  id: string;
  senderName: string;
  senderEmail?: string; // YENİ: E-posta eklendi
  type?: 'incoming' | 'outgoing';
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending'>('online');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPending, setIsRefreshingPending] = useState(false); // Yenile butonu için
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // SAYFA İLK AÇILDIĞINDA VERİLERİ ÇEK
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [userData, friendsData, pendingData] = await Promise.all([
          getCurrentUser(),
          getFriendsList(),
          getPendingRequests()
        ]);

        if (userData) {
          setCurrentUser({
            id: userData.id || userData.ID || '',
            name: userData.name || userData.Name || 'Kullanıcı',
            email: userData.email || userData.Email || '',
            status: (userData.status || userData.Status || 'online').toLowerCase() as any
          });
        }

        const formattedFriends = Array.isArray(friendsData) ? friendsData.map((f: any) => ({
          id: f.id || f.ID,
          name: f.name || f.Name || "Bilinmeyen Kullanıcı",
          email: f.email || f.Email || "",
          status: (f.status || f.Status || 'offline').toLowerCase() as any
        })) : [];
        setFriends(formattedFriends);
        
        const formattedPending = Array.isArray(pendingData) ? pendingData.map((req: any) => ({
          id: req.id || req.ID,
          senderName: req.name || req.Name || req.senderName || "Bilinmeyen Kullanıcı",
          senderEmail: req.email || req.Email || req.senderEmail || "E-posta gizli",
          type: req.type || 'incoming'
        })) : [];
        setPending(formattedPending);
        
      } catch (err: any) {
        if (err.response?.status === 403 || err.response?.data?.message?.includes("banned")) {
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

// YENİ İSTEK GÖNDER (Kimlik Tespiti ile)
  const handleAddFriendAction = async (nameOrEmail: string) => {
    try {
      const searchResult = await searchUsers(nameOrEmail);
      if (!searchResult || searchResult.length === 0) {
        alert("Bu isim veya e-postaya sahip bir kullanıcı bulunamadı.");
        return;
      }

      const targetUser = searchResult[0];
      const targetId = targetUser.id || targetUser.ID;

      // Kullanıcının ismini güvenli şekilde al (Eğer isim yoksa e-postayı, o da yoksa aranan metni yaz)
      const safeName = targetUser.name || targetUser.Name || targetUser.username || targetUser.Username || nameOrEmail;
      const safeEmail = targetUser.email || targetUser.Email || nameOrEmail;

      await sendFriendRequest(targetId);
      
      const newRequest: FriendRequest = {
        id: targetId,
        senderName: safeName,
        senderEmail: safeEmail,
        type: 'outgoing'
      };
      
      setPending(prev => [...prev, newRequest]);
      setActiveTab('pending');
      setIsAddFriendOpen(false);
    } catch (err: any) {
      console.error("İstek gönderilemedi:", err);
      alert("İstek gönderilirken bir hata oluştu veya bu kişiye zaten istek attınız.");
    }
  };

  // SADECE İSTEKLERİ YENİLE FONKSİYONU
  const handleRefreshRequests = async () => {
    setIsRefreshingPending(true);
    try {
      const pendingData = await getPendingRequests();
      const formattedPending = Array.isArray(pendingData) ? pendingData.map((req: any) => ({
        id: req.id || req.ID,
        senderName: req.name || req.Name || req.senderName || "Bilinmeyen Kullanıcı",
        senderEmail: req.email || req.Email || req.senderEmail || "E-posta gizli",
        type: req.type || 'incoming'
      })) : [];
      setPending(formattedPending);
    } catch (err) {
      console.error("İstekler yenilenirken hata oluştu:", err);
    } finally {
      setIsRefreshingPending(false);
    }
  };

  // İSTEĞİ KABUL ET
  const handleAcceptRequest = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      setPending(prev => prev.filter(req => req.id !== id));
      
      const updatedFriendsData = await getFriendsList();
      const formattedFriends = Array.isArray(updatedFriendsData) ? updatedFriendsData.map((f: any) => ({
        id: f.id || f.ID,
        name: f.name || f.Name || "Bilinmeyen",
        email: f.email || f.Email || "",
        status: (f.status || f.Status || 'offline').toLowerCase() as any
      })) : [];
      setFriends(formattedFriends);
    } catch (err) {
      console.error("İstek kabul edilemedi:", err);
    }
  };

  // İSTEĞİ REDDET / İPTAL ET
  const handleRemoveRequest = async (id: string) => {
    try {
      await rejectFriendRequest(id);
      setPending(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      console.error("İstek iptal edilemedi:", err);
    }
  };

  // ARKADAŞLIKTAN ÇIKAR
  const handleRemoveFriend = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bu kişiyi arkadaşlıktan çıkarmak istediğine emin misin?")) return;
    try {
      await removeFriend(id);
      setFriends(prev => prev.filter(f => f.id !== id));
      if (activeChatUser?.id === id) setActiveChatUser(null);
    } catch (err) {
      console.error("Arkadaş silinemedi:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-theme-primary text-theme-text font-sans items-center justify-center flex-col gap-4">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span className="text-theme-muted font-medium">{t('dash_loading')}</span>
      </div>
    );
  }

  const onlineFriends = friends.filter(f => f.status === 'online');
  const currentLang = i18n.language?.substring(0, 2).toUpperCase() || 'TR';

  return (
    <div className="flex h-screen w-full bg-theme-primary text-theme-text overflow-hidden transition-colors duration-300 font-sans">
      
      {/* 1. SÜTUN */}
      <div className="w-[72px] bg-theme-primary flex flex-col items-center py-3 gap-2 shrink-0 z-30 border-r border-theme-border shadow-xl relative transition-colors duration-300">
        <div className="w-12 h-12 bg-blue-600 rounded-[16px] flex justify-center items-center cursor-pointer shadow-lg shadow-blue-500/20 hover:rounded-xl transition-all">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <div className="w-8 h-[2px] bg-theme-tertiary my-1 rounded-full transition-colors duration-300"></div>

        <div onClick={() => setIsDrawerOpen(!isDrawerOpen)} className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] flex justify-center items-center cursor-pointer transition-all duration-300 ${isDrawerOpen ? 'bg-theme-tertiary text-blue-500' : 'bg-blue-600/20 text-blue-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </div>

        <div className="mt-auto flex flex-col gap-3 items-center relative">
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="text-xs text-theme-muted hover:text-theme-text transition font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-theme-tertiary">
              {currentLang}
            </button>
            {isLangMenuOpen && (
              <div className="absolute bottom-0 left-[50px] w-28 bg-theme-secondary border border-theme-border rounded-xl shadow-2xl py-2 flex flex-col z-50">
                {['tr', 'en', 'de'].map(l => (
                  <button key={l} onClick={() => { i18n.changeLanguage(l); setIsLangMenuOpen(false); }} className="text-sm px-4 py-2 text-left hover:bg-blue-600 hover:text-white transition uppercase">{l}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="w-12 h-12 bg-theme-tertiary hover:bg-gray-500 rounded-[24px] text-theme-muted hover:text-white flex justify-center items-center transition-all shadow">⚙️</button>
          <button onClick={handleLogout} className="w-12 h-12 bg-theme-tertiary hover:bg-red-500 rounded-[24px] text-red-500 hover:text-white flex justify-center items-center transition-all shadow">🚪</button>
        </div>
      </div>

      {/* 2. SÜTUN: ÇEKMECE */}
      <div className={`${isDrawerOpen ? 'w-60' : 'w-0'} bg-theme-secondary flex flex-col shrink-0 rounded-tl-lg shadow-2xl z-20 transition-[width,background-color] duration-300 ease-in-out overflow-hidden`}>
        <div className="w-60 h-full flex flex-col">
          
          <div className="p-3 shadow-sm border-b border-theme-border">
            <button onClick={() => setIsSearchOpen(true)} className="w-full bg-theme-primary text-theme-muted text-sm p-2 rounded text-left hover:bg-theme-tertiary transition flex items-center gap-2">
              <span>🔍</span> {t('dash_search')}
            </button>
          </div>
          
          <div className="px-3 mt-4 flex-1 overflow-y-auto">
            <h2 className="text-[11px] font-bold text-theme-muted uppercase mb-2 tracking-wider px-2">{t('dash_direct_messages')}</h2>
            {friends.map(friend => (
              <div key={friend.id} onClick={() => setActiveChatUser(friend)} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition group ${activeChatUser?.id === friend.id ? 'bg-theme-tertiary' : 'hover:bg-theme-tertiary'}`}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">{friend.name.charAt(0)}</div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-theme-secondary rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                <span className="font-medium text-sm truncate">{friend.name}</span>
              </div>
            ))}
          </div>

          <div className="bg-theme-tertiary p-3 flex items-center gap-3 mt-auto border-t border-theme-border">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-lg">{currentUser?.name?.charAt(0).toUpperCase() || "U"}</div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-theme-tertiary rounded-full bg-green-500"></div>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold leading-tight truncate text-theme-text">{currentUser?.name || "Kullanıcı"}</span>
              <span className="text-[10px] text-theme-muted truncate mt-0.5">{currentUser?.email || ""}</span>
            </div>
            <div className="flex gap-1 text-theme-muted shrink-0"><button className="hover:text-theme-text">🎤</button><button className="hover:text-theme-text">🎧</button></div>
          </div>
        </div>
      </div>

      {/* 3. SÜTUN: ANA İÇERİK */}
      <div className="flex-1 bg-theme-tertiary flex flex-col rounded-tl-lg relative z-10">
        {activeChatUser ? (
          <ChatArea currentUser={currentUser} friend={activeChatUser} onClose={() => setActiveChatUser(null)} />
        ) : (
          <>
            <div className="h-12 border-b border-theme-border flex items-center px-4 gap-4 shadow-sm bg-theme-primary/30">
              <div className="flex items-center gap-2 font-bold text-theme-text"><span>🧑‍🤝‍🧑</span> {t('dash_friends')}</div>
              <div className="flex gap-4 text-sm font-medium ml-4">
                <button onClick={() => setActiveTab('online')} className={`${activeTab === 'online' ? 'text-theme-text bg-theme-secondary' : 'text-theme-muted hover:bg-theme-secondary'} px-3 py-1 rounded transition`}>{t('dash_online')}</button>
                <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'text-theme-text bg-theme-secondary' : 'text-theme-muted hover:bg-theme-secondary'} px-3 py-1 rounded transition`}>{t('dash_all')}</button>
                <button onClick={() => setActiveTab('pending')} className={`${activeTab === 'pending' ? 'text-theme-text bg-theme-secondary' : 'text-theme-muted hover:bg-theme-secondary'} px-3 py-1 rounded transition flex items-center gap-2`}>
                  {t('dash_pending')} {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pending.length}</span>}
                </button>
              </div>
              <button onClick={() => setIsAddFriendOpen(true)} className="ml-auto bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded transition shadow-lg">{t('dash_add_friend')}</button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto relative">
              
              {/* TÜMÜ LİSTESİ */}
              {activeTab === 'all' && (
                friends.length === 0 ? <div className="text-center text-theme-muted mt-20 opacity-50">{t('dash_no_friends')}</div> :
                friends.map(friend => (
                  <div key={friend.id} onClick={() => setActiveChatUser(friend)} className="flex items-center justify-between p-3 border-b border-theme-border/50 hover:bg-theme-secondary transition group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">{friend.name ? friend.name.charAt(0).toUpperCase() : "?"}</div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-theme-tertiary rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-theme-text">{friend.name}</div>
                        <div className="text-xs text-theme-muted">{friend.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="w-10 h-10 rounded-full bg-theme-primary text-theme-muted hover:text-theme-text shadow-lg">💬</button>
                      <button onClick={(e) => handleRemoveFriend(friend.id, e)} className="w-10 h-10 rounded-full bg-theme-primary text-red-500 hover:bg-red-500 hover:text-white shadow-lg">✖</button>
                    </div>
                  </div>
                ))
              )}

              {/* ÇEVRİMİÇİ LİSTESİ */}
              {activeTab === 'online' && (
                onlineFriends.length === 0 ? <div className="text-center text-theme-muted mt-20 opacity-50">{t('dash_no_online')}</div> :
                onlineFriends.map(friend => (
                  <div key={friend.id} onClick={() => setActiveChatUser(friend)} className="flex items-center justify-between p-3 border-b border-theme-border/50 hover:bg-theme-secondary transition group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">{friend.name ? friend.name.charAt(0).toUpperCase() : "?"}</div>
                      <div className="flex flex-col">
                        <div className="font-bold text-theme-text">{friend.name}</div>
                        <div className="text-xs text-theme-muted">{friend.email}</div>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-theme-primary text-theme-muted hover:text-theme-text opacity-0 group-hover:opacity-100 transition shadow-lg">💬</button>
                  </div>
                ))
              )}

              {/* İSTEKLER LİSTESİ */}
              {activeTab === 'pending' && (
                <div className="flex flex-col">
                  {/* Başlık ve YENİLE BUTONU */}
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-border/30">
                    <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                      {t('dash_pending')} - {pending.length}
                    </h3>
                    <button 
                      onClick={handleRefreshRequests} 
                      disabled={isRefreshingPending}
                      className="text-xs bg-theme-secondary hover:bg-theme-primary border border-theme-border px-3 py-1.5 rounded transition flex items-center gap-2 text-theme-text font-medium"
                    >
                      <span className={`${isRefreshingPending ? 'animate-spin' : ''}`}>🔄</span> 
                      {isRefreshingPending ? 'Yenileniyor...' : 'Yenile'}
                    </button>
                  </div>

                  {pending.length === 0 ? <div className="text-center text-theme-muted mt-20 opacity-50">📫 {t('dash_no_pending', {defaultValue: 'Bekleyen istek yok.'})}</div> :
                  pending.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 border-b border-theme-border/50 hover:bg-theme-secondary transition group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md ${req.type === 'outgoing' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                          {req.senderName ? req.senderName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="flex flex-col">
                          <div className="font-bold text-theme-text flex items-center gap-2 text-base">
                            {req.senderName}
                            <span className="text-[10px] bg-theme-primary px-2 py-0.5 rounded text-theme-muted border border-theme-border uppercase tracking-wider font-semibold">
                              {req.type === 'outgoing' ? 'Giden İstek' : 'Gelen İstek'}
                            </span>
                          </div>
                          {/* AD SOYAD ALTINDA E-POSTA ADRESİ */}
                          <div className="text-xs text-theme-muted mt-0.5">{req.senderEmail}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {req.type !== 'outgoing' && (
                          <button onClick={() => handleAcceptRequest(req.id)} className="w-10 h-10 rounded-full bg-theme-primary text-green-500 hover:bg-green-500 hover:text-white transition shadow-lg text-lg" title="Kabul Et">✓</button>
                        )}
                        <button onClick={() => handleRemoveRequest(req.id)} className="w-10 h-10 rounded-full bg-theme-primary text-red-500 hover:bg-red-500 hover:text-white transition shadow-lg text-lg" title={req.type === 'outgoing' ? 'İsteği İptal Et' : 'Reddet'}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODALLAR */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} searchInput={searchInput} setSearchInput={setSearchInput} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddFriendModal isOpen={isAddFriendOpen} onClose={() => setIsAddFriendOpen(false)} onAddFriend={handleAddFriendAction} />

    </div>
  );
};

export default Dashboard;