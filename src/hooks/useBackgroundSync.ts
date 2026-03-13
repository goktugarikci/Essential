import { useEffect } from 'react';
import apiClient from '../api/apiClient';
// Eğer Redux, Zustand veya React Context kullanıyorsan import et
// import { useStore } from '../store';

export const useBackgroundSync = (intervalMs: number = 30000) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const syncData = async () => {
      try {
        console.log("🔄 Arka plan senkronizasyonu çalışıyor...");
        
        // 1. Bildirimleri Güncelle
        const notifRes = await apiClient.get('/api/notifications');
        // setNotifications(notifRes.data); // State'i güncelle
        
        // 2. Arkadaş Listesini Güncelle (Kabul edilenleri görmek için)
        const friendsRes = await apiClient.get('/api/friends');
        // setFriends(friendsRes.data); // State'i güncelle
        
        // 3. Bekleyen İstekleri Güncelle
        const requestsRes = await apiClient.get('/api/friends/requests');
        // setFriendRequests(requestsRes.data); // State'i güncelle

      } catch (error) {
        console.error("Senkronizasyon hatası:", error);
      }
    };

    // İlk açılışta hemen çalıştır
    syncData();

    // Belirlenen sürede bir tekrar et (Örn: 30 sn)
    const intervalId = setInterval(syncData, intervalMs);

    return () => clearInterval(intervalId);
  }, [intervalMs]);
};