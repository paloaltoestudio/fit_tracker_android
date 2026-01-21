// Environment configuration
// Set isLocal to true to use local API, false for production/test API

// Option 1: Simple constant (easiest for quick changes)
export const isLocal = false; // Change this to true for local development

// Option 2: Using __DEV__ (React Native built-in - true in development mode)
// export const isLocal = __DEV__;

// Option 3: Using environment variable (requires babel plugin)
// For this to work, you'd need to install babel-plugin-transform-inline-environment-variables
// export const isLocal = process.env.IS_LOCAL === 'true';

// API Base URLs
const LOCAL_API_URL = 'http://localhost:8000/api/v1';
const PRODUCTION_API_URL = 'https://fit-tracker-api.onrender.com/api/v1';

// Select API URL based on environment
export const API_BASE_URL = isLocal ? LOCAL_API_URL : PRODUCTION_API_URL;

// Helper function to get current environment name
export const getEnvironment = () => {
  return isLocal ? 'local' : 'production';
};

// Log current API URL (only in development)
if (__DEV__) {
  console.log(`🔧 API Environment: ${getEnvironment()}`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
}
