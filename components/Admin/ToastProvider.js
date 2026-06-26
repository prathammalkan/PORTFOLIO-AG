'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            style={{
              padding: '0.875rem 1.25rem',
              borderRadius: '10px',
              pointerEvents: 'auto',
              background:
                t.type === 'error'
                  ? 'hsl(0, 80%, 15%)'
                  : t.type === 'info'
                    ? 'hsl(210, 80%, 15%)'
                    : 'hsl(160, 80%, 12%)',
              border: `1px solid ${
                t.type === 'error'
                  ? 'hsl(0, 80%, 50%)'
                  : t.type === 'info'
                    ? 'hsl(210, 80%, 55%)'
                    : 'hsl(160, 70%, 45%)'
              }`,
              color:
                t.type === 'error'
                  ? 'hsl(0, 80%, 88%)'
                  : t.type === 'info'
                    ? 'hsl(210, 80%, 90%)'
                    : 'hsl(160, 70%, 88%)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s ease-out',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>
              {t.type === 'error' ? '✕' : t.type === 'info' ? 'ℹ' : '✓'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => typeof alert === 'function' && alert('✓ ' + msg),
      error: (msg) => typeof alert === 'function' && alert('✕ ' + msg),
      info: (msg) => typeof alert === 'function' && alert('ℹ ' + msg),
    };
  }
  return context;
}
