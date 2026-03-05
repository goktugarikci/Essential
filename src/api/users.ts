import apiClient from './apiClient';
import { User } from './types';

export const getProfile = async () => {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
};

export const sendFriendRequest = async (targetUserId: string) => {
  const { data } = await apiClient.post('/users/friends/request', { target_user_id: targetUserId });
  return data;
};

export const getFriends = async () => {
  const { data } = await apiClient.get('/users/friends');
  return data;
};
export const updateProfile = async (profileData: any) => {
  const { data } = await apiClient.put('/users/me', profileData);
  return data;
};

export const acceptFriendRequest = async (requestId: string) => {
  const { data } = await apiClient.post(`/users/friends/requests/${requestId}/accept`);
  return data;
};

export const rejectFriendRequest = async (requestId: string) => {
  const { data } = await apiClient.post(`/users/friends/requests/${requestId}/reject`);
  return data;
};

export const removeFriend = async (friendId: string) => {
  const { data } = await apiClient.delete(`/users/friends/${friendId}`);
  return data;
};

export const blockUser = async (userId: string) => {
  const { data } = await apiClient.post('/users/blocks', { target_user_id: userId });
  return data;
};

export const unblockUser = async (userId: string) => {
  const { data } = await apiClient.delete(`/users/blocks/${userId}`);
  return data;
};

// Kullanıcının kendi profil bilgilerini çeker
export const getCurrentUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

// Kullanıcının arkadaşlarını çeker
export const getFriendsList = async () => {
  const response = await apiClient.get('/friends');
  return response.data; // Dizi (Array) dönmesi bekleniyor
};

// Gelen arkadaşlık isteklerini çeker
export const getPendingRequests = async () => {
  const response = await apiClient.get('/friends/requests');
  return response.data; // Dizi (Array) dönmesi bekleniyor
};