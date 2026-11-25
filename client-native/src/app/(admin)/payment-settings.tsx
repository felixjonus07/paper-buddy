import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { CreditCard, Save } from 'lucide-react-native';
import api from '@/services/api';
import NeoCard from '@/components/ui/NeoCard';
import NeoInput from '@/components/ui/NeoInput';
import NeoButton from '@/components/ui/NeoButton';

export default function AdminPaymentSettingsScreen() {
  const [paymentType, setPaymentType] = useState('CENTRALIZED');
  const [credentials, setCredentials] = useState({ merchantId: '', saltKey: '', saltIndex: '1', env: 'SANDBOX' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/college/payment-settings');
      if (res.data) {
        setPaymentType(res.data.paymentType);
        if (res.data.paymentCredentials) {
          setCredentials({
            merchantId: res.data.paymentCredentials.merchantId || '',
            saltKey: res.data.paymentCredentials.hasSaltKey ? '********' : '',
            saltIndex: res.data.paymentCredentials.saltIndex?.toString() || '1',
            env: res.data.paymentCredentials.env || 'SANDBOX'
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment settings', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        paymentType,
        paymentCredentials: {
          merchantId: credentials.merchantId,
          saltKey: credentials.saltKey === '********' ? undefined : credentials.saltKey,
          saltIndex: parseInt(credentials.saltIndex),
          env: credentials.env
        }
      };
      await api.put('/admin/college/payment-settings', payload);
      Alert.alert('Success', 'Payment settings updated successfully');
      fetchSettings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Gateway Settings</Text>
      </View>

      <NeoCard style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <CreditCard size={24} color="#f87410" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>PhonePe Integration</Text>
        </View>

        <Text style={{ color: '#a3a3a3', marginBottom: 12 }}>Payment Collection Mode</Text>
        <View style={styles.radioGroup}>
          <NeoButton 
            style={[styles.radioBtn, paymentType === 'CENTRALIZED' && styles.radioBtnActive]}
            onPress={() => setPaymentType('CENTRALIZED')}
          >
            Centralized (PBGU)
          </NeoButton>
          <NeoButton 
            style={[styles.radioBtn, paymentType === 'DIRECT_TO_COLLEGE' && styles.radioBtnActive]}
            onPress={() => setPaymentType('DIRECT_TO_COLLEGE')}
          >
            Direct to College
          </NeoButton>
        </View>

        {paymentType === 'DIRECT_TO_COLLEGE' && (
          <View style={{ marginTop: 20 }}>
            <NeoInput
              label="Merchant ID"
              value={credentials.merchantId}
              onChangeText={(t) => setCredentials({...credentials, merchantId: t})}
            />
            <NeoInput
              label="Salt Key"
              value={credentials.saltKey}
              onChangeText={(t) => setCredentials({...credentials, saltKey: t})}
              secureTextEntry
            />
            <NeoInput
              label="Salt Index"
              value={credentials.saltIndex}
              onChangeText={(t) => setCredentials({...credentials, saltIndex: t})}
              keyboardType="numeric"
            />
            
            <Text style={{ color: '#a3a3a3', marginBottom: 8, marginTop: 8 }}>Environment</Text>
            <View style={styles.radioGroup}>
              <NeoButton 
                style={[styles.radioBtn, credentials.env === 'SANDBOX' && styles.radioBtnActive]}
                onPress={() => setCredentials({...credentials, env: 'SANDBOX'})}
              >
                Sandbox
              </NeoButton>
              <NeoButton 
                style={[styles.radioBtn, credentials.env === 'PRODUCTION' && styles.radioBtnActive]}
                onPress={() => setCredentials({...credentials, env: 'PRODUCTION'})}
              >
                Production
              </NeoButton>
            </View>
          </View>
        )}

        <NeoButton onPress={handleSave} loading={loading} style={{ marginTop: 30, backgroundColor: '#22c55e', shadowColor: '#22c55e' }}>
          <Save size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Save Settings</Text>
        </NeoButton>
      </NeoCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f87410' },
  radioGroup: { flexDirection: 'row', gap: 10 },
  radioBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', shadowColor: 'transparent' },
  radioBtnActive: { backgroundColor: '#f87410', shadowColor: '#f87410' }
});
