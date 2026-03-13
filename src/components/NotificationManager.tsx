import React, { useEffect, useState, useRef } from 'react';
import { useGlobalWebSocket } from '../contexts/WebSocketContext';
import apiClient from '../api/apiClient';

interface AppNotification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at?: string;
}

const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { lastMessage } = useGlobalWebSocket();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // BAŞLANGIÇTA GÜVENLİ VERİ ÇEKİMİ (Konsol hatasını engeller)
  useEffect(() => {
    apiClient.get('/api/notifications')
      .then(res => {
        // Backend'den dizi gelmezse boş dizi kabul et
        const safeData = Array.isArray(res.data) ? res.data : (res.data?.notifications ? res.data.notifications : []);
        setNotifications(safeData);
      })
      .catch(err => console.error("Bildirimler çekilemedi", err));
  }, []);

  // 🚀 TAM OTOMATİK SOKET DİNLEYİCİSİ
  useEffect(() => {
    if (lastMessage) {
      // Backend bazen 'type' bazen 'Type' gönderebilir, ikisini de kontrol et
      const msgType = lastMessage.type || lastMessage.Type || '';
      
      if (msgType === 'notification' || msgType === 'friend_request' || msgType === 'friend_request_accepted') {
        const newNotif: AppNotification = {
          id: Date.now().toString(),
          type: msgType,
          content: lastMessage.content || lastMessage.Content || "Yeni bir bildiriminiz var.",
          is_read: false,
          created_at: new Date().toISOString()
        };
        
        setNotifications((prev) => [newNotif, ...prev]);

        // 🟢 SİHİRLİ SİNYAL: Karşı tarafın listesini anında yeniletiyoruz
        window.dispatchEvent(new Event('refresh_friends_and_requests'));

        if (window.Notification && Notification.permission === "granted") {
          new Notification("Sistem Bildirimi", { body: newNotif.content });
        }
      }
    }
  }, [lastMessage]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) { console.error(error); }
  };

  const markAllAsRead = async () => {
     try {
       await apiClient.put(`/api/notifications/read-all`);
       setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
     } catch (error) { console.error(error); }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-theme-tertiary text-theme-text' : 'bg-theme-secondary text-theme-muted hover:text-theme-text border border-theme-border'}`}
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-theme-tertiary animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[350px] max-h-[450px] bg-theme-secondary shadow-2xl rounded-xl border border-theme-border z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-theme-border bg-theme-tertiary flex justify-between items-center shrink-0">
            <h3 className="font-bold text-theme-text flex items-center gap-2">Bildirimler</h3>
            {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-blue-500 hover:text-blue-400 transition font-medium bg-blue-500/10 px-2 py-1 rounded">Tümünü Oku</button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-theme-muted opacity-60">
                <span className="text-5xl mb-3">📭</span><p className="text-sm font-medium">Yeni bildirim yok.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} onClick={() => markAsRead(notif.id)}
                  className={`p-3 rounded-lg cursor-pointer transition flex gap-3 items-start ${notif.is_read ? 'bg-transparent hover:bg-theme-primary/50 opacity-70' : 'bg-theme-primary border-l-4 border-blue-500 shadow-sm hover:shadow-md'}`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{notif.type.includes('friend') ? '👤' : '💬'}</span>
                  <div className="flex flex-col">
                      <p className={`text-sm ${notif.is_read ? 'text-theme-muted' : 'text-theme-text font-medium'}`}>{notif.content}</p>
                      {notif.created_at && (
                        <span className="text-[10px] text-theme-muted mt-1">
                          {new Date(notif.created_at).toLocaleString([], {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'short'})}
                        </span>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationManager;