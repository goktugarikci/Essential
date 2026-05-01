// src/api/users.ts
import apiClient from './apiClient';

// ==========================================================
// 1. KULLANICI PROFİL İŞLEMLERİ
// ==========================================================

// Mevcut giriş yapmış kullanıcıyı getirir
export const getCurrentUser = async () => {
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

// Kullanıcı profilini günceller
export const updateProfile = async (profileData: any) => {
  const { data } = await apiClient.put('/api/users/me', profileData);
  return data;
};

// İsim veya e-posta ile sistemde kullanıcı arar
export const searchUsers = async (query: string) => {
  const { data } = await apiClient.get(`/api/users/search?q=${query}`);
  return data;
};

// ==========================================================
// 2. ARKADAŞLIK VE İSTEK İŞLEMLERİ
// ==========================================================

// Kabul edilmiş (Status=1) arkadaşların listesini getirir
export const getFriendsList = async () => {
  const { data } = await apiClient.get('/api/friends');
  return data;
};

// Bekleyen (Status=0) Gelen ve Giden istekleri getirir
export const getPendingRequests = async () => {
  const { data } = await apiClient.get('/api/friends/requests');
  return data;
};

// Yeni bir arkadaşlık isteği gönderir
export const sendFriendRequest = async (targetId: string) => {
  // C++ Backend 'target_id' adında bir JSON anahtarı bekliyor
  const { data } = await apiClient.post('/api/friends/request', { target_id: targetId });
  return data;
};

// Gelen bir arkadaşlık isteğini kabul eder (Status=1 yapar)
export const acceptFriendRequest = async (requesterId: string) => {
  // C++ Backend { "status": "accepted" } JSON gövdesini bekliyor
  const { data } = await apiClient.put(`/api/friends/requests/${requesterId}`, { status: "accepted" });
  return data;
};

// Gelen bir isteği reddeder veya giden bir isteği iptal eder (Veritabanından siler)
export const rejectFriendRequest = async (targetOrRequesterId: string) => {
  // C++ Backend { "status": "rejected" } JSON gövdesini bekliyor
  const { data } = await apiClient.put(`/api/friends/requests/${targetOrRequesterId}`, { status: "rejected" });
  return data;
};

// Mevcut bir arkadaşı listeden çıkarır
export const removeFriend = async (friendId: string) => {
  const { data } = await apiClient.delete(`/api/friends/${friendId}`);
  return data;
};

// ==========================================================
// 3. ENGELLEME (BLOCK) İŞLEMLERİ (Gelecek için altyapı)
// ==========================================================

export const getBlockedUsers = async () => {
  const { data } = await apiClient.get('/api/friends/blocks');
  return data;
};

export const blockUser = async (targetId: string) => {
  const { data } = await apiClient.post('/api/friends/blocks', { target_id: targetId });
  return data;
};

export const unblockUser = async (targetId: string) => {
  const { data } = await apiClient.delete(`/api/friends/blocks/${targetId}`);
  return data;
};
export const getChatHistory = async (friendId: string) => {
  // C++ Backend: GET /api/chat/history/<id> (veya /api/messages/<id>)
  const { data } = await apiClient.get(`/api/chat/history/${friendId}`);
  return data;
};
// Mesaj Gönderme
export const sendMessage = async (targetId: string, content: string) => {
  // Backend yapısına uygun olarak POST isteği
  const { data } = await apiClient.post('/api/chat/messages', { 
    target_id: targetId, 
    content: content 
  });
  return data;
};

// Mesajları Okundu Olarak İşaretleme
export const markMessagesAsRead = async (friendId: string) => {
  const { data } = await apiClient.put(`/api/chat/read/${friendId}`);
  return data;
};