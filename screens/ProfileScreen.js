import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ onBack }) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getProfile();
      setProfile(data);
      setFirstName(data.first_name ?? '');
      setLastName(data.last_name ?? '');
      setAge(data.age != null ? String(data.age) : '');
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
      Alert.alert('Error', err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const ageNum = age.trim() === '' ? null : parseInt(age, 10);
    if (age.trim() !== '' && (isNaN(ageNum) || ageNum < 0 || ageNum > 150)) {
      Alert.alert('Invalid Input', 'Please enter a valid age (0–150).');
      return;
    }

    try {
      setIsSaving(true);
      await api.updateProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        age: ageNum,
      });
      setProfile((prev) => ({
        ...prev,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        age: ageNum,
      }));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const dark = {
    background: '#070B14',
    card: '#0B1120',
    border: '#1B2438',
    text: '#EAF2FF',
    mutedText: '#7D8AA3',
    primary: '#00FFD1',
    inputBg: '#111A2F',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={dark.background} />
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={dark.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.rightButton}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={24} color={dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={dark.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <Text style={styles.readOnlyValue}>{profile?.username ?? '—'}</Text>
              <Text style={styles.hint}>Username cannot be changed</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                placeholderTextColor={dark.mutedText}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                placeholderTextColor={dark.mutedText}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter age"
                placeholderTextColor={dark.mutedText}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
                editable={!isSaving}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={dark.background} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color={dark.background} />
                  <Text style={styles.saveButtonText}>Save changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  header: {
    backgroundColor: '#0B1120',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1B2438',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAF2FF',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  rightButton: {
    width: 32,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7D8AA3',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00FFD1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#070B14',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#0B1120',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1B2438',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7D8AA3',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1B2438',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#111A2F',
    color: '#EAF2FF',
  },
  readOnlyValue: {
    borderWidth: 1,
    borderColor: '#1B2438',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#111A2F',
    color: '#7D8AA3',
  },
  hint: {
    fontSize: 12,
    color: '#7D8AA3',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFD1',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#070B14',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
