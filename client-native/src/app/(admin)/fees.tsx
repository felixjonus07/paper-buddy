import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Modal, TouchableOpacity } from 'react-native';
import { FileText, Plus, Trash2, X } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';

export default function AdminFeesScreen() {
  const [fees, setFees] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newFee, setNewFee] = useState({ title: '', amount: '', dueDate: '', feeTypeId: '', assignedToGroup: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const res = await api.get('/admin/fees');
      setFees(res.data || []);
    } catch (error) {
      console.error('Failed to fetch fees', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFees();
    setRefreshing(false);
  };

  const handleDeleteFee = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this fee?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/fees/${id}`);
            fetchFees();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete fee.');
          }
        }
      }
    ]);
  };

  const handleCreateFee = async () => {
    if (!newFee.title || !newFee.amount) {
      Alert.alert('Error', 'Title and Amount are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/fees', { ...newFee, amount: Number(newFee.amount) });
      setAddModalOpen(false);
      setNewFee({ title: '', amount: '', dueDate: '', feeTypeId: '', assignedToGroup: '' });
      fetchFees();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create fee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fees Management</Text>
        <NeoButton onPress={() => setAddModalOpen(true)} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Assign</Text>
        </NeoButton>
      </View>

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
      >
        {fees.map(f => (
          <NeoCard key={f._id} style={styles.feeCard}>
            <View style={styles.feeHeader}>
              <Text style={styles.feeTitle}>{f.title}</Text>
              <Text style={styles.feeAmount}>₹{f.amount}</Text>
            </View>
            
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Type: {f.feeType?.name || 'N/A'}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Assigned: {f.assignedToGroup ? f.assignedToGroup.name : 'Individual'}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleDeleteFee(f._id)} style={styles.deleteBtn}>
              <Trash2 size={16} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.deleteBtnText}>Delete Fee</Text>
            </TouchableOpacity>
          </NeoCard>
        ))}
        {fees.length === 0 && (
          <Text style={styles.emptyText}>No fees found.</Text>
        )}
      </ScrollView>

      {/* Create Fee Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Fee</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <X size={24} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <NeoInput
                label="Fee Title"
                placeholder="e.g. Semester 1 Tuition"
                value={newFee.title}
                onChangeText={(t) => setNewFee({...newFee, title: t})}
              />
              <NeoInput
                label="Amount (₹)"
                placeholder="e.g. 50000"
                value={newFee.amount}
                onChangeText={(t) => setNewFee({...newFee, amount: t})}
                keyboardType="numeric"
              />
              <NeoInput
                label="Due Date"
                placeholder="YYYY-MM-DD"
                value={newFee.dueDate}
                onChangeText={(t) => setNewFee({...newFee, dueDate: t})}
              />
              <NeoButton onPress={handleCreateFee} loading={loading} style={{ marginTop: 20 }}>
                Assign Fee
              </NeoButton>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410' },
  addBtn: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 },
  list: { paddingBottom: 40 },
  feeCard: { marginBottom: 16, padding: 16 },
  feeHeader: { marginBottom: 12 },
  feeTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  feeAmount: { fontSize: 28, fontWeight: 'bold', color: '#f87410' },
  badgeContainer: { marginBottom: 16 },
  badge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  badgeText: { color: '#a3a3a3', fontSize: 14 },
  deleteBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, marginTop: 8 },
  deleteBtnText: { color: '#ef4444', fontWeight: 'bold' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#171717', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' }
});
