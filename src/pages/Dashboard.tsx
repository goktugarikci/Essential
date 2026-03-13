import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// SOKET MİMARİSİ
import { useGlobalWebSocket } from '../contexts/WebSocketContext';

// API FONKSİYONLARI
import { 
  getCurrentUser, getFriendsList, getPendingRequests,
  sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
  removeFriend, searchUsers
} from '../api/users';

import ChatArea from '../components/ChatArea';
import NotificationManager from '../components/NotificationManager';
import { SearchModal } from '../components/modals/SearchModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import { AddFriendModal } from '../components/modals/AddFriendModal';

// 🟢 KULLANICI ARAYÜZÜNE USERNAME VE EMAIL EKLENDİ
interface User { 
  id: string; 
  name: string; 
  username?: string; 
  email?: string; 
  status: 'online' | 'offline' | 'busy'; 
}
interface FriendRequest { 
  id: string; 
  senderName: string; 
  senderEmail?: string; 
  type?: 'incoming' | 'outgoing'; 
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const { sendMessage: sendWsMessage } = useGlobalWebSocket();

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
  const [isRefreshingPending, setIsRefreshingPending] = useState(false);

  // 🛡️ KURŞUN GEÇİRMEZ LİSTE ÇEKİCİ (Konsol Çökmelerini Önler)
  const fetchLists = useCallback(async () => {
    try {
      const [friendsData, pendingData] = await Promise.all([getFriendsList(), getPendingRequests()]);
      
      const safeFriends = Array.isArray(friendsData) ? friendsData : (friendsData?.data && Array.isArray(friendsData.data) ? friendsData.data : []);
      const safePending = Array.isArray(pendingData) ? pendingData : (pendingData?.data && Array.isArray(pendingData.data) ? pendingData.data : []);

      setFriends(safeFriends.map((f: any) => ({
        id: f.id || f.ID, 
        name: f.name || f.Name || "İsimsiz Kullanıcı",
        username: f.username || f.Username || f.name?.toLowerCase().replace(/\s/g, '') || "user",
        email: f.email || f.Email || "E-posta gizli", 
        status: (f.status || f.Status || 'offline').toLowerCase() as any
      })));
      
      setPending(safePending.map((req: any) => ({
        id: req.id || req.ID, 
        senderName: req.name || req.Name || req.senderName || "Bilinmeyen",
        senderEmail: req.email || req.Email || req.senderEmail || "Gizli", 
        type: req.type || 'incoming'
      })));
    } catch (err) {
      console.error("Listeler güncellenemedi:", err);
    }
  }, []);

