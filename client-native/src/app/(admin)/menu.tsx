import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Layers, FileText, Settings, Activity, GraduationCap, UserCog, TrendingUp, CreditCard, LogOut, ChevronRight } from 'lucide-react-native';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';

export default function AdminMenuScreen() {
  const router = useRouter();

  const menuItems = [
    { id: 'groups', label: 'Group Management', icon: Layers, route: '/(admin)/groups' },
    { id: 'fees', label: 'Fees Management', icon: FileText, route: '/(admin)/fees' },
    { id: 'fee-types', label: 'Fee Types', icon: Settings, route: '/(admin)/fee-types' },
    { id: 'fee-requests', label: 'Fee Requests', icon: Activity, route: '/(admin)/fee-requests' },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap, route: '/(admin)/scholarships' },
    { id: 'cashiers', label: 'Cashiers', icon: UserCog, route: '/(admin)/cashiers' },
    { id: 'reports', label: 'Reports', icon: TrendingUp, route: '/(admin)/reports' },
    { id: 'payment-settings', label: 'Gateway Settings', icon: CreditCard, route: '/(admin)/payment-settings' },
  ];

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Menu & Settings</Text>

      <NeoCard style={styles.card}>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, index === menuItems.length - 1 && styles.lastMenuItem]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <IconComponent size={20} color="#f87410" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#666" />
            </TouchableOpacity>
          );
        })}
      </NeoCard>

      <NeoButton onPress={handleLogout} style={styles.logoutBtn}>
        Log Out
      </NeoButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410', marginBottom: 20, marginTop: 10 },
  card: { padding: 0, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(248, 116, 16, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutBtn: {
    marginTop: 30,
    marginBottom: 40,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444'
  }
});
