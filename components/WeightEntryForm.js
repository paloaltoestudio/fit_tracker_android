import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
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

export default function WeightEntryForm({ onAdd, variant }) {
  const isDark = variant === 'dark';
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    const weightValue = parseFloat(weight);
    
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      Alert.alert(t('common.invalidInput'), t('weight.validWeight'));
      return;
    }

    const selectedDate = date || new Date();
    try {
      await onAdd(weightValue, selectedDate.toISOString());
      setWeight('');
      setDate(new Date());
      setShowModal(false);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.addButton, isDark && styles.addButtonDark]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add-circle" size={24} color={isDark ? darkTheme.background : '#fff'} />
        <Text style={[styles.addButtonText, isDark && styles.addButtonTextDark]}>{t('weight.addRecord')}</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>{t('weight.addRecord')}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? darkTheme.text : '#333'} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={[styles.label, isDark && styles.labelDark]}>{t('weight.weightKg')}</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder={t('weight.enterWeight')}
                placeholderTextColor={isDark ? darkTheme.mutedText : undefined}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
                autoFocus={true}
              />

              <Text style={[styles.label, isDark && styles.labelDark]}>{t('common.date')}</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  type="date"
                  value={date.toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      setDate(new Date(e.target.value));
                    }
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.dateButton, isDark && styles.dateButtonDark]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={isDark ? darkTheme.mutedText : '#666'} style={styles.dateIcon} />
                    <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                      {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setDate(selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, isDark && styles.cancelButtonDark]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton, isDark && styles.submitButtonDark]}
                  onPress={handleSubmit}
                >
                  <Text style={[styles.submitButtonText, isDark && styles.submitButtonTextDark]}>{t('common.add')}</Text>
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
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Dark variant
  addButtonDark: {
    backgroundColor: darkTheme.primary,
  },
  addButtonTextDark: {
    color: darkTheme.card,
  },
  modalContentDark: {
    backgroundColor: darkTheme.card,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  modalTitleDark: {
    color: darkTheme.text,
  },
  labelDark: {
    color: darkTheme.mutedText,
  },
  inputDark: {
    backgroundColor: darkTheme.inputBg,
    borderColor: darkTheme.border,
    color: darkTheme.text,
  },
  dateButtonDark: {
    backgroundColor: darkTheme.inputBg,
    borderColor: darkTheme.border,
  },
  dateTextDark: {
    color: darkTheme.text,
  },
  cancelButtonDark: {
    backgroundColor: darkTheme.inputBg,
    borderColor: darkTheme.border,
  },
  cancelButtonTextDark: {
    color: darkTheme.mutedText,
  },
  submitButtonDark: {
    backgroundColor: darkTheme.primary,
  },
  submitButtonTextDark: {
    color: darkTheme.card,
  },
});
