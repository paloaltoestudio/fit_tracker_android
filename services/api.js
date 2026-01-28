import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

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
        throw new Error(errorData.message || errorData.detail || `Error: ${response.status}`);
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

  // Profile endpoints
  async getProfile() {
    return await this.request('/profile');
  }

  async updateProfile(data) {
    const body = {
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      age: data.age == null || data.age === '' ? null : Number(data.age),
    };
    return await this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

export default new ApiService();
