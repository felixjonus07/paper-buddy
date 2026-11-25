import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IndianRupee, FileText } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';

export default function DashboardOverviewScreen() {
  const [user, setUser] = useState<any>({});
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
    fetchData();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  const fetchData = async () => {
    try {
      // In a real scenario we'd fetch multiple endpoints, similar to the web version.
      // For this overview, we fetch student fees and loans.
      const [feesRes, loansRes] = await Promise.all([
        api.get('/user/student-fees'),
        api.get('/user/fee-requests') // Map to loans/requests as per backend
      ]);
      setStudentFees(feesRes.data || []);
      setLoans(loansRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const pendingFees = studentFees.filter(f => f.status === 'PENDING');
  const totalFees = pendingFees.reduce((sum, f) => sum + f.finalAmount, 0);
  const pendingLoans = loans.filter(l => l.status === 'pending');

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
    >
      <NeoCard style={styles.headerCard}>
        <Text style={styles.greeting}>Hello, {user.name || user.username || 'User'}!</Text>
        <Text style={styles.subtitle}>Welcome to your personal Paper Buddy mobile dashboard.</Text>
      </NeoCard>

      <View style={styles.grid}>
        <NeoCard style={styles.gridItem}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <IndianRupee color="#f87410" size={20} />
            </View>
            <Text style={styles.cardTitle}>Outstanding Fees</Text>
          </View>
          <Text style={styles.cardValue}>₹{totalFees.toFixed(2)}</Text>
        </NeoCard>

        <NeoCard style={styles.gridItem}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <FileText color="#f87410" size={20} />
            </View>
            <Text style={styles.cardTitle}>Pending Loans</Text>
          </View>
          <Text style={styles.cardValue}>{pendingLoans.length}</Text>
        </NeoCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  headerCard: {
    marginBottom: 20,
    marginTop: 20,
  },
  greeting: {
    color: '#f87410',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#a3a3a3',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(248, 116, 16, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 116, 16, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#a3a3a3',
    fontSize: 12,
    fontWeight: '600',
  },
  cardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
});
