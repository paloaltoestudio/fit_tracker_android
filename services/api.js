import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://fit-tracker-api.onrender.com/api/v1';

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
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'An error occurred');
      }

      if (!response.ok) {
        throw new Error(data.message || data.detail || `Error: ${response.status}`);
      }

      return data;
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
}

export default new ApiService();
