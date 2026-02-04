import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { t } from '../i18n';
import MuscleIndexChart from '../components/MuscleIndexChart';
import MuscleIndexEntryForm from '../components/MuscleIndexEntryForm';
import MuscleIndexList from '../components/MuscleIndexList';

// Boer formula: LBM (lean body mass) in kg. Muscle Index = LBM / (height_m)^2
// Male:   LBM = 0.407 * weight_kg + 0.267 * height_cm - 19.2
// Female: LBM = 0.252 * weight_kg + 0.473 * height_cm - 48.3
// Other/unspecified: use male formula as default
function calculateMuscleIndex(weightKg, heightCm, gender) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const g = (gender || '').toLowerCase();
  const lbm =
    g === 'female'
      ? 0.252 * weightKg + 0.473 * heightCm - 48.3
      : 0.407 * weightKg + 0.267 * heightCm - 19.2;
  const heightM = heightCm / 100;
  const index = lbm / (heightM * heightM);
  return Math.round(index * 10) / 10;
}

export default function MuscleIndexScreen() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMetrics('muscle_index');
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
      setRecords(sorted);
    } catch (err) {
      console.error('Error loading muscle index:', err);
      setError(err.message || t('muscleIndex.failedToLoad'));
      Alert.alert(t('common.error'), err.message || t('muscleIndex.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const addRecord = async (indexValue, date) => {
    try {
      await api.createMetric('muscle_index', date, { index: indexValue });
      await loadMetrics();
      Alert.alert(t('common.success'), t('muscleIndex.addSuccess'));
    } catch (err) {
      console.error('Error adding muscle index:', err);
      Alert.alert(t('common.error'), err.message || t('muscleIndex.addError'));
      throw err;
    }
  };

  const editRecord = async (id, indexValue, date) => {
    try {
      await api.updateMetric(id, { index: indexValue }, date);
      await loadMetrics();
      Alert.alert(t('common.success'), t('muscleIndex.updateSuccess'));
    } catch (err) {
      console.error('Error updating muscle index:', err);
      Alert.alert(t('common.error'), err.message || t('muscleIndex.updateError'));
      throw err;
    }
  };

  const deleteRecord = async (id) => {
    try {
      await api.deleteMetric(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      Alert.alert(t('common.success'), t('muscleIndex.deleteSuccess'));
    } catch (err) {
      console.error('Error deleting muscle index:', err);
      Alert.alert(t('common.error'), err.message || t('muscleIndex.deleteError'));
      await loadMetrics();
    }
  };

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      const [profile, weightsData] = await Promise.all([api.getProfile(), api.getWeights()]);
      const heightCm = profile && (profile.height_cm != null) ? Number(profile.height_cm) : null;
      const gender = profile && profile.gender ? String(profile.gender).trim() : null;
      const weights = Array.isArray(weightsData) ? weightsData : [];
      const sortedWeights = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestWeight = sortedWeights.length ? sortedWeights[0] : null;
      const weightKg = latestWeight && typeof latestWeight.weight === 'number' ? latestWeight.weight : null;

      if (!heightCm || heightCm <= 0) {
        Alert.alert(t('common.error'), t('muscleIndex.missingHeight'));
        return;
      }
      if (!weightKg || weightKg <= 0) {
        Alert.alert(t('common.error'), t('muscleIndex.missingWeight'));
        return;
      }

      const index = calculateMuscleIndex(weightKg, heightCm, gender);
      if (index == null || index <= 0) {
        Alert.alert(t('common.error'), t('muscleIndex.calcFailed'));
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      await api.createMetric('muscle_index', today, { index });
      await loadMetrics();
      Alert.alert(t('common.success'), t('muscleIndex.calcDone', { value: index }));
    } catch (err) {
      console.error('Error calculating muscle index:', err);
      Alert.alert(t('common.error'), err.message || t('muscleIndex.calcError'));
    } finally {
      setIsCalculating(false);
    }
  };

  const dark = {
    background: '#070B14',
    card: '#0B1120',
    border: '#1B2438',
    text: '#EAF2FF',
    mutedText: '#7D8AA3',
    primary: '#00FFD1',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={dark.background} />
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>{t('muscleIndex.title')}</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={dark.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadMetrics}>
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <MuscleIndexChart records={records} variant="dark" />

            <TouchableOpacity
              style={[styles.calcButton, isCalculating && styles.calcButtonDisabled]}
              onPress={handleCalculate}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <ActivityIndicator color={dark.background} size="small" />
              ) : (
                <>
                  <Ionicons name="calculator-outline" size={22} color={dark.background} />
                  <Text style={styles.calcButtonText}>{t('muscleIndex.calculate')}</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.calcHint}>
              {t('muscleIndex.calcHint')}
            </Text>

            <MuscleIndexEntryForm onAdd={addRecord} variant="dark" />
            <MuscleIndexList
              records={records}
              onEdit={editRecord}
              onDelete={deleteRecord}
              variant="dark"
            />
          </>
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
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#7D8AA3' },
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
  retryButtonText: { color: '#070B14', fontSize: 16, fontWeight: 'bold' },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFD1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  calcButtonDisabled: { opacity: 0.7 },
  calcButtonText: { color: '#070B14', fontSize: 16, fontWeight: 'bold' },
  calcHint: {
    fontSize: 12,
    color: '#7D8AA3',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
});
