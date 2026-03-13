import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastMessage: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage: (type: string, payload: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 🚨 TEK MERKEZ: Soket bağlantısı sadece burada, 1 kere açılır!
  const ws = useWebSocket('/ws/chat');

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

// İstediğimiz bileşenden çağırmak için global kancamız (Hook)
export const useGlobalWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useGlobalWebSocket mutlaka WebSocketProvider içinde kullanılmalıdır!");
  }
  return context;
};