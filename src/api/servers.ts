import apiClient from './apiClient';
import { ServerData } from './types';

export const getAllServers = async () => {
  const { data } = await apiClient.get('/servers');
  return data;
};

export const createServer = async (serverData: ServerData) => {
  const { data } = await apiClient.post('/servers', serverData);
  return data;
};

export const createChannel = async (serverId: string, name: string, type: 'text' | 'voice' | 'kanban') => {
  const { data } = await apiClient.post(`/servers/${serverId}/channels`, { name, type });
  return data;
};

export const generateInvite = async (serverId: string) => {
  const { data } = await apiClient.post(`/servers/${serverId}/invites`);
  return data;
};
export const updateServer = async (serverId: string, updateData: any) => {
  const { data } = await apiClient.put(`/servers/${serverId}`, updateData);
  return data;
};

export const deleteServer = async (serverId: string) => {
  const { data } = await apiClient.delete(`/servers/${serverId}`);
  return data;
};

// --- Üye ve Moderasyon ---
export const getServerMembers = async (serverId: string) => {
  const { data } = await apiClient.get(`/servers/${serverId}/members`);
  return data;
};

export const kickMember = async (serverId: string, userId: string) => {
  const { data } = await apiClient.delete(`/servers/${serverId}/members/${userId}`);
  return data;
};

export const banMember = async (serverId: string, userId: string, reason?: string) => {
  const { data } = await apiClient.post(`/servers/${serverId}/bans`, { user_id: userId, reason });
  return data;
};

// --- Roller ---
export const createRole = async (serverId: string, roleName: string, permissions: number) => {
  const { data } = await apiClient.post(`/servers/${serverId}/roles`, { name: roleName, permissions });
  return data;
};

export const assignRole = async (serverId: string, userId: string, roleId: string) => {
  const { data } = await apiClient.post(`/servers/${serverId}/members/${userId}/roles`, { role_id: roleId });
  return data;
};