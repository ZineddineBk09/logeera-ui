import { api } from '@/lib/api';

export const AuthService = {
  me: () => api('/api/auth/me'),
};

export const TripsService = {
  list: (params: Record<string, string>) =>
    api(`/api/trips?${new URLSearchParams(params).toString()}`),
  get: (id: string) => api(`/api/trips/${id}`),
  create: (payload: any) =>
    api('/api/trips', { method: 'POST', body: JSON.stringify(payload) }),
  nearby: (params: Record<string, string>) =>
    api(`/api/trips/nearby?${new URLSearchParams(params).toString()}`),
  complete: (id: string) =>
    api(`/api/trips/${id}/complete`, { method: 'PATCH' }),
};

export const RequestsService = {
  create: (tripId: string) =>
    api('/api/requests', { method: 'POST', body: JSON.stringify({ tripId }) }),
  setStatus: (id: string, status: 'accepted' | 'rejected') =>
    api(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  incoming: () => api('/api/requests/incoming'),
  outgoing: () => api('/api/requests/outgoing'),
};

export const UsersService = {
  get: (id: string) => api(`/api/users/${id}`),
  create: (payload: any) =>
    api('/api/users', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: any) =>
    api(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const RatingsService = {
  create: (payload: any) =>
    api('/api/ratings', { method: 'POST', body: JSON.stringify(payload) }),
  list: (userId?: string) =>
    api(`/api/ratings${userId ? `?userId=${userId}` : ''}`),
};

export const ChatService = {
  list: () => api('/api/chat'),
  between: (userAId: string, userBId: string, create = true) =>
    api(
      `/api/chat/between?userAId=${userAId}&userBId=${userBId}&create=${create ? 1 : 0}`,
    ),
  messages: (chatId: string) => api(`/api/chat/${chatId}/messages`),
  postMessage: (chatId: string, payload: any) =>
    api(`/api/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
