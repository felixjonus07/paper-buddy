import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoInput from '@/components/ui/NeoInput';
import NeoButton from '@/components/ui/NeoButton';

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        navigateToDashboard(user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToDashboard = (user: any) => {
    switch (user.role) {
      case 'superadmin':
        router.replace('/(superadmin)/dashboard');
        break;
      case 'admin':
        router.replace('/(admin)/dashboard');
        break;
      case 'cashier':
        router.replace('/(cashier)/dashboard');
        break;
      case 'mentor':
        router.replace('/(mentor)/dashboard');
        break;
      default:
        router.replace('/(user)/dashboard');
    }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const data = response.data;
      
      if (data.mustChangePassword) {
        Alert.alert('Password Reset Required', 'Please use the web app to reset your password first.');
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      
      navigateToDashboard(data);
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || 'Authentication failed. Ensure backend is running.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          <NeoCard>
            <Text style={styles.title}>Welcome Back</Text>
            
            <NeoInput
              label="Username"
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <NeoInput
              label="Password"
              placeholder="Enter password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            <NeoButton 
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 10 }}
            >
              Sign In
            </NeoButton>

            {/* Quick Demo Logins for Testing */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Quick Demo Logins</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity style={styles.demoBtn} onPress={() => setFormData({ username: 'superadmin', password: 'superadmin123' })}>
                  <Text style={styles.demoBtnText}>Super Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.demoBtn} onPress={() => setFormData({ username: 'admin', password: 'admin123' })}>
                  <Text style={styles.demoBtnText}>Admin</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.demoRow}>
                <TouchableOpacity style={styles.demoBtn} onPress={() => setFormData({ username: 'cashier', password: 'cashier123' })}>
                  <Text style={styles.demoBtnText}>Cashier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.demoBtn} onPress={() => setFormData({ username: 'student', password: 'student123' })}>
                  <Text style={styles.demoBtnText}>Student</Text>
                </TouchableOpacity>
              </View>
            </View>

          </NeoCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f87410',
    textAlign: 'center',
    marginBottom: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  demoContainer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  demoTitle: {
    color: '#a3a3a3',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  demoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f87410',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  demoBtnText: {
    color: '#f87410',
    fontSize: 12,
    fontWeight: '600',
  },
});
