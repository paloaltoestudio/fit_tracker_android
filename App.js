import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import HomeScreen from './screens/HomeScreen';
import WeightJournalScreen from './screens/WeightJournalScreen';
import ProfileScreen from './screens/ProfileScreen';

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Handle navigation between screens
  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  // Render appropriate screen based on navigation state
  switch (currentScreen) {
    case 'weight-journal':
      return <WeightJournalScreen onBack={handleBack} />;
    case 'profile':
      return <ProfileScreen onBack={handleBack} />;
    case 'home':
    default:
      return <HomeScreen onNavigate={handleNavigate} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
