# API Configuration

This directory contains environment configuration for the app.

## API Configuration (`api.js`)

Controls which API endpoint the app uses.

### Current Configuration

- **Local API**: `http://localhost:8000/api/v1`
- **Production/Test API**: `https://fit-tracker-api.onrender.com/api/v1`

### How to Switch Environments

**Option 1: Simple Toggle (Recommended)**
Edit `config/api.js` and change the `isLocal` constant:

```javascript
export const isLocal = true;  // Use local API
export const isLocal = false; // Use production API
```

**Option 2: Using React Native's __DEV__**
The file includes a commented option to automatically use local in development:

```javascript
export const isLocal = __DEV__; // Automatically uses local when in dev mode
```

**Option 3: Environment Variables**
For more advanced setup, you can use environment variables (requires additional babel plugin setup).

### Quick Switch Guide

1. **For Local Development**: Set `isLocal = true`
2. **For Testing/Production**: Set `isLocal = false`

The API base URL will automatically update based on this setting.

### Notes

- When `isLocal = true`, make sure your local server is running on `http://localhost:8000`
- For mobile devices (iOS/Android), you may need to use your computer's IP address instead of `localhost`:
  - Example: `http://192.168.1.100:8000/api/v1`
- For web, `localhost` works fine
- The current environment is logged to console in development mode
