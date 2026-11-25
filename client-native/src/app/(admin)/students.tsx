import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, Plus, Trash2, X } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoInput from '@/components/ui/NeoInput';
import NeoButton from '@/components/ui/NeoButton';

export default function AdminStudentsScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteUser = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete user.');
          }
        }
      }
    ]);
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/users', newUser);
      setAddModalOpen(false);
      setNewUser({ name: '', username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Students</Text>
        <NeoButton onPress={() => setAddModalOpen(true)} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 5, fontWeight: 'bold' }}>Add</Text>
        </NeoButton>
      </View>

      <NeoInput
        placeholder="Search students..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView 
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87410" />}
      >
        {filteredUsers.map(u => (
          <NeoCard key={u._id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userUsername}>@{u.username}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{u.role}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteUser(u._id)} style={styles.deleteBtn}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </NeoCard>
        ))}
        {filteredUsers.length === 0 && (
          <Text style={styles.emptyText}>No students found.</Text>
        )}
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Student</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <X size={24} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <NeoInput
                label="Full Name"
                placeholder="John Doe"
                value={newUser.name}
                onChangeText={(t) => setNewUser({...newUser, name: t})}
              />
              <NeoInput
                label="Username"
                placeholder="johndoe"
                value={newUser.username}
                onChangeText={(t) => setNewUser({...newUser, username: t})}
                autoCapitalize="none"
              />
              <NeoInput
                label="Password"
                placeholder="Initial password"
                value={newUser.password}
                onChangeText={(t) => setNewUser({...newUser, password: t})}
                secureTextEntry
              />
              <NeoButton onPress={handleAddUser} loading={loading} style={{ marginTop: 20 }}>
                Create Student
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410' },
  addBtn: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 },
  list: { paddingBottom: 40, marginTop: 10 },
  userCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userUsername: { fontSize: 14, color: '#a3a3a3', marginBottom: 8 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(248, 116, 16, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248, 116, 16, 0.4)' },
  roleText: { color: '#f87410', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  deleteBtn: { padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#171717', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' }
});
