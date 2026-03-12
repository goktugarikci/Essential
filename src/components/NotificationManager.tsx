// src/components/NotificationManager.tsx
import React, { useEffect } from 'react';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { useWebSocket } from '../hooks/useWebSocket';


// Uygulamanın Chrome'da mı yoksa Tauri Masaüstü'nde mi çalıştığını anlar
const isTauri = () => {
  return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;
};
const NotificationManager: React.FC = () => {
  const { lastMessage } = useWebSocket('/notifications');

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (!isTauri()) {
          console.log("Web tarayıcısı algılandı. Tauri bildirimleri devre dışı.");
          return; // Tarayıcıdaysak işlemi tamamen kes ve hata almayı engelle
        }
        
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
          const permission = await requestPermission();
          permissionGranted = permission === 'granted';
        }
      } catch (error) {
        console.warn("Bildirim izni alınırken hata oluştu:", error);
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      triggerDesktopNotification(lastMessage);
    }
  }, [lastMessage]);

  const triggerDesktopNotification = async (message: any) => {
    try {
      if (!isTauri()) return; // Tarayıcıdaysak bildirimi atla

      const hasPermission = await isPermissionGranted();
      if (!hasPermission) return;

      switch (message.type) {
        case 'NEW_MESSAGE':
          sendNotification({
            title: `Yeni Mesaj: ${message.payload.sender_name}`,
            body: message.payload.content,
          });
          break;
        case 'FRIEND_REQUEST':
          sendNotification({
            title: 'Yeni Arkadaşlık İsteği',
            body: `${message.payload.username} sana arkadaşlık isteği gönderdi.`,
          });
          break;
        case 'TASK_ASSIGNED':
          sendNotification({
            title: 'Kanban: Yeni Görev',
            body: `"${message.payload.task_title}" görevi sana atandı.`,
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn("Masaüstü bildirimi gönderilemedi:", error);
    }
  };

  return null; 
};

export default NotificationManager;