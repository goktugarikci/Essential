// src/components/ChatArea.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getChatHistory } from '../api/users'; 

interface User {
  id: string;
  name: string;
  email?: string;
  status: 'online' | 'offline' | 'busy';
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface ChatAreaProps {
  currentUser: User | null;
  friend: User;
  onClose: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ currentUser, friend, onClose }) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // İki kullanıcı için ortak benzersiz oda ID'si
  const chatChannelId = currentUser ? [currentUser.id, friend.id].sort().join('_') : '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. ESKİ MESAJLARI ÇEK
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const historyData = await getChatHistory(friend.id);
        const formattedHistory = Array.isArray(historyData) ? historyData.map((msg: any) => ({
          id: msg.id || msg.ID || Date.now().toString() + Math.random().toString(36).substring(2, 5),
          senderId: msg.sender_id || msg.SenderID || msg.senderId || msg.RequesterID,
          text: msg.content || msg.Content || msg.message || msg.Message,
          timestamp: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'
        })) : [];

        setMessages(formattedHistory);
      } catch (error) {
        console.error("Geçmiş çekilemedi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [friend.id]);

  // 2. KURŞUN GEÇİRMEZ WEBSOCKET BAĞLANTISI
  useEffect(() => {
    if (!currentUser?.id || !chatChannelId) return;

    let isComponentMounted = true;
    let socket: WebSocket | null = null;

    const connectWebSocket = () => {
      if (!isComponentMounted) return;
      
      setWsStatus('connecting');
      socket = new WebSocket('ws://localhost:8080/ws/chat');
      wsRef.current = socket;

      socket.onopen = () => {
        if (!isComponentMounted) {
          socket?.close();
          return;
        }
        setWsStatus('connected');
        // Odaya kayıt oluyoruz
        socket?.send(JSON.stringify({ type: "subscribe", channel_id: chatChannelId }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "message" && data.sender_id && data.text) {
            
            // DİKKAT: C++ sunucusu mesajı odadaki herkese yansıttığı için (Echo)
            // Kendi gönderdiğimiz mesajı tekrar alıp ekrana çift basmamak için engelliyoruz!
            if (data.sender_id === currentUser.id) return;

            const incomingMsg: Message = {
              id: data.id || Date.now().toString(),
              senderId: data.sender_id,
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => {
              if (prev.some(msg => msg.id === incomingMsg.id)) return prev;
              return [...prev, incomingMsg];
            });
          }
        } catch (err) {
          console.error("Gelen veri okunamadı:", err);
        }
      };

      socket.onclose = () => {
        if (isComponentMounted) {
          console.warn("⚠️ [WS] Bağlantı koptu. 2 saniye içinde yeniden bağlanılıyor...");
          setWsStatus('error');
          setTimeout(connectWebSocket, 2000); // Otomatik yeniden bağlanma
        }
      };
      
      socket.onerror = () => {
        setWsStatus('error');
      };
    };

    connectWebSocket();

    // TEMİZLEME - React Strict Mode sarı hatalarını engeller
    return () => {
      isComponentMounted = false;
      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        } else if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => socket?.close();
        }
      }
    };
  }, [currentUser?.id, friend.id, chatChannelId]);

  // 3. MESAJ GÖNDERME
  const handleSendMessage = () => {
    if (!inputText.trim() || !currentUser || !wsRef.current) return;
    
    const uniqueId = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9);
    
    // C++'ın beklediği BİREBİR snake_case format
    const payload = {
      type: "message",
      id: uniqueId,
      sender_id: currentUser.id,
      target_id: friend.id,
      text: inputText.trim(),
      is_server: false
    };

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));

      // Kendi ekranımıza anında ekliyoruz
      const myNewMsg: Message = {
        id: uniqueId,
        senderId: currentUser.id, 
        text: inputText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, myNewMsg]);
      setInputText('');
    } else {
      alert("Sunucu ile canlı bağlantı kurulamıyor. Lütfen isminizin yanındaki LED'in yeşil olmasını bekleyin.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-theme-tertiary h-full transition-colors duration-300 relative">
      
      {/* HEADER */}
      <div className="h-16 border-b border-theme-border flex items-center px-6 gap-4 shadow-sm bg-theme-primary shrink-0 transition-colors z-10">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-md">
            {friend.name ? friend.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-theme-primary rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        
        <div className="flex flex-col">
          <span className="font-bold text-theme-text text-base leading-tight flex items-center gap-2">
            {friend.name}
            {/* CANLI BAĞLANTI LED GÖSTERGESİ */}
            {wsStatus === 'connected' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Canlı Bağlantı Aktif"></span>}
            {wsStatus === 'connecting' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Bağlanıyor..."></span>}
            {wsStatus === 'error' && <span className="w-2 h-2 rounded-full bg-red-500" title="Bağlantı Koptu"></span>}
          </span>
          <span className="text-[11px] text-theme-muted leading-tight">
            {wsStatus === 'connected' ? "Uçtan Uca Şifreli Bağlantı Aktif" : "Sunucuya bağlanılıyor..."}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 text-theme-muted">
          <button className="w-9 h-9 rounded-full hover:bg-theme-secondary hover:text-theme-text flex items-center justify-center transition" title="Sesli Arama">📞</button>
          <button className="w-9 h-9 rounded-full hover:bg-theme-secondary hover:text-theme-text flex items-center justify-center transition" title="Görüntülü Arama">📹</button>
          <div className="w-[1px] h-6 bg-theme-border mx-2"></div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition" title="Sohbeti Kapat">✖</button>
        </div>
      </div>

      {/* MESAJLAR ALANI */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-theme-muted my-4 flex justify-center items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Mesaj geçmişi yükleniyor...
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
                <div className="w-8 h-8 rounded-full bg-theme-secondary flex items-center justify-center font-bold text-xs text-theme-text shrink-0 shadow-md">
                  {isMe ? currentUser?.name.charAt(0).toUpperCase() : friend.name.charAt(0).toUpperCase()}
                </div>
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="font-bold text-[11px] text-theme-muted">{isMe ? t('dash_you', {defaultValue: 'Sen'}) : friend.name}</span>
                    <span className="text-[9px] text-theme-muted/70">{msg.timestamp}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-theme-secondary text-theme-text rounded-tl-sm border border-theme-border'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* MESAJ GÖNDERME KUTUSU (FOOTER) */}
      <div className="p-4 bg-theme-primary border-t border-theme-border shrink-0">
        <div className={`bg-theme-secondary rounded-xl pr-2 pl-4 py-2 flex items-center gap-3 border transition-colors shadow-inner ${wsStatus === 'connected' ? 'border-theme-border focus-within:border-blue-500' : 'border-red-500/50'}`}>
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={wsStatus === 'connected' ? `${t('dash_message_placeholder', {defaultValue: 'Mesaj yaz'})} @${friend.name}...` : 'Bağlantı bekleniyor...'}
            disabled={wsStatus !== 'connected'}
            className="flex-1 bg-transparent text-theme-text focus:outline-none text-sm w-full disabled:opacity-50"
            autoFocus
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || wsStatus !== 'connected'}
            className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-theme-tertiary disabled:text-theme-muted flex justify-center items-center text-white transition-all shadow-md"
          >
             <svg className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatArea;