import './i18n';
import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import Login from './components/Login';
import BottomTabBar from './components/BottomTabBar';
import HomeScreen from './screens/HomeScreen';
import WeightJournalScreen from './screens/WeightJournalScreen';
import MuscleIndexScreen from './screens/MuscleIndexScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import ProfileScreen from './screens/ProfileScreen';

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current) {
      setActiveTab('home');
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

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

  const renderTab = () => {
    switch (activeTab) {
      case 'weight':
        return <WeightJournalScreen onBack={null} />;
      case 'body':
        return <MuscleIndexScreen />;
      case 'workouts':
        return <WorkoutsScreen />;
      case 'profile':
        return <ProfileScreen onBack={null} />;
      case 'home':
      default:
        return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <View style={styles.screenContainer}>{renderTab()}</View>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <AppNavigator />
      </LocaleProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070B14',
  },
});
