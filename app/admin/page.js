'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'pratham@admin2026';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setSubmissions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchSubmissions();
  }, [authed, fetchSubmissions]);

  const login = (e) => {
    e.preventDefault();
    if (pw === PASSWORD) { setAuthed(true); setPwError(''); }
    else { setPwError('Incorrect password.'); }
  };

  const markRead = async (id) => {
    await supabase.from('contact_submissions').update({ read: true }).eq('id', id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read: true } : s));
  };

  const deleteSubmission = async (id) => {
    await supabase.from('contact_submissions').delete().eq('id', id);
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = submissions.filter(s => {
    if (filter === 'unread') return !s.read;
    if (filter === 'read') return s.read;
    return true;
  });

  const unreadCount = submissions.filter(s => !s.read).length;

  if (!authed) {
    return (
      <div className={styles.loginWrap}>
        <form className={styles.loginForm} onSubmit={login}>
          <h1 className={styles.loginTitle}>Admin Access</h1>
          <input
            type="password"
            className={styles.loginInput}
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoFocus
          />
          {pwError && <p className={styles.loginError}>{pwError}</p>}
          <button type="submit" className={styles.loginBtn}>Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Contact Submissions</h1>
          <p className={styles.subtitle}>{unreadCount} unread · {submissions.length} total</p>
        </div>
        <div className={styles.filters}>
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button className={styles.refreshBtn} onClick={fetchSubmissions}>↻ Refresh</button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* List */}
        <div className={styles.list}>
          {loading && <p className={styles.loading}>Loading...</p>}
          {!loading && filtered.length === 0 && <p className={styles.empty}>No submissions found.</p>}
          {filtered.map(s => (
            <div
              key={s.id}
              className={`${styles.item} ${!s.read ? styles.itemUnread : ''} ${selected?.id === s.id ? styles.itemSelected : ''}`}
              onClick={() => { setSelected(s); markRead(s.id); }}
            >
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>{s.name}</span>
                {!s.read && <span className={styles.unreadDot} />}
              </div>
              <span className={styles.itemService}>{s.service}</span>
              <span className={styles.itemDate}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className={styles.detail}>
          {!selected ? (
            <div className={styles.detailEmpty}>Select a submission to view details</div>
          ) : (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailName}>{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className={styles.detailEmail}>{selected.email}</a>
                </div>
                <div className={styles.detailActions}>
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.service} Inquiry`} className={styles.replyBtn}>
                    Reply ↗
                  </a>
                  <button className={styles.deleteBtn} onClick={() => deleteSubmission(selected.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className={styles.detailMeta}>
                <div className={styles.metaItem}><span className={styles.metaLabel}>Service</span><span>{selected.service}</span></div>
                <div className={styles.metaItem}><span className={styles.metaLabel}>Budget</span><span>{selected.budget || 'Not specified'}</span></div>
                <div className={styles.metaItem}><span className={styles.metaLabel}>Date</span><span>{new Date(selected.created_at).toLocaleString('en-IN')}</span></div>
              </div>
              <div className={styles.detailMessage}>
                <p className={styles.metaLabel}>Message</p>
                <p className={styles.messageText}>{selected.message}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
