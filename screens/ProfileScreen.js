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
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../i18n';

export default function ProfileScreen({ onBack }) {
  const { logout } = useAuth();
  const { preference: localePreference, setLocalePreference } = useLocale();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');

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
      const g = data.gender ? String(data.gender).trim() : '';
      setGender(g === 'male' ? 'Male' : g === 'female' ? 'Female' : g);
      setHeightCm(data.height_cm != null ? String(data.height_cm) : '');
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
      Alert.alert(t('common.error'), err.message || t('profile.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const ageNum = age.trim() === '' ? null : parseInt(age, 10);
    if (age.trim() !== '' && (isNaN(ageNum) || ageNum < 0 || ageNum > 150)) {
      Alert.alert(t('common.invalidInput'), t('profile.validAge'));
      return;
    }
    const heightNum = heightCm.trim() === '' ? null : parseFloat(heightCm);
    if (heightCm.trim() !== '' && (isNaN(heightNum) || heightNum <= 0 || heightNum > 250)) {
      Alert.alert(t('common.invalidInput'), t('profile.validHeight'));
      return;
    }

    try {
      setIsSaving(true);
      await api.updateProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        age: ageNum,
        gender: gender.trim() || null,
        height_cm: heightNum,
      });
      setProfile((prev) => ({
        ...prev,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        age: ageNum,
        gender: gender.trim() || null,
        height_cm: heightNum,
      }));
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
    } catch (err) {
      console.error('Error saving profile:', err);
      const message = (err && typeof err.message === 'string')
        ? err.message
        : (err && err.detail != null ? JSON.stringify(err.detail) : t('profile.failedToUpdate'));
      Alert.alert(t('common.error'), message);
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
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
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
            <Text style={styles.loadingText}>{t('profile.loadingProfile')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.username')}</Text>
              <Text style={styles.readOnlyValue}>{profile?.username ?? '—'}</Text>
              <Text style={styles.hint}>{t('profile.usernameHint')}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.firstName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('profile.enterFirstName')}
                placeholderTextColor={dark.mutedText}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.lastName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('profile.enterLastName')}
                placeholderTextColor={dark.mutedText}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.age')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('profile.enterAge')}
                placeholderTextColor={dark.mutedText}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.gender')}</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female'].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.genderChip,
                      gender === value && styles.genderChipSelected,
                    ]}
                    onPress={() => setGender(gender === value ? '' : value)}
                    disabled={isSaving}
                  >
                    <Text
                      style={[
                        styles.genderChipText,
                        gender === value && styles.genderChipTextSelected,
                      ]}
                    >
                      {value === 'Male' ? t('profile.male') : t('profile.female')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.heightCm')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('profile.heightPlaceholder')}
                placeholderTextColor={dark.mutedText}
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="decimal-pad"
                editable={!isSaving}
              />
              <Text style={styles.hint}>{t('profile.heightHint')}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.language')}</Text>
              <View style={styles.genderRow}>
                {[
                  { value: 'device', labelKey: 'profile.languageDevice' },
                  { value: 'en', labelKey: 'profile.languageEnglish' },
                  { value: 'es', labelKey: 'profile.languageSpanish' },
                ].map(({ value, labelKey }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.genderChip,
                      localePreference === value && styles.genderChipSelected,
                    ]}
                    onPress={() => setLocalePreference(value)}
                  >
                    <Text
                      style={[
                        styles.genderChipText,
                        localePreference === value && styles.genderChipTextSelected,
                      ]}
                    >
                      {t(labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                  <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
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
    paddingTop: 50,
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
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  genderChip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B2438',
    backgroundColor: '#111A2F',
  },
  genderChipSelected: {
    borderColor: '#00FFD1',
    backgroundColor: 'rgba(0, 255, 209, 0.12)',
  },
  genderChipText: {
    fontSize: 16,
    color: '#7D8AA3',
    fontWeight: '500',
  },
  genderChipTextSelected: {
    color: '#00FFD1',
    fontWeight: '600',
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
