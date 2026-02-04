import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
    // If successful, the auth context will handle navigation
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="fitness-outline" size={80} color={dark.primary} />
          <Text style={styles.title}>Fit Tracker</Text>
          <Text style={styles.subtitle}>Track your weight journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={dark.mutedText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={dark.mutedText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={dark.mutedText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={dark.mutedText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={dark.mutedText}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={dark.background} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Login</Text>
                <Ionicons name="arrow-forward" size={20} color={dark.background} style={styles.loginIcon} />
              </>
            )}
          </TouchableOpacity>

          {/* <View style={styles.testCredentialsContainer}>
            <Text style={styles.testCredentialsText}>
              Test credentials:{'\n'}
              Username: testuser{'\n'}
              Password: testpass123
            </Text>
          </View> */}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EAF2FF',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7D8AA3',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111A2F',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1B2438',
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#EAF2FF',
  },
  loginButton: {
    backgroundColor: '#00FFD1',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#070B14',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginIcon: {
    marginLeft: 8,
  },
  testCredentialsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(0, 255, 209, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00FFD1',
  },
  testCredentialsText: {
    fontSize: 12,
    color: '#7D8AA3',
    lineHeight: 18,
  },
});
