import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';

export default function MentorDashboardScreen() {
  const [user, setUser] = useState<any>({});
  const [mentees, setMentees] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
    fetchStats();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/mentor/students');
      setMentees(res.data || []);
    } catch (error) {
      console.error('Failed to fetch mentor mentees', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
    >
      <NeoCard style={styles.headerCard}>
        <Text style={styles.greeting}>Mentor Portal</Text>
        <Text style={styles.subtitle}>Welcome back, {user.name}</Text>
      </NeoCard>

      <View style={styles.grid}>
        <NeoCard style={styles.gridItemFull}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Users color="#f87410" size={20} />
            </View>
            <Text style={styles.cardTitle}>My Assigned Mentees</Text>
          </View>
          <Text style={styles.cardValue}>{mentees.length}</Text>
        </NeoCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  headerCard: { marginBottom: 20, marginTop: 20 },
  greeting: { color: '#f87410', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#a3a3a3', fontSize: 14 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  gridItemFull: { width: '100%', marginBottom: 16 },
  cardHeader: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 12 },
  iconContainer: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(248, 116, 16, 0.15)',
    borderWidth: 1, borderColor: 'rgba(248, 116, 16, 0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  cardTitle: { color: '#a3a3a3', fontSize: 12, fontWeight: '600' },
  cardValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
});
