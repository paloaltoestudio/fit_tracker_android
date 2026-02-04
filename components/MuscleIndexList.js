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
import { t } from '../i18n';

const darkTheme = {
  card: '#0B1120',
  border: '#1B2438',
  text: '#EAF2FF',
  mutedText: '#7D8AA3',
  primary: '#00FFD1',
  inputBg: '#111A2F',
};

export default function MuscleIndexList({ records, onEdit, onDelete, variant }) {
  const isDark = variant === 'dark';
  const [editing, setEditing] = useState(null);
  const [editIndex, setEditIndex] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleEdit = (record) => {
    setEditing(record);
    const idx = record.value && typeof record.value.index === 'number' ? record.value.index : 0;
    setEditIndex(String(idx));
    setEditDate(new Date(record.date));
  };

  const handleSaveEdit = async () => {
    const indexValue = parseFloat(editIndex);
    if (!editIndex || isNaN(indexValue) || indexValue <= 0) {
      Alert.alert(t('common.invalidInput'), t('muscleIndex.validIndex'));
      return;
    }
    try {
      await onEdit(editing.id, indexValue, editDate.toISOString());
      setEditing(null);
      setEditIndex('');
      setEditDate(new Date());
      setShowDatePicker(false);
    } catch (e) {}
  };

  const handleDelete = (id) => {
    Alert.alert(
      t('muscleIndex.deleteRecord'),
      t('muscleIndex.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(id) },
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getIndex = (item) => (item.value && typeof item.value.index === 'number' ? item.value.index : '—');

  const renderItem = ({ item }) => (
    <View style={[styles.recordItem, isDark && styles.recordItemDark]}>
      <View style={styles.recordInfo}>
        <Text style={[styles.indexText, isDark && styles.indexTextDark]}>{getIndex(item)}</Text>
        <Text style={[styles.dateText, isDark && styles.recordDateTextDark]}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Ionicons name="create-outline" size={20} color={isDark ? darkTheme.primary : '#2196F3'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && styles.titleDark]}>{t('muscleIndex.history')}</Text>
      {!records || records.length === 0 ? (
        <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
          <Ionicons name="body-outline" size={64} color={isDark ? darkTheme.mutedText : '#ccc'} />
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>{t('muscleIndex.noRecords')}</Text>
          <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>{t('muscleIndex.addOrCalculate')}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
        />
      )}

      <Modal
        visible={editing !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>{t('muscleIndex.editRecord')}</Text>
              <TouchableOpacity onPress={() => setEditing(null)}>
                <Ionicons name="close" size={24} color={isDark ? darkTheme.text : '#333'} />
              </TouchableOpacity>
            </View>
            <View style={styles.form}>
              <Text style={[styles.label, isDark && styles.labelDark]}>{t('muscleIndex.index')}</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder={t('muscleIndex.indexPlaceholder')}
                placeholderTextColor={isDark ? darkTheme.mutedText : undefined}
                keyboardType="decimal-pad"
                value={editIndex}
                onChangeText={setEditIndex}
                autoFocus
              />
              <Text style={[styles.label, isDark && styles.labelDark]}>{t('common.date')}</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  type="date"
                  value={editDate.toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => e.target.value && setEditDate(new Date(e.target.value))}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.dateButton, isDark && styles.dateButtonDark]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={isDark ? darkTheme.mutedText : '#666'} style={styles.dateIcon} />
                    <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                      {editDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={editDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) setEditDate(selectedDate);
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, isDark && styles.cancelButtonDark]}
                  onPress={() => setEditing(null)}
                >
                  <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton, isDark && styles.submitButtonDark]}
                  onPress={handleSaveEdit}
                >
                  <Text style={[styles.submitButtonText, isDark && styles.submitButtonTextDark]}>{t('common.save')}</Text>
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
  container: { marginTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  titleDark: { color: darkTheme.text },
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
  emptyStateDark: {
    backgroundColor: darkTheme.card,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 16 },
  emptyTextDark: { color: darkTheme.mutedText },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 8 },
  emptySubtextDark: { color: darkTheme.mutedText },
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
  recordItemDark: {
    backgroundColor: darkTheme.card,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  recordInfo: { flex: 1 },
  indexText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  indexTextDark: { color: darkTheme.text },
  dateText: { fontSize: 16, color: '#333', flex: 1 },
  recordDateTextDark: { color: darkTheme.mutedText },
  actions: { flexDirection: 'row', gap: 12 },
  editButton: { padding: 8 },
  deleteButton: { padding: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  modalContentDark: {
    backgroundColor: darkTheme.card,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalTitleDark: { color: darkTheme.text },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 12 },
  labelDark: { color: darkTheme.mutedText },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputDark: {
    backgroundColor: darkTheme.inputBg,
    borderColor: darkTheme.border,
    color: darkTheme.text,
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
  dateButtonDark: {
    backgroundColor: darkTheme.inputBg,
    borderColor: darkTheme.border,
  },
  dateIcon: { marginRight: 8 },
  dateTextDark: { color: darkTheme.text },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  button: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' },
  cancelButtonDark: { backgroundColor: darkTheme.inputBg, borderColor: darkTheme.border },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600' },
  cancelButtonTextDark: { color: darkTheme.mutedText },
  submitButton: { backgroundColor: '#2196F3' },
  submitButtonDark: { backgroundColor: darkTheme.primary },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  submitButtonTextDark: { color: darkTheme.card },
});
