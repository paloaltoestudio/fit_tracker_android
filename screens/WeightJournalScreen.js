import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WeightEntryForm from '../components/WeightEntryForm';
import WeightList from '../components/WeightList';
import WeightChart from '../components/WeightChart';

export default function WeightJournalScreen({ onBack }) {
  const [weightRecords, setWeightRecords] = useState([]);

  // Add a new weight record
  const addWeightRecord = (weight, date) => {
    const newRecord = {
      id: Date.now().toString(),
      weight: parseFloat(weight),
      date: date || new Date().toISOString(),
    };
    setWeightRecords(prev => [...prev, newRecord].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    ));
  };

  // Edit an existing weight record
  const editWeightRecord = (id, weight, date) => {
    setWeightRecords(prev =>
      prev.map(record =>
        record.id === id
          ? { ...record, weight: parseFloat(weight), date }
          : record
      ).sort((a, b) => new Date(a.date) - new Date(b.date))
    );
  };

  // Delete a weight record
  const deleteWeightRecord = (id) => {
    setWeightRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Weight Journal</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <WeightChart weightRecords={weightRecords} />
        <WeightEntryForm onAdd={addWeightRecord} />
        <WeightList
          weightRecords={weightRecords}
          onEdit={editWeightRecord}
          onDelete={deleteWeightRecord}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});
