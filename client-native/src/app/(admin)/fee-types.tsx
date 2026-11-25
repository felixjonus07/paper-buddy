import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Settings, Trash2 } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';

export default function AdminFeeTypesScreen() {
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [newFeeType, setNewFeeType] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  const fetchFeeTypes = async () => {
    try {
      const res = await api.get('/admin/fees/types');
      setFeeTypes(res.data || []);
    } catch (error) {
      console.error('Failed to fetch fee types', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeeTypes();
    setRefreshing(false);
  };

  const handleDeleteFeeType = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this fee type?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/fees/types/${id}`);
            fetchFeeTypes();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete fee type.');
          }
        }
      }
    ]);
  };

  const handleCreateFeeType = async () => {
    if (!newFeeType.name) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/fees/types', newFeeType);
      setNewFeeType({ name: '', description: '' });
      fetchFeeTypes();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create fee type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fee Types</Text>
      </View>

      <NeoCard style={styles.formCard}>
        <Text style={styles.sectionTitle}>Create New Fee Type</Text>
        <NeoInput
          placeholder="Fee Type Name (e.g. Tuition)"
          value={newFeeType.name}
          onChangeText={(t) => setNewFeeType({...newFeeType, name: t})}
        />
        <NeoInput
          placeholder="Description"
          value={newFeeType.description}
          onChangeText={(t) => setNewFeeType({...newFeeType, description: t})}
        />
        <NeoButton onPress={handleCreateFeeType} loading={loading} style={{ marginTop: 10 }}>
          Create Fee Type
        </NeoButton>
      </NeoCard>

      <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 12 }]}>Existing Fee Types</Text>
      
      {feeTypes.map(c => (
        <NeoCard key={c._id} style={styles.typeCard}>
          <View style={styles.typeHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Settings size={18} color="#f87410" style={{ marginRight: 8 }} />
              <Text style={styles.typeName}>{c.name}</Text>
            </View>
            <NeoButton 
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', shadowColor: 'transparent', paddingVertical: 6, paddingHorizontal: 12 }} 
              onPress={() => handleDeleteFeeType(c._id)}
            >
              <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Delete</Text>
            </NeoButton>
          </View>
          <Text style={styles.typeDesc}>{c.description || 'No description provided'}</Text>
        </NeoCard>
      ))}
      
      {feeTypes.length === 0 && (
        <Text style={styles.emptyText}>No fee types found.</Text>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410' },
  formCard: { marginBottom: 30, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  typeCard: { marginBottom: 12, padding: 16 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  typeDesc: { fontSize: 14, color: '#a3a3a3' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 }
});
