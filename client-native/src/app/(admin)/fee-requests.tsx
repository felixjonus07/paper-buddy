import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';

export default function AdminFeeRequestsScreen() {
  const [feeRequests, setFeeRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeeRequests();
  }, []);

  const fetchFeeRequests = async () => {
    try {
      const res = await api.get('/admin/fee-requests');
      setFeeRequests(res.data || []);
    } catch (error) {
      console.error('Failed to fetch fee requests', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeeRequests();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    Alert.alert('Confirm', `Are you sure you want to ${status} this request?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Confirm',
        onPress: async () => {
          setLoadingId(id);
          try {
            await api.put(`/admin/fee-requests/${id}`, { status });
            fetchFeeRequests();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to update request');
          } finally {
            setLoadingId(null);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Student Fee Requests</Text>
      </View>

      {feeRequests.map(r => (
        <NeoCard key={r._id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.reqTitle}>{r.requestedFeeTitle}</Text>
            <View style={styles.badge(r.status)}>
              <Text style={styles.badgeText(r.status)}>{r.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.studentInfo}>
            Requested by: {r.studentId?.name} (@{r.studentId?.username})
          </Text>
          <Text style={styles.studentDetails}>
            {r.studentId?.studentClass || 'N/A'} - {r.studentId?.section || 'N/A'} | Reg: {r.studentId?.registerNumber || 'N/A'}
          </Text>

          {r.reason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Reason:</Text>
              <Text style={styles.reasonText}>{r.reason}</Text>
            </View>
          )}

          <View style={styles.detailsBox}>
            <Text style={styles.detailText}>Suggested Amount: <Text style={{ color: '#fff', fontWeight: 'bold' }}>₹{r.amount}</Text></Text>
            <Text style={styles.detailText}>Type: {r.feeType?.name || 'Unknown'}</Text>
          </View>

          {r.status === 'pending' && (
            <View style={styles.actions}>
              <NeoButton 
                style={[styles.actionBtn, { backgroundColor: '#22c55e', shadowColor: '#22c55e' }]} 
                onPress={() => handleUpdateStatus(r._id, 'approved')}
                loading={loadingId === r._id}
              >
                Approve
              </NeoButton>
              <NeoButton 
                style={[styles.actionBtn, { backgroundColor: '#ef4444', shadowColor: '#ef4444' }]} 
                onPress={() => handleUpdateStatus(r._id, 'rejected')}
                loading={loadingId === r._id}
              >
                Reject
              </NeoButton>
            </View>
          )}
        </NeoCard>
      ))}

      {feeRequests.length === 0 && (
        <Text style={styles.emptyText}>No fee requests found.</Text>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410' },
  card: { marginBottom: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reqTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 8 },
  badge: (status: string) => ({
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    backgroundColor: status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1, borderColor: status === 'pending' ? 'rgba(245, 158, 11, 0.3)' : status === 'approved' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
  }),
  badgeText: (status: string) => ({
    fontSize: 10, fontWeight: 'bold',
    color: status === 'pending' ? '#f59e0b' : status === 'approved' ? '#22c55e' : '#ef4444'
  }),
  studentInfo: { color: '#fff', fontWeight: '500', marginBottom: 4 },
  studentDetails: { color: '#a3a3a3', fontSize: 12, marginBottom: 12 },
  reasonBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12 },
  reasonLabel: { color: '#a3a3a3', fontSize: 12, marginBottom: 4 },
  reasonText: { color: '#fff', fontSize: 14 },
  detailsBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
  detailText: { color: '#a3a3a3', fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  actionBtn: { flex: 1, marginHorizontal: 4, paddingVertical: 10 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 }
});
