'use client';
import { useEffect } from 'react';

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  danger = true,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-msg"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'hsl(240, 10%, 9%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          padding: '1.75rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3
          id="confirm-title"
          style={{
            margin: '0 0 0.75rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'white',
          }}
        >
          {title || 'Confirm Action'}
        </h3>
        <p
          id="confirm-msg"
          style={{
            margin: '0 0 1.75rem',
            fontSize: '0.88rem',
            color: 'hsl(0,0%,70%)',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div
          style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: 'hsl(0,0%,75%)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: danger ? 'hsl(8, 85%, 58%)' : 'hsl(210, 100%, 60%)',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
