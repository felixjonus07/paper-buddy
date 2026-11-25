import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { IndianRupee, TrendingUp } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoInput from '@/components/ui/NeoInput';
import NeoButton from '@/components/ui/NeoButton';

export default function AdminReportsScreen() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
  
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports/payments?startDate=${startDate}&endDate=${endDate}`);
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Payment Reports</Text>
      </View>

      <NeoCard style={{ marginBottom: 16 }}>
        <Text style={{ color: '#a3a3a3', marginBottom: 12 }}>Filter Date Range</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <NeoInput label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={{ flex: 1 }}>
            <NeoInput label="End Date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
          </View>
        </View>
        <NeoButton onPress={fetchReports} style={{ marginTop: 10 }}>
          Generate Report
        </NeoButton>
      </NeoCard>

      {loading ? (
        <ActivityIndicator color="#f87410" style={{ marginTop: 40 }} />
      ) : reports ? (
        <View>
          <NeoCard style={[styles.statCard, { backgroundColor: 'rgba(34, 197, 94, 0.05)' }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <IndianRupee size={24} color="#22c55e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Total Collected</Text>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>₹{reports.totalAmount?.toLocaleString() || 0}</Text>
            </View>
          </NeoCard>

          <NeoCard style={[styles.statCard, { backgroundColor: 'rgba(59, 130, 246, 0.05)' }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <TrendingUp size={24} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Total Transactions</Text>
              <Text style={[styles.statValue, { color: '#3b82f6' }]}>{reports.count || 0}</Text>
            </View>
          </NeoCard>

          <Text style={styles.sectionTitle}>Recent Payments</Text>
          {reports.payments && reports.payments.length > 0 ? (
            reports.payments.slice(0, 20).map((p: any) => (
              <NeoCard key={p._id} style={styles.paymentCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{p.studentId?.name || 'Unknown'}</Text>
                  <Text style={{ color: '#22c55e', fontWeight: 'bold' }}>₹{p.amount}</Text>
                </View>
                <Text style={{ color: '#a3a3a3', fontSize: 12 }}>{p.feeId?.title}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: '#666', fontSize: 10 }}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                  <Text style={{ color: '#f87410', fontSize: 10, textTransform: 'uppercase' }}>{p.paymentMethod}</Text>
                </View>
              </NeoCard>
            ))
          ) : (
            <Text style={styles.emptyText}>No payments in this range.</Text>
          )}
        </View>
      ) : null}
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410' },
  statCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  statLabel: { color: '#a3a3a3', fontSize: 14, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16, marginTop: 8 },
  paymentCard: { marginBottom: 12, padding: 12 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 }
});
