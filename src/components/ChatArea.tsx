// src/components/ChatArea.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../hooks/useWebSocket'; // WebSocket Hook'umuzu ekledik

interface User {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string; // Backend'den gelebilecek medya dosyaları için
}

interface ChatAreaProps {
  currentUser: User | null;
  friend: User;
  onClose: () => void;
}

// Resim vb. dosyalar için Backend Base URL
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ChatArea: React.FC<ChatAreaProps> = ({ currentUser, friend, onClose }) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket Bağlantısını Çağırıyoruz
  const { sendMessage: sendWsMessage, lastMessage } = useWebSocket('/ws/chat');

  // Sayfa açıldığında API'den geçmiş mesajları çekmek için bir useEffect eklenebilir.
  // Örn: apiClient.get(`/api/chat/history/${friend.id}`).then(res => setMessages(res.data));

  // Yeni mesaj eklendiğinde en alta kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Backend'den Canlı Mesaj (WebSocket) Geldiğinde Yakala
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_message') {
      // Mesajın bu sohbete (bana veya arkadaşıma) ait olup olmadığını kontrol et
      const isRelevant = 
        (lastMessage.gönderenID === friend.id && lastMessage.alıcıID === currentUser?.id) ||
        (lastMessage.gönderenID === currentUser?.id && lastMessage.alıcıID === friend.id);

      if (isRelevant) {
        const newMsg: Message = {
          id: Date.now().toString(), // React list key için geçici ID
          senderId: lastMessage.gönderenID,
          text: lastMessage.Mesaj, // Backend "Mesaj" key'i ile yolluyor
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachmentUrl: lastMessage.attachmentUrl || undefined
        };
        
        // Gelen mesajı ekrana bas
        setMessages((prev) => [...prev, newMsg]);

        // Karşı tarafa "Okundu" (Mavi Tik) bilgisini geri yolla
        if (lastMessage.gönderenID === friend.id && currentUser) {
            sendWsMessage('read_receipt', {
                reader_id: currentUser.id,
                sender_id: friend.id
            });
        }
      }
    }
  }, [lastMessage, friend.id, currentUser?.id]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentUser) return;
    
    // 1. Ekranda (Kendi arayüzümüzde) mesajı hemen göster (Optimistic UI)
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);

    // 2. Mesajı C++ Backend'e (Soket üzerinden) fırlat
    sendWsMessage('message', {
      sender_id: currentUser.id,
      target_id: friend.id,
      text: inputText,
      is_group: false
    });

    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col bg-theme-tertiary h-full transition-colors duration-300">
      
      {/* SOHBET ÜST BARI (HEADER) */}
      <div className="h-14 border-b border-theme-border flex items-center px-6 gap-4 shadow-sm bg-theme-primary shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-theme-muted">@</span>
          <div className="font-bold text-theme-text text-lg">{friend.name}</div>
          <div className={`w-2.5 h-2.5 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>

        <div className="ml-auto flex items-center gap-4 text-theme-muted">
          <button className="hover:text-theme-text transition" title="Sesli Arama">📞</button>
          <button className="hover:text-theme-text transition" title="Görüntülü Arama">📹</button>
          <div className="w-[1px] h-6 bg-theme-border mx-1"></div>
          <button onClick={onClose} className="hover:text-red-500 transition" title="Sohbeti Kapat">✖</button>
        </div>
      </div>

      {/* MESAJLAR ALANI */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Sohbet Başlangıç Bilgisi */}
        <div className="mt-auto flex flex-col items-center justify-center text-center pb-6 border-b border-theme-border/50 mb-4">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center font-bold text-4xl text-white mb-4 shadow-xl">
            {friend.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-theme-text mb-2">{friend.name}</h2>
          <p className="text-theme-muted text-sm">
            Bu mesajlaşma seninle <strong>{friend.name}</strong> arasındaki özel sohbetin başlangıcı.
          </p>
        </div>

        {/* Mesaj Baloncukları */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-theme-secondary flex items-center justify-center font-bold text-theme-text shrink-0 shadow-md">
                {isMe ? currentUser?.name.charAt(0).toUpperCase() : friend.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Mesaj İçeriği */}
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="font-bold text-sm text-theme-text">{isMe ? currentUser?.name : friend.name}</span>
                  <span className="text-[10px] text-theme-muted">{msg.timestamp}</span>
                </div>
                
                <div className={`p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-theme-secondary text-theme-text rounded-tl-none border border-theme-border'}`}>
                  {msg.text}
                  
                  {/* Dosya / Resim Eklentisi Varsa Göster (Güvenli URL birleştirme) */}
                  {msg.attachmentUrl && (
                    <img 
                      src={msg.attachmentUrl.startsWith('/') ? `${BACKEND_URL}${msg.attachmentUrl}` : msg.attachmentUrl} 
                      alt="attachment" 
                      className="mt-2 rounded-lg max-h-48 object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* MESAJ YAZMA ALANI (FOOTER) */}
      <div className="p-4 bg-theme-tertiary shrink-0">
        <div className="bg-theme-secondary rounded-xl p-2 flex items-center gap-3 border border-theme-border focus-within:border-blue-500 transition-colors shadow-inner">
          <button className="w-10 h-10 rounded-full flex justify-center items-center text-theme-muted hover:bg-theme-primary hover:text-theme-text transition">
            <span className="text-xl">⊕</span>
          </button>
          
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`@${friend.name} kullanıcısına mesaj gönder...`}
            className="flex-1 bg-transparent text-theme-text focus:outline-none text-sm"
          />
          
          <button 
            onClick={handleSendMessage}
            className="w-10 h-10 rounded-full flex justify-center items-center text-theme-muted hover:bg-theme-primary hover:text-blue-500 transition">
            <span>🚀</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatArea;