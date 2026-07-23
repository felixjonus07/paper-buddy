import React, { createContext, useContext, useState, useCallback } from 'react';
import NeoModal from '../components/UI/NeoModal';
import NeoButton from '../components/UI/NeoButton';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' | 'confirm'
    resolvePromise: null,
  });

  const showAlert = useCallback((message, title = 'Alert') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type: 'alert',
        resolvePromise: resolve,
      });
    });
  }, []);

  const showConfirm = useCallback((message, title = 'Confirm') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        resolvePromise: resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (modalState.resolvePromise) {
      modalState.resolvePromise(false);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [modalState]);

  const handleConfirm = useCallback(() => {
    if (modalState.resolvePromise) {
      modalState.resolvePromise(true);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [modalState]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {modalState.isOpen && (
        <NeoModal 
          isOpen={modalState.isOpen} 
          onClose={handleClose} 
          title={modalState.title}
        >
          <div style={{ padding: '1rem 0' }}>
            <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '1rem', lineHeight: 1.5 }}>
              {modalState.message}
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            {modalState.type === 'confirm' && (
              <NeoButton variant="secondary" onClick={handleClose}>
                Cancel
              </NeoButton>
            )}
            <NeoButton variant="primary" onClick={handleConfirm}>
              {modalState.type === 'confirm' ? 'Confirm' : 'OK'}
            </NeoButton>
          </div>
        </NeoModal>
      )}
    </AlertContext.Provider>
  );
};