  // İLK AÇILIŞ VE SOKET SİNYALİ DİNLEYİCİSİ
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setCurrentUser({
            id: userData.id || userData.ID || '', 
            name: userData.name || userData.Name || 'Kullanıcı',
            username: userData.username || userData.Username || userData.name?.toLowerCase().replace(/\s/g, '') || 'kullanici',
            email: userData.email || userData.Email || '', 
            status: (userData.status || userData.Status || 'online').toLowerCase() as any
          });
        }
        await fetchLists();
      } catch (err: any) {
        if (err.response?.status === 403) navigate('/banned');
      } finally { setIsLoading(false); }
    };

    loadInitialData();

    // SOKET BİLDİRİM MÜDÜRÜNDEN GELEN 'YENİLE' EMRİNİ YAKALA!
    const handleEvent = () => { fetchLists(); };
    window.addEventListener('refresh_friends_and_requests', handleEvent);
    return () => window.removeEventListener('refresh_friends_and_requests', handleEvent);
  }, [fetchLists, navigate]);

  const handleLogout = () => { localStorage.removeItem('jwt_token'); localStorage.removeItem('token'); navigate('/login'); };

  const handleAddFriendAction = async (nameOrEmail: string) => {
    const searchResult = await searchUsers(nameOrEmail);
    if (!searchResult || searchResult.length === 0) throw new Error("Bu isim veya e-postaya sahip bir kullanıcı bulunamadı.");
    
    const targetUser = searchResult[0];
    const targetId = targetUser.id || targetUser.ID;

    await sendFriendRequest(targetId);
    await fetchLists();
    setActiveTab('pending');
    setIsAddFriendOpen(false);

    sendWsMessage('friend_request', {
      target_id: targetId, sender_id: currentUser?.id,
      content: `${currentUser?.name || 'Birisi'} size arkadaşlık isteği gönderdi.`
    });
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      await fetchLists(); 
      sendWsMessage('friend_request_accepted', {
         target_id: id, sender_id: currentUser?.id,
         content: `${currentUser?.name || 'Birisi'} arkadaşlık isteğinizi kabul etti!`
      });
    } catch (err) { console.error("İstek kabul edilemedi:", err); }
  };

  const handleRemoveRequest = async (id: string) => {
    try { await rejectFriendRequest(id); await fetchLists(); } catch (err) { console.error(err); }
  };

  const handleRemoveFriend = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bu kişiyi arkadaşlıktan çıkarmak istediğine emin misin?")) return;
    try { await removeFriend(id); await fetchLists(); if (activeChatUser?.id === id) setActiveChatUser(null); } catch (err) { console.error(err); }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-theme-primary text-theme-text items-center justify-center flex-col gap-4">
        <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span className="text-theme-muted font-medium">{t('dash_loading')}</span>
      </div>
    );
  }

  const onlineFriends = friends.filter(f => f.status === 'online');
  const currentLang = i18n.language?.substring(0, 2).toUpperCase() || 'TR';

  return (
    <div className="flex h-screen w-full bg-theme-primary text-theme-text overflow-hidden font-sans">
      
      {/* 1. SÜTUN: SOL MENÜ */}
      <div className="w-[72px] bg-theme-primary flex flex-col items-center py-3 gap-2 shrink-0 z-30 border-r border-theme-border shadow-xl">
        <div className="w-12 h-12 bg-blue-600 rounded-[16px] flex justify-center items-center cursor-pointer shadow-lg shadow-blue-500/20 hover:rounded-xl transition-all">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <div className="w-8 h-[2px] bg-theme-tertiary my-1 rounded-full"></div>
        <div onClick={() => setIsDrawerOpen(!isDrawerOpen)} className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] flex justify-center items-center cursor-pointer transition-all duration-300 ${isDrawerOpen ? 'bg-theme-tertiary text-blue-500' : 'bg-blue-600/20 text-blue-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </div>
        <div className="mt-auto flex flex-col gap-3 items-center relative">
          <button onClick={() => setIsSettingsOpen(true)} className="w-12 h-12 bg-theme-tertiary hover:bg-gray-500 rounded-[24px] text-theme-muted hover:text-white flex justify-center items-center transition-all shadow">⚙️</button>
          <button onClick={handleLogout} className="w-12 h-12 bg-theme-tertiary hover:bg-red-500 rounded-[24px] text-red-500 hover:text-white flex justify-center items-center transition-all shadow">🚪</button>
        </div>
      </div>

      {/* 2. SÜTUN: ÇEKMECE */}
      <div className={`${isDrawerOpen ? 'w-60' : 'w-0'} bg-theme-secondary flex flex-col shrink-0 rounded-tl-lg shadow-2xl z-20 transition-[width] duration-300 overflow-hidden`}>
        <div className="w-60 h-full flex flex-col">
          <div className="p-3 shadow-sm border-b border-theme-border">
            <button onClick={() => setIsSearchOpen(true)} className="w-full bg-theme-primary text-theme-muted text-sm p-2 rounded text-left hover:bg-theme-tertiary transition flex items-center gap-2">
              <span>🔍</span> {t('dash_search')}
            </button>
          </div>
          
          <div className="px-3 mt-4 flex-1 overflow-y-auto">
            <h2 className="text-[11px] font-bold text-theme-muted uppercase mb-2 px-2">{t('dash_direct_messages')}</h2>
            {friends.map(friend => (
              <div key={friend.id} onClick={() => setActiveChatUser(friend)} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition group ${activeChatUser?.id === friend.id ? 'bg-theme-tertiary' : 'hover:bg-theme-tertiary'}`}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">{friend.name.charAt(0)}</div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-theme-secondary rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm truncate">{friend.name}</span>
                  <span className="text-[10px] text-blue-400 font-medium truncate">@{friend.username}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 🟢 MEVCUT KULLANICI PROFİL KARTI GÜNCELLEMESİ */}
          <div className="bg-theme-tertiary p-3 flex items-center gap-3 mt-auto border-t border-theme-border">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-lg">{currentUser?.name?.charAt(0).toUpperCase() || "U"}</div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-theme-tertiary rounded-full bg-green-500"></div>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold leading-tight truncate text-theme-text">{currentUser?.name || "Kullanıcı"}</span>
              <span className="text-[11px] text-blue-400 font-medium truncate">@{currentUser?.username}</span>
              <span className="text-[9px] text-theme-muted truncate mt-0.5">{currentUser?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SÜTUN: ANA İÇERİK */}
      <div className="flex-1 bg-theme-tertiary flex flex-col rounded-tl-lg relative z-10 min-w-0">
        {activeChatUser ? (
          <ChatArea currentUser={currentUser} friend={activeChatUser} onClose={() => setActiveChatUser(null)} />
        ) : (
          <>
            <div className="h-14 border-b border-theme-border flex items-center px-4 md:px-6 gap-2 shadow-sm bg-theme-primary/30 shrink-0">
              <div className="flex items-center gap-2 font-bold text-theme-text text-lg shrink-0">
                <span className="hidden sm:inline">🧑‍🤝‍🧑</span> {t('dash_friends')}
              </div>
              <div className="w-[1px] h-6 bg-theme-border mx-2 hidden sm:block shrink-0"></div>
              <div className="flex gap-1 sm:gap-2 text-sm font-medium overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('online')} className={`${activeTab === 'online' ? 'text-theme-text bg-theme-secondary shadow-sm' : 'text-theme-muted hover:bg-theme-secondary'} px-3 py-1.5 rounded-lg transition whitespace-nowrap`}>{t('dash_online')}</button>
                <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'text-theme-text bg-theme-secondary shadow-sm' : 'text-theme-muted hover:bg-theme-secondary'} px-3 py-1.5 rounded-lg transition whitespace-nowrap`}>{t('dash_all')}</button>
                <button onClick={() => setActiveTab('pending')} className={`${activeTab === 'pending' ? 'text-theme-text bg-theme-secondary shadow-sm' : 'text-theme-muted hover:bg-theme-secondary'} px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap`}>
                  {t('dash_pending')} {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pending.length}</span>}
                </button>
              </div>
              <div className="ml-auto flex items-center gap-3 shrink-0">
                <NotificationManager />
                <button onClick={() => setIsAddFriendOpen(true)} className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-3 py-2 rounded-lg transition shadow-md shadow-green-600/20 flex items-center gap-2 h-9">
                  <span className="leading-none text-base">➕</span> <span className="hidden md:block whitespace-nowrap">{t('dash_add_friend')}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto relative">
              {/* TÜMÜ LİSTESİ (KULLANICI ADI EKLENDİ) */}
              {activeTab === 'all' && (
                friends.length === 0 ? <div className="text-center text-theme-muted mt-20 opacity-50">{t('dash_no_friends')}</div> :
                friends.map(friend => (
                  <div key={friend.id} onClick={() => setActiveChatUser(friend)} className="flex items-center justify-between p-3 border-b border-theme-border/50 hover:bg-theme-secondary transition group cursor-pointer rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-lg">{friend.name ? friend.name.charAt(0).toUpperCase() : "?"}</div>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-theme-tertiary rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-theme-text flex items-baseline gap-2">
                          {friend.name} <span className="text-[11px] text-blue-400 font-medium">@{friend.username}</span>
                        </div>
                        <div className="text-xs text-theme-muted">{friend.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="w-10 h-10 rounded-full bg-theme-primary text-theme-muted hover:text-theme-text shadow-lg flex items-center justify-center">💬</button>
                      <button onClick={(e) => handleRemoveFriend(friend.id, e)} className="w-10 h-10 rounded-full bg-theme-primary text-red-500 hover:bg-red-500 hover:text-white shadow-lg flex items-center justify-center">✖</button>
                    </div>
                  </div>
                ))
              )}

              {/* ÇEVRİMİÇİ LİSTESİ */}
              {activeTab === 'online' && (
                onlineFriends.length === 0 ? <div className="text-center text-theme-muted mt-20 opacity-50">{t('dash_no_online')}</div> :
                onlineFriends.map(friend => (
                  <div key={friend.id} onClick={() => setActiveChatUser(friend)} className="flex items-center justify-between p-3 border-b border-theme-border/50 hover:bg-theme-secondary transition group cursor-pointer rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-lg">{friend.name ? friend.name.charAt(0).toUpperCase() : "?"}</div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-theme-tertiary rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-theme-text flex items-baseline gap-2">
                          {friend.name} <span className="text-[11px] text-blue-400 font-medium">@{friend.username}</span>
                        </div>
                        <div className="text-xs text-theme-muted">{friend.email}</div>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-theme-primary text-theme-muted hover:text-theme-text opacity-0 group-hover:opacity-100 transition shadow-lg flex items-center justify-center">💬</button>
                  </div>
                ))
              )}

              {/* İSTEKLER LİSTESİ */}
              {activeTab === 'pending' && (
                <div className="flex flex-col max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-border/30">
                    <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider">{t('dash_pending')} - {pending.length}</h3>
                    <button onClick={() => { setIsRefreshingPending(true); fetchLists().then(() => setIsRefreshingPending(false)); }} disabled={isRefreshingPending} className="text-xs bg-theme-secondary hover:bg-theme-primary border border-theme-border px-3 py-1.5 rounded transition flex items-center gap-2 text-theme-text font-medium shadow-sm">
                      <span className={`${isRefreshingPending ? 'animate-spin' : ''}`}>🔄</span> {isRefreshingPending ? 'Yenileniyor...' : 'Yenile'}
                    </button>
                  </div>

                  {pending.length === 0 ? <div className="text-center text-theme-muted mt-20 opacity-50">📫 {t('dash_no_pending', {defaultValue: 'Bekleyen istek yok.'})}</div> :
                  pending.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 border-b border-theme-border/50 hover:bg-theme-secondary transition group rounded-lg">
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
                          <div className="text-xs text-theme-muted mt-0.5">{req.senderEmail}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {req.type !== 'outgoing' && (
                          <button onClick={() => handleAcceptRequest(req.id)} className="w-10 h-10 rounded-full bg-theme-primary text-green-500 hover:bg-green-500 hover:text-white transition shadow-lg text-lg flex items-center justify-center" title="Kabul Et">✓</button>
                        )}
                        <button onClick={() => handleRemoveRequest(req.id)} className="w-10 h-10 rounded-full bg-theme-primary text-red-500 hover:bg-red-500 hover:text-white transition shadow-lg text-lg flex items-center justify-center" title={req.type === 'outgoing' ? 'İsteği İptal Et' : 'Reddet'}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} searchInput={searchInput} setSearchInput={setSearchInput} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddFriendModal isOpen={isAddFriendOpen} onClose={() => setIsAddFriendOpen(false)} onAddFriend={handleAddFriendAction} />
    </div>
  );
};

export default Dashboard;