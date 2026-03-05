import apiClient from './apiClient';
import { User } from './types';


export const registerUser = async (name: string, email: string, password: string) => {
  const response = await apiClient.post('/auth/register', { name, email, password });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};
export const enable2FA = async () => {
  const { data } = await apiClient.post('/auth/2fa/enable');
  return data;
};