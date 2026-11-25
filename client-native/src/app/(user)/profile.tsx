import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import NeoButton from '@/components/ui/NeoButton';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile screen coming soon...</Text>
      
      <NeoButton onPress={handleLogout} style={{ marginTop: 30, backgroundColor: '#ef4444', shadowColor: '#ef4444' }}>
        Log Out
      </NeoButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: '#a3a3a3',
    textAlign: 'center',
  },
});
