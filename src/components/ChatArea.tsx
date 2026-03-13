import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalWebSocket } from '../contexts/WebSocketContext'; // 🟢 DÜZELTİLDİ

interface User { id: string; name: string; status: 'online' | 'offline' | 'busy'; }
interface Message { id: string; senderId: string; text: string; timestamp: string; attachmentUrl?: string; }
interface ChatAreaProps { currentUser: User | null; friend: User; onClose: () => void; }

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ChatArea: React.FC<ChatAreaProps> = ({ currentUser, friend, onClose }) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🚨 ARTIK GLOBAL SOKETİ KULLANIYORUZ (Yeni bağlantı açmaz, var olana katılır)
  const { sendMessage: sendWsMessage, lastMessage } = useGlobalWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Canlı Mesaj Dinleyici
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_message') {
      const isRelevant = 
        (lastMessage.gönderenID === friend.id && lastMessage.alıcıID === currentUser?.id) ||
        (lastMessage.gönderenID === currentUser?.id && lastMessage.alıcıID === friend.id);

      if (isRelevant) {
        const newMsg: Message = {
          id: Date.now().toString(),
          senderId: lastMessage.gönderenID,
          text: lastMessage.Mesaj,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachmentUrl: lastMessage.attachmentUrl || undefined
        };
        
        setMessages((prev) => [...prev, newMsg]);

        if (lastMessage.gönderenID === friend.id && currentUser) {
            sendWsMessage('read_receipt', { reader_id: currentUser.id, sender_id: friend.id });
        }
      }
    }
  }, [lastMessage, friend.id, currentUser?.id, sendWsMessage]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentUser) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);

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
      <div className="h-14 border-b border-theme-border flex items-center px-6 gap-4 shadow-sm bg-theme-primary shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-theme-muted">@</span>
          <div className="font-bold text-theme-text text-lg">{friend.name}</div>
          <div className={`w-2.5 h-2.5 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        <div className="ml-auto flex items-center gap-4 text-theme-muted">
          <button onClick={onClose} className="hover:text-red-500 transition" title="Sohbeti Kapat">✖</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
              <div className="w-10 h-10 rounded-full bg-theme-secondary flex items-center justify-center font-bold text-theme-text shrink-0 shadow-md">
                {isMe ? currentUser?.name.charAt(0).toUpperCase() : friend.name.charAt(0).toUpperCase()}
              </div>
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="font-bold text-sm text-theme-text">{isMe ? currentUser?.name : friend.name}</span>
                  <span className="text-[10px] text-theme-muted">{msg.timestamp}</span>
                </div>
                <div className={`p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-theme-secondary text-theme-text rounded-tl-none border border-theme-border'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-theme-tertiary shrink-0">
        <div className="bg-theme-secondary rounded-xl p-2 flex items-center gap-3 border border-theme-border focus-within:border-blue-500 transition-colors shadow-inner">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`@${friend.name} kullanıcısına mesaj gönder...`}
            className="flex-1 bg-transparent text-theme-text focus:outline-none text-sm px-2"
          />
          <button onClick={handleSendMessage} className="w-10 h-10 rounded-full flex justify-center items-center text-theme-muted hover:bg-theme-primary hover:text-blue-500 transition">
            <span>🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;