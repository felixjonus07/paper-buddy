import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Modal } from 'react-native';
import { Layers, Plus, Trash2, Users, X } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';
import { useRouter } from 'expo-router';

export default function AdminGroupsScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', isGlobal: false });
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/admin/groups');
      setGroups(res.data || []);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const handleDeleteGroup = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this group?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/groups/${id}`);
            fetchGroups();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete group.');
          }
        }
      }
    ]);
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name) {
      Alert.alert('Error', 'Group name is required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/groups', { ...newGroup, studentIds: [] });
      setAddModalOpen(false);
      setNewGroup({ name: '', description: '', isGlobal: false });
      fetchGroups();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Group Management</Text>
        <NeoButton onPress={() => setAddModalOpen(true)} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Create</Text>
        </NeoButton>
      </View>

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
      >
        {groups.map(g => (
          <NeoCard key={g._id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupDate}>{new Date(g.createdAt).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteGroup(g._id)} style={styles.deleteBtn}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {g.parentGroups && g.parentGroups.length > 0 && (
              <View style={styles.subgroupBadge}>
                <Text style={styles.subgroupText}>Subgroup of: {g.parentGroups.map((p:any) => p.name).join(', ')}</Text>
              </View>
            )}

            <View style={styles.groupFooter}>
              <View style={styles.studentCount}>
                <Users size={16} color="#a3a3a3" />
                <Text style={styles.studentCountText}>{g.students?.length || 0} Students</Text>
              </View>
            </View>
          </NeoCard>
        ))}
        {groups.length === 0 && (
          <Text style={styles.emptyText}>No groups found.</Text>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Group</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <X size={24} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <NeoInput
                label="Group Name"
                placeholder="e.g. CS Dept 2024"
                value={newGroup.name}
                onChangeText={(t) => setNewGroup({...newGroup, name: t})}
              />
              <NeoInput
                label="Description"
                placeholder="Optional description"
                value={newGroup.description}
                onChangeText={(t) => setNewGroup({...newGroup, description: t})}
              />
              <NeoButton onPress={handleCreateGroup} loading={loading} style={{ marginTop: 20 }}>
                Create Group
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
  groupCard: { marginBottom: 16, padding: 16 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  groupName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  groupDate: { fontSize: 12, color: '#a3a3a3' },
  deleteBtn: { padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },
  subgroupBadge: { backgroundColor: 'rgba(248, 116, 16, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(248, 116, 16, 0.3)' },
  subgroupText: { color: '#f87410', fontSize: 12, fontWeight: '600' },
  groupFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  studentCount: { flexDirection: 'row', alignItems: 'center' },
  studentCountText: { color: '#a3a3a3', marginLeft: 8, fontSize: 14 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#171717', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' }
});
