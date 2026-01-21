import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function WeightList({ weightRecords, onEdit, onDelete }) {
  const [editingRecord, setEditingRecord] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditWeight(record.weight.toString());
    setEditDate(new Date(record.date));
  };

  const handleSaveEdit = async () => {
    const weightValue = parseFloat(editWeight);
    
    if (!editWeight || isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight.');
      return;
    }

    try {
      await onEdit(editingRecord.id, weightValue, editDate.toISOString());
      setEditingRecord(null);
      setEditWeight('');
      setEditDate(new Date());
      setShowDatePicker(false);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDelete(id);
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordInfo}>
        <Text style={styles.weightText}>{item.weight} kg</Text>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Records</Text>
      
      {weightRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="scale-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No weight records yet</Text>
          <Text style={styles.emptySubtext}>Add your first record to get started</Text>
        </View>
      ) : (
        <FlatList
          data={weightRecords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}

      <Modal
        visible={editingRecord !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Weight Record</Text>
              <TouchableOpacity onPress={() => setEditingRecord(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter weight"
                keyboardType="decimal-pad"
                value={editWeight}
                onChangeText={setEditWeight}
                autoFocus={true}
              />

              <Text style={styles.label}>Date</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.input}
                  type="date"
                  value={editDate.toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      setEditDate(new Date(e.target.value));
                    }
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#666" style={styles.dateIcon} />
                    <Text style={styles.dateText}>
                      {editDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={editDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setEditDate(selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditingRecord(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.submitButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  recordInfo: {
    flex: 1,
  },
  weightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
