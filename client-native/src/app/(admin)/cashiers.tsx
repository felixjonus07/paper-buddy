import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Calendar, ChevronRight } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoInput from '@/components/ui/NeoInput';
import NeoButton from '@/components/ui/NeoButton';

export default function AdminCashiersScreen() {
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchCashiers();
  }, []);

  useEffect(() => {
    if (selectedCashier) {
      fetchLogs();
    }
  }, [selectedCashier, selectedDate]);

  const fetchCashiers = async () => {
    try {
      const res = await api.get('/admin/cashiers');
      setCashiers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch cashiers', error);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get(`/admin/cashiers/${selectedCashier._id}/logs?date=${selectedDate}`);
      setLogs(res.data?.logs || []);
      setTotalCollected(res.data?.totalCollected || 0);
    } catch (error) {
      console.error('Failed to fetch cashier logs', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCashiers();
    if (selectedCashier) {
      await fetchLogs();
    }
    setRefreshing(false);
  };

  if (selectedCashier) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCashier(null)} style={{ marginRight: 12 }}>
            <Text style={{ color: '#f87410', fontSize: 16 }}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedCashier.name}</Text>
        </View>

        <NeoCard style={{ marginBottom: 16 }}>
          <NeoInput 
            label="Filter Date"
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
          />
          <View style={styles.totalBox}>
            <Text style={{ color: '#a3a3a3', fontSize: 14 }}>Total Collected on {selectedDate}</Text>
            <Text style={{ color: '#22c55e', fontSize: 24, fontWeight: 'bold' }}>₹{totalCollected.toLocaleString()}</Text>
          </View>
        </NeoCard>

        {loadingLogs ? (
          <ActivityIndicator color="#f87410" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView 
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
          >
            {logs.map(log => (
              <NeoCard key={log._id} style={styles.logCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{log.studentId?.name || 'Unknown Student'}</Text>
                  <Text style={{ color: '#22c55e', fontWeight: 'bold' }}>+ ₹{log.amount}</Text>
                </View>
                <Text style={{ color: '#a3a3a3', fontSize: 12 }}>
                  Fee: {log.feeId?.title}
                </Text>
                <Text style={{ color: '#666', fontSize: 10, marginTop: 4 }}>
                  {new Date(log.createdAt).toLocaleTimeString()}
                </Text>
              </NeoCard>
            ))}
            {logs.length === 0 && (
              <Text style={styles.emptyText}>No cash collections found on this date.</Text>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Cashiers</Text>
      </View>

      <Text style={{ color: '#a3a3a3', marginBottom: 16 }}>Select a cashier to view their daily collections:</Text>

      {cashiers.map(c => (
        <TouchableOpacity key={c._id} onPress={() => setSelectedCashier(c)}>
          <NeoCard style={styles.cashierCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconBox}>
                <User size={20} color="#f87410" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.cashierName}>{c.name}</Text>
                <Text style={styles.cashierUsername}>@{c.username}</Text>
              </View>
              <ChevronRight size={20} color="#666" />
            </View>
          </NeoCard>
        </TouchableOpacity>
      ))}

      {cashiers.length === 0 && (
        <Text style={styles.emptyText}>No cashiers found.</Text>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410' },
  list: { paddingBottom: 40 },
  cashierCard: { padding: 16, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(248, 116, 16, 0.1)', justifyContent: 'center', alignItems: 'center' },
  cashierName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cashierUsername: { fontSize: 12, color: '#a3a3a3' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
  
  totalBox: { marginTop: 12, padding: 12, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)', alignItems: 'center' },
  logCard: { marginBottom: 10, padding: 12 }
});
