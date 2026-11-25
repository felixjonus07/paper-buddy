import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SuperAdminAdminsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admins Management coming soon...</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#a3a3a3' },
});
