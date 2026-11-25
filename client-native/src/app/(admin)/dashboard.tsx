import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, IndianRupee, Activity } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';

export default function AdminDashboardScreen() {
  const [user, setUser] = useState<any>({});
  const [stats, setStats] = useState<any>({});
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
      const [usersRes, groupsRes, requestsRes, ledgerRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/groups'),
        api.get('/admin/fee-requests'),
        api.get('/admin/finance/ledger')
      ]);

      const users = usersRes.data || [];
      const groups = groupsRes.data || [];
      const requests = requestsRes.data || [];
      const ledger = ledgerRes.data || {};

      const pendingAmount = requests
        .filter((r: any) => r.status === 'pending')
        .reduce((sum: number, r: any) => sum + r.amount, 0);

      const pendingCount = requests.filter((r: any) => r.status === 'pending').length;

      setStats({
        totalStudents: users.length,
        totalGroups: groups.length,
        totalCollected: ledger.totalOnlineCollected || 0,
        pendingFeeAmount: pendingAmount,
        pendingRequests: pendingCount
      });
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
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
        <Text style={styles.greeting}>Welcome, {user.name || 'Admin'}!</Text>
        <Text style={styles.subtitle}>College Management Overview</Text>
      </NeoCard>

      <View style={styles.grid}>
        <NeoCard style={styles.gridItem}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Users color="#f87410" size={20} />
            </View>
            <Text style={styles.cardTitle}>Total Students</Text>
          </View>
          <Text style={styles.cardValue}>{stats.totalStudents || 0}</Text>
        </NeoCard>

        <NeoCard style={styles.gridItem}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <IndianRupee color="#f87410" size={20} />
            </View>
            <Text style={styles.cardTitle}>Collected Fees</Text>
          </View>
          <Text style={styles.cardValue}>₹{(stats.totalCollected || 0).toFixed(2)}</Text>
        </NeoCard>

        <NeoCard style={styles.gridItem}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Activity color="#f87410" size={20} />
            </View>
            <Text style={styles.cardTitle}>Pending Requests</Text>
          </View>
          <Text style={styles.cardValue}>{stats.pendingRequests || 0}</Text>
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
  gridItem: { width: '48%', marginBottom: 16 },
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
