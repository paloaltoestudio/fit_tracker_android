# Fit Tracker - Android App

A React Native mobile app for tracking weight over time with visual charts and full CRUD functionality.

## Features

- ✅ **Add Weight Records**: Enter your weight with date
- ✅ **View Weight Chart**: Visual line graph showing weight variation over time
- ✅ **Edit Records**: Update existing weight records
- ✅ **Delete Records**: Remove unwanted weight records
- ✅ **Statistics**: View current, average, min, max weight and total change
- ✅ **In-Memory Storage**: All data stored in React state (temporary, resets on app restart)

## Getting Started

### Prerequisites

- Node.js (v18.17.0+ or v20+) - **Required for Expo SDK 54** (Node 20 recommended)
- npm or yarn
- Expo CLI
- Android Studio (for Android emulator) OR Expo Go app on your phone

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on Android:
```bash
npm run android
```

Or scan the QR code with Expo Go app on your Android device.

## Project Structure

```
fit_tracker/
├── App.js                 # Main app component with state management
├── components/
│   ├── WeightEntryForm.js # Form to add new weight records
│   ├── WeightList.js      # List of records with edit/delete
│   └── WeightChart.js     # Chart component using react-native-chart-kit
├── package.json
└── README.md
```

## Key Concepts for Learning

### 1. **React Native Basics**
- Components are similar to React web components
- Uses `View` instead of `div`, `Text` instead of `p`, etc.
- StyleSheet API for styling (similar to CSS but camelCase)

### 2. **State Management**
- Uses React hooks (`useState`) to manage weight records
- State is lifted to App.js and passed down as props
- No backend yet - all data stored in component state

### 3. **Navigation & UI**
- Modal component for forms
- FlatList for efficient list rendering
- TouchableOpacity for buttons and interactions

### 4. **Charts**
- Using `react-native-chart-kit` library
- Line chart showing weight over time
- Automatic scaling and formatting

## Next Steps for Learning

1. **Add Persistent Storage**
   - Use AsyncStorage to save data locally
   - Data will persist between app restarts

2. **Add Date Picker**
   - Replace text input with a proper date picker component

3. **Add More Charts**
   - Bar chart, pie chart, or other visualizations

4. **Add Backend Integration**
   - Connect to a REST API
   - Use Firebase or another backend service

5. **Add User Authentication**
   - Login/signup functionality
   - User-specific weight records

## Dependencies

- `expo`: Development platform for React Native
- `react-native-chart-kit`: Charting library
- `react-native-svg`: Required for charts
- `@expo/vector-icons`: Icon library

## Development Tips

- Hot reload is enabled by default
- Shake your device or press `Ctrl+M` (Android) to open developer menu
- Use Expo DevTools for debugging
