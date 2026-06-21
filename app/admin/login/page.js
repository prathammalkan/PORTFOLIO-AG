'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setLocked(true);
          let remaining = 30;
          setLockCountdown(remaining);
          const interval = setInterval(() => {
            remaining--;
            setLockCountdown(remaining);
            if (remaining <= 0) {
              clearInterval(interval);
              setLocked(false);
              setAttempts(0);
            }
          }, 1000);
          setError('Too many failed attempts. Please wait 30 seconds.');
        } else {
          setError(`Incorrect password. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining.`);
        }
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <span className={styles.logoText}>PRISM</span>
          <span className={styles.logoSub}>ADMIN</span>
        </div>

        <h1 className={styles.title}>Portfolio Management</h1>
        <p className={styles.subtitle}>Enter your admin password to continue</p>

        <div className={styles.inputWrap}>
          <input
            type={show ? 'text' : 'password'}
            className={styles.input}
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading || locked}
            autoFocus
            required
          />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShow(!show)}
            tabIndex={-1}
          >
            {show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            {locked ? `🔒 ${error} (${lockCountdown}s)` : `⚠ ${error}`}
          </div>
        )}

        <button type="submit" className={styles.btn} disabled={loading || locked || !password}>
          {loading ? (
            <span className={styles.spinner} />
          ) : locked ? (
            `Locked (${lockCountdown}s)`
          ) : (
            'Enter Admin'
          )}
        </button>

        <p className={styles.hint}>Access restricted to authorized users only</p>
      </form>
    </div>
  );
}
