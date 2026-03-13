import { useEffect, useRef, useState, useCallback } from 'react';

// Backend WebSocket URL'niz (.env dosyasından da çekilebilir)
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080";

export const useWebSocket = (channelUrl: string = "/ws/chat") => {
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // DÜZELTME: NodeJS.Timeout yerine tarayıcı uyumlu 'number' (veya ReturnType) kullanıyoruz.
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    // Projenizdeki isimlendirmeye göre token'ı çekiyoruz
    const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
    
    if (!token) {
      console.error("WebSocket bağlantısı için token bulunamadı.");
      return;
    }

    // Zaten bağlıysa tekrar bağlanmayı engelle
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
    }

    // Backend URL parametresi olarak değil, düz bir hat olarak bağlantı bekliyor
    const wsUrl = `${WS_BASE_URL}${channelUrl}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket bağlantısı kuruldu:", channelUrl);
      setIsConnected(true);
      
      // 🚨 KRİTİK NOKTA: C++ Backend'in beklediği Güvenlik (Auth) Paketi!
      // Bağlantı açılır açılmaz kimliğimizi ispatlıyoruz, yoksa sunucu bizi atar.
      ws.send(JSON.stringify({ type: "auth", token: token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data); // Gelen veriyi state'e kaydediyoruz
        
      } catch (error) {
        console.error("WebSocket mesajı parse edilemedi:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket bağlantısı kapandı. Yeniden bağlanılıyor...");
      setIsConnected(false);
      
      // Otomatik yeniden bağlanma (Auto-reconnect) mantığı (window.setTimeout eklendi)
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000); // Bağlantı koparsa 3 saniye sonra tekrar dene
    };

    ws.onerror = (error) => {
      console.error("WebSocket hatası:", error);
      ws.close(); // Hata alırsak bağlantıyı temizle ve onclose'un reconnect'i tetiklemesine izin ver
    };

    wsRef.current = ws;
  }, [channelUrl]);

  useEffect(() => {
    connect();

    // Bileşen ekrandan kalktığında (unmount) temizlik yap
    return () => {
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Unmount olurken reconnect döngüsüne girmemesi için onclose eventini iptal ediyoruz
        wsRef.current.onclose = null; 
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Uygulama içinden sunucuya gerçek zamanlı mesaj/olay göndermek için fonksiyon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessage = (type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      
      // C++ Backend düz bir JSON bekliyor (İç içe 'payload' objesi değil).
      // Bu yüzden 'type' ile 'payload'ın içindeki verileri tek bir objede birleştiriyoruz.
      wsRef.current.send(JSON.stringify({ type, ...payload }));
      
    } else {
      console.warn("WebSocket bağlı değil, mesaj gönderilemedi.");
    }
  };

  return { isConnected, lastMessage, sendMessage };
};