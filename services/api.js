import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

function formatErrorDetail(detail) {
  if (detail == null) return null;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (item == null) return null;
      const part = item.msg ?? item.message ?? item.detail ?? item;
      return typeof part === 'string' ? part : (formatErrorDetail(part) || JSON.stringify(part));
    }).filter(Boolean);
    return parts.length ? parts.join('; ') : null;
  }
  if (typeof detail === 'object') {
    const parts = [];
    for (const [key, val] of Object.entries(detail)) {
      if (val != null && typeof val === 'object' && !Array.isArray(val)) {
        parts.push(`${key}: ${formatErrorDetail(val) || JSON.stringify(val)}`);
      } else {
        const text = Array.isArray(val) ? val.join(', ') : String(val);
        parts.push(`${key}: ${text}`);
      }
    }
    return parts.length ? parts.join('; ') : null;
  }
  return String(detail);
}

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = await this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to parse error response as JSON
        let errorData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (e) {
            // If JSON parsing fails, get text
            errorData = { message: await response.text() };
          }
        } else {
          const text = await response.text();
          errorData = { message: text || `Error: ${response.status}` };
        }
        const raw = errorData.message ?? formatErrorDetail(errorData.detail) ?? errorData.detail;
        const msg = typeof raw === 'string' ? raw : (raw != null ? JSON.stringify(raw) : `Error: ${response.status}`);
        throw new Error(msg || `Error: ${response.status}`);
      }

      // Handle empty responses (like 204 No Content for DELETE)
      const contentType = response.headers.get('content-type');
      
      // Check if response has no content (204) or empty body
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null; // Return null for empty successful responses
      }

      // Handle JSON responses
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        // Check if response body is empty
        if (!text || text.trim() === '') {
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          // If JSON parsing fails but we have text, return it as string
          throw new Error(`Invalid JSON response: ${text}`);
        }
      }

      // Handle non-JSON responses (return text)
      const text = await response.text();
      return text || null;
    } catch (error) {
      throw error;
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async removeToken() {
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Auth endpoints
  async login(username, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (data.access_token) {
      await this.setToken(data.access_token);
    }
    
    return data;
  }

  async logout() {
    await this.removeToken();
  }

  // Weight endpoints
  async getWeights() {
    return await this.request('/weights');
  }

  async createWeight(weight, date) {
    // Format date as YYYY-MM-DD
    const formattedDate = typeof date === 'string' 
      ? date.split('T')[0] 
      : new Date(date).toISOString().split('T')[0];
    
    return await this.request('/weights', {
      method: 'POST',
      body: JSON.stringify({
        weight: parseFloat(weight),
        date: formattedDate,
      }),
    });
  }

  async updateWeight(id, weight, date = null) {
    const body = { weight: parseFloat(weight) };
    
    // Only include date if provided
    if (date) {
      const formattedDate = typeof date === 'string'
        ? date.split('T')[0]
        : new Date(date).toISOString().split('T')[0];
      body.date = formattedDate;
    }
    
    return await this.request(`/weights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteWeight(id) {
    return await this.request(`/weights/${id}`, {
      method: 'DELETE',
    });
  }

  // Metrics endpoint (muscle_index, etc.). Weight stays on /weights for now.
  async getMetrics(metricType, { dateFrom, dateTo } = {}) {
    let endpoint = `/metrics?metric_type=${encodeURIComponent(metricType)}`;
    if (dateFrom) endpoint += `&date_from=${encodeURIComponent(String(dateFrom).split('T')[0])}`;
    if (dateTo) endpoint += `&date_to=${encodeURIComponent(String(dateTo).split('T')[0])}`;
    return await this.request(endpoint);
  }

  async createMetric(metricType, date, value) {
    const formattedDate = typeof date === 'string'
      ? date.split('T')[0]
      : new Date(date).toISOString().split('T')[0];
    return await this.request('/metrics', {
      method: 'POST',
      body: JSON.stringify({
        metric_type: metricType,
        date: formattedDate,
        value,
      }),
    });
  }

  async updateMetric(id, value, date = null) {
    const body = { value };
    if (date) {
      const formattedDate = typeof date === 'string'
        ? date.split('T')[0]
        : new Date(date).toISOString().split('T')[0];
      body.date = formattedDate;
    }
    return await this.request(`/metrics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteMetric(id) {
    return await this.request(`/metrics/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile endpoints
  async getProfile() {
    return await this.request('/profile');
  }

  async updateProfile(data) {
    const body = {};
    const firstName = data.first_name != null ? String(data.first_name).trim() : '';
    if (firstName !== '') body.first_name = firstName;
    const lastName = data.last_name != null ? String(data.last_name).trim() : '';
    if (lastName !== '') body.last_name = lastName;
    const age = data.age == null || data.age === '' ? null : Number(data.age);
    if (age != null && !Number.isNaN(age)) body.age = age;
    const gender = data.gender != null ? String(data.gender).trim() : '';
    if (gender !== '') body.gender = gender;
    const heightCm = data.height_cm == null || data.height_cm === '' ? null : Number(data.height_cm);
    if (heightCm != null && !Number.isNaN(heightCm)) body.height_cm = heightCm;
    return await this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

export default new ApiService();
