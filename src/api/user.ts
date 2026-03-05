// src/api/user.ts
import apiClient from './apiClient';

// Kullanıcının kendi profil bilgilerini çeker
export const getCurrentUser = async () => {
  const response = await apiClient.get('/user/me');
  return response.data;
};

// Kullanıcının arkadaşlarını çeker
export const getFriendsList = async () => {
  const response = await apiClient.get('/friends/list');
  return response.data; // Dizi (Array) dönmesi bekleniyor
};

// Gelen arkadaşlık isteklerini çeker
export const getPendingRequests = async () => {
  const response = await apiClient.get('/friends/requests');
  return response.data; // Dizi (Array) dönmesi bekleniyor
};