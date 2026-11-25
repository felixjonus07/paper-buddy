import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FeeRequestsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fee Requests screen coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#a3a3a3',
  },
});
