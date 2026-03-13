import apiClient from './apiClient';

export const getAuditLogs = async (serverId: string) => {
  const { data } = await apiClient.get(`/api/servers/${serverId}/audit-logs`);
  return data;
};

export const reportUserOrMessage = async (targetId: string, type: 'user' | 'message', reason: string) => {
  const { data } = await apiClient.post('/api/reports', { target_id: targetId, type, reason });
  return data;
};

// Abonelik (Freemium Limits) Kontrolü / Ödeme
export const getSubscriptionStatus = async () => {
  const { data } = await apiClient.get('/api/billing/status');
  return data;
};

export const createCheckoutSession = async (planId: string) => {
  const { data } = await apiClient.post('/api/billing/checkout', { plan_id: planId });
  return data;
};