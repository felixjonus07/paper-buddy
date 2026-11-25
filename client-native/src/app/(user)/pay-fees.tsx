import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PayFeesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pay Fees screen coming soon...</Text>
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
