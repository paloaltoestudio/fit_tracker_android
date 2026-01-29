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
import WeightEntryForm from '../components/WeightEntryForm';
import WeightList from '../components/WeightList';
import WeightChart from '../components/WeightChart';
import api from '../services/api';

export default function WeightJournalScreen({ onBack }) {
  const [weightRecords, setWeightRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch weights from API when component mounts
  useEffect(() => {
    loadWeights();
  }, []);

  const loadWeights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getWeights();
      
      // API returns an array directly: [{id, user_id, weight, date, created_at}, ...]
      const weights = Array.isArray(data) ? data : [];
      
      // Sort by date ASC (oldest first) for proper graph display (oldest on left, newest on right)
      const sortedWeights = weights.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // Oldest first (ASC) - required for graph
      });
      
      setWeightRecords(sortedWeights);
    } catch (err) {
      console.error('Error loading weights:', err);
      setError(err.message || 'Failed to load weight records');
      Alert.alert('Error', err.message || 'Failed to load weight records');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new weight record
  const addWeightRecord = async (weight, date) => {
    try {
      const newRecord = await api.createWeight(weight, date);
      
      // Reload weights to get the complete list with IDs from server
      await loadWeights();
      
      Alert.alert('Success', 'Weight record added successfully!');
    } catch (err) {
      console.error('Error adding weight:', err);
      Alert.alert('Error', err.message || 'Failed to add weight record');
      throw err;
    }
  };

  // Edit an existing weight record
  const editWeightRecord = async (id, weight, date) => {
    try {
      await api.updateWeight(id, weight, date);
      
      // Reload weights to get updated data
      await loadWeights();
      
      Alert.alert('Success', 'Weight record updated successfully!');
    } catch (err) {
      console.error('Error updating weight:', err);
      Alert.alert('Error', err.message || 'Failed to update weight record');
      throw err;
    }
  };

  // Delete a weight record
  const deleteWeightRecord = async (id) => {
    try {
      await api.deleteWeight(id);
      
      // Remove from local state immediately for better UX
      setWeightRecords(prev => prev.filter(record => record.id !== id));
      
      Alert.alert('Success', 'Weight record deleted successfully!');
    } catch (err) {
      console.error('Error deleting weight:', err);
      Alert.alert('Error', err.message || 'Failed to delete weight record');
      // Reload on error to sync with server
      await loadWeights();
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
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color={dark.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Weight Journal</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={dark.primary} />
            <Text style={styles.loadingText}>Loading weight records...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadWeights}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WeightChart weightRecords={weightRecords} variant="dark" />
            <WeightEntryForm onAdd={addWeightRecord} variant="dark" />
            <WeightList
              weightRecords={weightRecords}
              onEdit={editWeightRecord}
              onDelete={deleteWeightRecord}
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
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
});
