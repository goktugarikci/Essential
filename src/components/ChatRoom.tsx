import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { MessageData } from '../api/types';

interface ChatRoomProps {
  channelId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ channelId }) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  
  // Hook'u çağırarak anlık bağlantıyı başlatıyoruz
  // (Örn: ws://localhost:8080/ws/chat?token=...)
  const { isConnected, lastMessage, sendMessage } = useWebSocket('/chat');

  // Sunucudan yeni bir WebSocket mesajı geldiğinde tetiklenir
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NEW_MESSAGE') {
      // Eğer gelen mesaj bulunduğumuz kanala aitse listeye ekle
      if (lastMessage.payload.channel_id === channelId) {
        setMessages((prev) => [...prev, lastMessage.payload]);
      }
    }
  }, [lastMessage, channelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // REST API yerine doğrudan WebSocket üzerinden de mesaj gönderebilirsiniz
    sendMessage('SEND_MESSAGE', { channel_id: channelId, content: inputText });
    setInputText("");
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <h3>Sohbet Kanalı {isConnected ? "🟢(Bağlı)" : "🔴(Bağlantı Yok)"}</h3>
      
      <div style={{ height: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: '0.5rem 0', padding: '0.5rem', background: '#f0f0f0' }}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Mesajınızı yazın..."
          style={{ flexGrow: 1, padding: '0.5rem' }}
        />
        <button type="submit" disabled={!isConnected} style={{ padding: '0.5rem 1rem' }}>
          Gönder
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;