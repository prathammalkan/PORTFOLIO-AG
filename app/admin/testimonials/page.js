'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

const STAR = (n, rating, onClick) => Array.from({ length: 5 }, (_, i) => (
  <span key={i} onClick={() => onClick(i + 1)} style={{ cursor: 'pointer', color: i < n ? '#f0b429' : 'hsl(0,0%,25%)', fontSize: '1.25rem' }}>★</span>
));

export default function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ client_name: '', company: '', position: '', testimonial_text: '', client_image: '', rating: 5, status: 'published' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const { data } = await supabase.from('testimonials').select('*').order('sort_order').order('created_at', { ascending: false }); setItems(data || []); setLoading(false); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm({ client_name: '', company: '', position: '', testimonial_text: '', client_image: '', rating: 5, status: 'published' }); setShowForm(true); };
  const openEdit = (t) => { setEditing(t.id); setForm(t); setShowForm(true); };

  const save = async () => {
    if (!form.client_name || !form.testimonial_text) return;
    setSaving(true);
    if (editing) { await supabase.from('testimonials').update(form).eq('id', editing); }
    else { await supabase.from('testimonials').insert(form); }
    setSaving(false); setShowForm(false); load();
  };

  const del = async (id) => { if (!confirm('Delete testimonial?')) return; await supabase.from('testimonials').delete().eq('id', id); setItems(p => p.filter(x => x.id !== id)); };
  const toggle = async (id, status) => { const ns = status === 'published' ? 'draft' : 'published'; await supabase.from('testimonials').update({ status: ns }).eq('id', id); setItems(p => p.map(x => x.id === id ? { ...x, status: ns } : x)); };

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Testimonials <span className={s.count}>({items.length})</span></h2>
        <button className={s.btnPrimary} onClick={openNew}>+ Add Testimonial</button>
      </div>

      {loading ? <p className={s.loadingRow}>Loading…</p> : items.length === 0 ? (
        <div className={s.empty}><div className={s.emptyIcon}>⭐</div><div className={s.emptyTitle}>No testimonials yet</div><button className={s.btnPrimary} style={{ marginTop: '1rem' }} onClick={openNew}>+ Add First Testimonial</button></div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Client</th><th>Company</th><th>Rating</th><th>Status</th><th>Preview</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {t.client_image ? <img src={t.client_image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'hsl(0,0%,50%)' }}>{t.client_name?.[0]}</div>}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'hsl(0,0%,90%)' }}>{t.client_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,50%)' }}>{t.position}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'hsl(0,0%,60%)' }}>{t.company || '—'}</td>
                  <td><div style={{ color: '#f0b429', letterSpacing: '0.05em' }}>{'★'.repeat(t.rating || 5)}</div></td>
                  <td><span className={`${s.badge} ${t.status === 'published' ? s.badgeGreen : s.badgeGray}`}>{t.status}</span></td>
                  <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,55%)', maxWidth: 200 }}><div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.testimonial_text}</div></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => openEdit(t)}>Edit</button>
                      <button className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', color: t.status === 'published' ? '#f0b429' : '#33cc88' }} onClick={() => toggle(t.id, t.status)}>{t.status === 'published' ? 'Hide' : 'Show'}</button>
                      <button className={s.btnDanger} style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }} onClick={() => del(t.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className={s.modal}>
            <h3 className={s.modalTitle}>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
            <div className={s.fieldGroup}>
              <div className={s.field}><label className={s.label}>Client Name *</label><input className={s.input} value={form.client_name} onChange={e => set('client_name', e.target.value)} /></div>
              <div className={s.field}><label className={s.label}>Company</label><input className={s.input} value={form.company || ''} onChange={e => set('company', e.target.value)} /></div>
              <div className={s.field}><label className={s.label}>Position / Role</label><input className={s.input} value={form.position || ''} onChange={e => set('position', e.target.value)} /></div>
              <div className={s.field}><label className={s.label}>Client Photo URL</label><input className={s.input} value={form.client_image || ''} onChange={e => set('client_image', e.target.value)} /></div>
              <div className={s.field}>
                <label className={s.label}>Rating</label>
                <div style={{ display: 'flex', gap: '0.25rem', paddingTop: '0.5rem' }}>{STAR(form.rating, form.rating, v => set('rating', v))}</div>
              </div>
              <div className={s.field}><label className={s.label}>Status</label><select className={s.select} value={form.status} onChange={e => set('status', e.target.value)}><option value="published">Published</option><option value="draft">Draft</option></select></div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Testimonial Text *</label><textarea className={s.textarea} style={{ minHeight: 120 }} value={form.testimonial_text} onChange={e => set('testimonial_text', e.target.value)} /></div>
            </div>
            <div className={s.modalActions}>
              <button className={s.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
