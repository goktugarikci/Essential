import { useEffect, useRef, useState } from 'react';

// Backend WebSocket URL'niz (.env dosyasından da çekilebilir)
const WS_BASE_URL = "ws://localhost:8080/ws";

interface WebSocketMessage {
  type: string;
  payload: any;
}

export const useWebSocket = (channelUrl: string = "/chat") => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // LocalStorage'dan JWT token'ı alıyoruz
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
      console.error("WebSocket bağlantısı için token bulunamadı.");
      return;
    }

    // Token'ı URL parametresi olarak ekleyerek bağlantıyı başlatıyoruz
    const wsUrl = `${WS_BASE_URL}${channelUrl}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket bağlantısı kuruldu:", channelUrl);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(data); // Gelen veriyi state'e kaydediyoruz
        
        // İsterseniz burada gelen veri tipine göre global olaylar (events) tetikleyebilirsiniz
        // Örn: if (data.type === 'NEW_MESSAGE') { ... }
      } catch (error) {
        console.error("WebSocket mesajı parse edilemedi:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket bağlantısı kapandı.");
      setIsConnected(false);
      // Not: Masaüstü uygulamasında bağlantı koparsa otomatik yeniden bağlanma (auto-reconnect) 
      // mantığı ileride buraya eklenebilir.
    };

    ws.onerror = (error) => {
      console.error("WebSocket hatası:", error);
    };

    wsRef.current = ws;

    // Bileşen ekrandan kalktığında bağlantıyı temizle
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [channelUrl]); // URL değişirse bağlantıyı yenile

  // Uygulama içinden sunucuya gerçek zamanlı mesaj/olay göndermek için bir fonksiyon
  const sendMessage = (type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("WebSocket bağlı değil, mesaj gönderilemedi.");
    }
  };

  return { isConnected, lastMessage, sendMessage };
};