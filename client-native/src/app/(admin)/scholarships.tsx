import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Modal, TouchableOpacity } from 'react-native';
import { GraduationCap, Trash2, X } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';

export default function AdminScholarshipsScreen() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newScholarship, setNewScholarship] = useState({ name: '', description: '', discountPercentage: '', minAcademicScore: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/admin/scholarships');
      setScholarships(res.data || []);
    } catch (error) {
      console.error('Failed to fetch scholarships', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScholarships();
    setRefreshing(false);
  };

  const handleDeleteScholarship = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this scholarship?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/scholarships/${id}`);
            fetchScholarships();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete scholarship.');
          }
        }
      }
    ]);
  };

  const handleCreateScholarship = async () => {
    if (!newScholarship.name || !newScholarship.discountPercentage) {
      Alert.alert('Error', 'Name and Discount % are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/scholarships', {
        ...newScholarship,
        discountPercentage: Number(newScholarship.discountPercentage),
        minAcademicScore: newScholarship.minAcademicScore ? Number(newScholarship.minAcademicScore) : 0
      });
      setAddModalOpen(false);
      setNewScholarship({ name: '', description: '', discountPercentage: '', minAcademicScore: '' });
      fetchScholarships();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create scholarship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scholarships</Text>
        <NeoButton onPress={() => setAddModalOpen(true)} style={styles.addBtn}>
          <GraduationCap size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Create</Text>
        </NeoButton>
      </View>

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
      >
        {scholarships.map(s => (
          <NeoCard key={s._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{s.name}</Text>
                <Text style={styles.cardDesc}>{s.description || 'No description'}</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{s.discountPercentage}% OFF</Text>
              </View>
            </View>
            
            {s.minAcademicScore > 0 && (
              <Text style={styles.minScoreText}>Min Academic Score Required: {s.minAcademicScore}</Text>
            )}

            <TouchableOpacity onPress={() => handleDeleteScholarship(s._id)} style={styles.deleteBtn}>
              <Trash2 size={16} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.deleteBtnText}>Delete Scholarship</Text>
            </TouchableOpacity>
          </NeoCard>
        ))}

        {scholarships.length === 0 && (
          <Text style={styles.emptyText}>No scholarships found.</Text>
        )}
      </ScrollView>

      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Scholarship</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <X size={24} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <NeoInput
                label="Scholarship Name"
                placeholder="e.g. Merit Scholarship"
                value={newScholarship.name}
                onChangeText={(t) => setNewScholarship({...newScholarship, name: t})}
              />
              <NeoInput
                label="Description"
                placeholder="Optional description"
                value={newScholarship.description}
                onChangeText={(t) => setNewScholarship({...newScholarship, description: t})}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <NeoInput
                    label="Discount %"
                    placeholder="e.g. 50"
                    keyboardType="numeric"
                    value={newScholarship.discountPercentage}
                    onChangeText={(t) => setNewScholarship({...newScholarship, discountPercentage: t})}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <NeoInput
                    label="Min Score"
                    placeholder="e.g. 90"
                    keyboardType="numeric"
                    value={newScholarship.minAcademicScore}
                    onChangeText={(t) => setNewScholarship({...newScholarship, minAcademicScore: t})}
                  />
                </View>
              </View>
              <NeoButton onPress={handleCreateScholarship} loading={loading} style={{ marginTop: 20 }}>
                Create Scholarship
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
  card: { marginBottom: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#a3a3a3', maxWidth: '80%' },
  discountBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  discountText: { color: '#22c55e', fontWeight: 'bold', fontSize: 16 },
  minScoreText: { color: '#f59e0b', fontSize: 12, marginTop: 8, marginBottom: 12 },
  deleteBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, marginTop: 12 },
  deleteBtnText: { color: '#ef4444', fontWeight: 'bold' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#171717', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' }
});
