import React, { useEffect } from 'react';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { useWebSocket } from '../hooks/useWebSocket';

const NotificationManager: React.FC = () => {
  // Global bir bildirim kanalı dinliyoruz (Kendi backend mimarinize göre URL'yi güncelleyebilirsiniz)
  const { lastMessage } = useWebSocket('/notifications');

  useEffect(() => {
    // Uygulama açıldığında işletim sisteminden bildirim izni iste
    const checkPermissions = async () => {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    // WebSocket'ten yeni bir mesaj/bildirim geldiğinde tetiklenir
    if (lastMessage) {
      triggerDesktopNotification(lastMessage);
    }
  }, [lastMessage]);

  const triggerDesktopNotification = async (message: any) => {
    const hasPermission = await isPermissionGranted();
    if (!hasPermission) return;

    // Backend'den gelen olay (event) tipine göre bildirimi şekillendiriyoruz
    switch (message.type) {
      case 'NEW_MESSAGE':
        sendNotification({
          title: `Yeni Mesaj: ${message.payload.sender_name}`,
          body: message.payload.content,
          // İsteğe bağlı: icon: 'path/to/icon.png'
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
  };

  // Bu bileşen görsel bir şey render etmez, sadece arka planda çalışır
  return null; 
};

export default NotificationManager;