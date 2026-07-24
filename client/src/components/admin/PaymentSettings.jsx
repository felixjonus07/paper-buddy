import React, { useState, useEffect } from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';
import { CreditCard, Save, Lock, AlertCircle } from 'lucide-react';

const PaymentSettings = ({ isReadOnly }) => {
  const [paymentType, setPaymentType] = useState('CENTRALIZED');
  const [credentials, setCredentials] = useState({
    merchantId: '',
    saltKey: '',
    saltIndex: 1,
    env: 'SANDBOX'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch existing settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/college/payment-settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPaymentType(data.paymentType);
          if (data.paymentCredentials) {
            setCredentials({
              merchantId: data.paymentCredentials.merchantId || '',
              saltKey: data.paymentCredentials.hasSaltKey ? '********' : '',
              saltIndex: data.paymentCredentials.saltIndex || 1,
              env: data.paymentCredentials.env || 'SANDBOX'
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch payment settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      setMessage({ type: 'error', text: 'You are in read-only mode. Cannot save settings.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const payload = {
        paymentType,
        paymentCredentials: paymentType === 'DECENTRALIZED' ? credentials : null
      };

      const res = await fetch('/api/admin/college/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Payment settings updated successfully!' });
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update settings.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while updating settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={24} /> Payment Gateway Settings
        </h2>
      </div>

      <NeoCard>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Select Gateway Mode</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Choose whether to use the centralized platform gateway or your own custom decentralized gateway to receive payments directly into your account.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              onClick={() => !isReadOnly && setPaymentType('CENTRALIZED')}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '1.5rem',
                borderRadius: '15px',
                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                border: paymentType === 'CENTRALIZED' ? '2px solid var(--primary)' : '2px solid var(--border)',
                backgroundColor: paymentType === 'CENTRALIZED' ? 'rgba(99, 102, 241, 0.05)' : 'var(--clay-base)',
                transition: 'all 0.2s'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Centralized (Default)</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Payments will be processed via the platform's central merchant account.</p>
            </div>

            <div
              onClick={() => !isReadOnly && setPaymentType('DECENTRALIZED')}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '1.5rem',
                borderRadius: '15px',
                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                border: paymentType === 'DECENTRALIZED' ? '2px solid var(--clay-mint)' : '2px solid var(--border)',
                backgroundColor: paymentType === 'DECENTRALIZED' ? 'rgba(45, 212, 191, 0.05)' : 'var(--clay-base)',
                transition: 'all 0.2s'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--clay-mint)' }}>Decentralized (Custom)</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Configure your own PhonePe PG credentials to receive funds directly.</p>
            </div>
          </div>
        </div>

        {paymentType === 'DECENTRALIZED' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '15px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} /> PhonePe API Credentials
              </h3>
              <a href="https://business.phonepe.com/register" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Get Credentials &rarr;
              </a>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="stats-grid-small">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Merchant ID</label>
                  <NeoInput
                    type="text"
                    placeholder="e.g. PGTESTPAYUAT"
                    value={credentials.merchantId}
                    onChange={(e) => setCredentials({ ...credentials, merchantId: e.target.value })}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Salt Key</label>
                  <NeoInput
                    type="password"
                    placeholder="Your Salt Key"
                    value={credentials.saltKey}
                    onChange={(e) => setCredentials({ ...credentials, saltKey: e.target.value })}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Salt Index</label>
                  <NeoInput
                    type="number"
                    value={credentials.saltIndex}
                    onChange={(e) => setCredentials({ ...credentials, saltIndex: parseInt(e.target.value) || 1 })}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>Environment</label>
                  <select
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '15px', border: 'none', backgroundColor: 'var(--clay-base)', boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)', color: 'var(--text-color)', outline: 'none' }}
                    value={credentials.env}
                    onChange={(e) => setCredentials({ ...credentials, env: e.target.value })}
                    disabled={isReadOnly}
                  >
                    <option value="SANDBOX">SANDBOX (Testing)</option>
                    <option value="PRODUCTION">PRODUCTION (Live)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clay-peach)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <AlertCircle size={16} />
                Ensure your credentials are correct. Invalid credentials will prevent users from making payments.
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <NeoButton type="submit" variant="primary" disabled={loading || isReadOnly}>
                  {loading ? 'Saving...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Save Configuration</>}
                </NeoButton>
              </div>
            </form>
          </div>
        )}

        {paymentType === 'CENTRALIZED' && (
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <NeoButton onClick={handleSave} variant="primary" disabled={loading || isReadOnly}>
              {loading ? 'Saving...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Save Centralized Mode</>}
            </NeoButton>
          </div>
        )}

        {message.text && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '10px', backgroundColor: message.type === 'success' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)', color: message.type === 'success' ? '#115e59' : '#9f1239' }}>
            {message.text}
          </div>
        )}
      </NeoCard>
    </div>
  );
};

export default PaymentSettings;
