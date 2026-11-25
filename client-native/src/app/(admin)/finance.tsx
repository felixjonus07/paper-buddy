import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { IndianRupee, CheckCircle, Clock } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';

export default function AdminFinanceScreen() {
  const [ledger, setLedger] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await api.get('/admin/finance/ledger');
      setLedger(res.data);
    } catch (error) {
      console.error('Failed to fetch ledger', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLedger();
    setRefreshing(false);
  };

  const confirmSettlement = async (id: string) => {
    Alert.alert('Confirm', 'Mark this settlement as received?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Confirm', 
        onPress: async () => {
          try {
            setConfirmingId(id);
            await api.put(`/admin/finance/settlements/${id}/confirm`);
            fetchLedger();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to confirm settlement');
          } finally {
            setConfirmingId(null);
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
      <Text style={styles.title}>Finance & Ledger</Text>

      {ledger && (
        <>
          <NeoCard style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <IndianRupee size={24} color="#f87410" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Total Online Collected</Text>
              <Text style={styles.statValue}>₹{ledger.totalOnlineCollected?.toLocaleString() || 0}</Text>
            </View>
          </NeoCard>

          <NeoCard style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <CheckCircle size={24} color="#22c55e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Total Settled (Received)</Text>
              <Text style={styles.statValue}>₹{ledger.totalSettled?.toLocaleString() || 0}</Text>
            </View>
          </NeoCard>

          <NeoCard style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Clock size={24} color="#f59e0b" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Balance Outstanding</Text>
              <Text style={styles.statValue}>₹{ledger.balanceOwed?.toLocaleString() || 0}</Text>
            </View>
          </NeoCard>

          <NeoCard style={{ marginTop: 10, marginBottom: 40, padding: 0, overflow: 'hidden' }}>
            <Text style={styles.sectionTitle}>Settlement History</Text>
            
            {ledger.settlements && ledger.settlements.length > 0 ? (
              ledger.settlements.map((s: any, idx: number) => (
                <View key={s._id} style={[styles.settlementRow, idx === ledger.settlements.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settleAmount}>₹{s.amount?.toLocaleString()}</Text>
                    <Text style={styles.settleDate}>{new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString()}</Text>
                    <View style={styles.statusBadge(s.status)}>
                      <Text style={styles.statusText(s.status)}>{s.status}</Text>
                    </View>
                  </View>
                  {s.status === 'PENDING' && (
                    <NeoButton 
                      onPress={() => confirmSettlement(s._id)} 
                      loading={confirmingId === s._id}
                      style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                    >
                      Confirm
                    </NeoButton>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No settlements found.</Text>
            )}
          </NeoCard>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410', marginBottom: 20, marginTop: 10 },
  statCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 16 },
  statIconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(248, 116, 16, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  statInfo: { flex: 1 },
  statLabel: { color: '#a3a3a3', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  settlementRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  settleAmount: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  settleDate: { fontSize: 12, color: '#a3a3a3', marginTop: 4, marginBottom: 8 },
  statusBadge: (status: string) => ({
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
    backgroundColor: status === 'CONFIRMED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1, borderColor: status === 'CONFIRMED' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'
  }),
  statusText: (status: string) => ({
    fontSize: 10, fontWeight: 'bold',
    color: status === 'CONFIRMED' ? '#22c55e' : '#f59e0b'
  }),
  emptyText: { color: '#666', textAlign: 'center', padding: 20 }
});
