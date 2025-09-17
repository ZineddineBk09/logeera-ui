import { APP_CONFIG } from "@/constants";

export class AdminService {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Admin API error: ${response.statusText}`);
    }

    return response;
  }

  // Dashboard stats
  static async getDashboardStats(timeRange: string = 'week') {
    return this.request(`/admin/dashboard?timeRange=${timeRange}`);
  }

  // Users management
  static async getUsers(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    return this.request(`/admin/users?${params.toString()}`);
  }

  static async getUser(userId: string) {
    return this.request(`/admin/users/${userId}`);
  }

  static async updateUser(userId: string, data: any) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async blockUser(userId: string) {
    return this.request(`/admin/users/${userId}/block`, {
      method: 'POST',
    });
  }

  static async unblockUser(userId: string) {
    return this.request(`/admin/users/${userId}/unblock`, {
      method: 'POST',
    });
  }

  static async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Trips management
  static async getTrips(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    return this.request(`/admin/trips?${params.toString()}`);
  }

  static async getTrip(tripId: string) {
    return this.request(`/admin/trips/${tripId}`);
  }

  static async updateTrip(tripId: string, data: any) {
    return this.request(`/admin/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteTrip(tripId: string) {
    return this.request(`/admin/trips/${tripId}`, {
      method: 'DELETE',
    });
  }

  // Requests management
  static async getRequests(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    return this.request(`/admin/requests?${params.toString()}`);
  }

  static async getRequest(requestId: string) {
    return this.request(`/admin/requests/${requestId}`);
  }

  static async updateRequest(requestId: string, data: any) {
    return this.request(`/admin/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Messages management
  static async getMessages(page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    
    return this.request(`/admin/messages?${params.toString()}`);
  }

  static async getMessage(messageId: string) {
    return this.request(`/admin/messages/${messageId}`);
  }

  static async deleteMessage(messageId: string) {
    return this.request(`/admin/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  static async getAnalytics(timeRange: string = 'week') {
    return this.request(`/admin/analytics?timeRange=${timeRange}`);
  }

  // Settings
  static async getSettings() {
    return this.request('/admin/settings');
  }

  static async updateSettings(data: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
