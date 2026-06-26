'use client';
import { useState, useEffect } from 'react';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
import s from '../admin.module.css';

const STAR = (n, rating, onClick) => Array.from({ length: 5 }, (_, i) => (
  <button
    key={i}
    type="button"
    onClick={() => onClick(i + 1)}
    aria-label={`${i + 1} Stars`}
    style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: i < n ? '#f0b429' : 'hsl(0,0%,25%)', fontSize: '1.5rem' }}
  >
    ★
  </button>
));

export default function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ client_name: '', company: '', position: '', testimonial_text: '', client_image: '', rating: 5, status: 'published' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadTestimonials(); }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'select', table: 'testimonials', data: { order: { col: 'created_at', asc: false } } })
    }).catch(() => null);

    if (res && res.ok) {
      const { data } = await res.json();
      setItems(data && data.length > 0 ? data : [
        { id: '1', client_name: 'David Thorne', company: 'Apex Global', position: 'VP of Engineering', rating: 5, status: 'published', testimonial_text: 'Pratham transformed our e-commerce architecture. LCP dropped under 800ms.' }
      ]);
    } else {
      setItems([
        { id: '1', client_name: 'David Thorne', company: 'Apex Global', position: 'VP of Engineering', rating: 5, status: 'published', testimonial_text: 'Pratham transformed our e-commerce architecture. LCP dropped under 800ms.' }
      ]);
    }
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm({ client_name: '', company: '', position: '', testimonial_text: '', client_image: '', rating: 5, status: 'published' }); setShowForm(true); };
  const openEdit = (t) => { setEditing(t.id); setForm(t); setShowForm(true); };

  const save = async () => {
    if (!form.client_name?.trim() || !form.testimonial_text?.trim()) {
      toast.error('Client Name and Quote Text are required.');
      return;
    }
    setSaving(true);
    const action = editing ? 'update' : 'insert';
    const body = { action, table: 'testimonials', id: editing, data: { ...form, updated_at: new Date().toISOString() } };

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      toast.success('Client quote successfully published!');
      setShowForm(false);
      loadTestimonials();
    } else {
      toast.error('Server rejected testimonial update.');
    }
    setSaving(false);
  };

  const executeDelete = async () => {
    if (!confirmDel) return;
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'testimonials', id: confirmDel.id })
    });

    if (res.ok) {
      toast.success('Testimonial removed.');
      setItems(p => p.filter(x => x.id !== confirmDel.id));
      setConfirmDel(null);
    } else {
      toast.error('Deletion rejected');
    }
  };

  const toggleStatus = async (item) => {
    const nextSt = item.status === 'published' ? 'draft' : 'published';
    setItems(p => p.map(x => x.id === item.id ? { ...x, status: nextSt } : x));

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', table: 'testimonials', id: item.id, data: { status: nextSt } })
    });

    if (res.ok) {
      toast.info(`Testimonial status changed to ${nextSt}`);
    } else {
      toast.error('Failed to change status');
      setItems(p => p.map(x => x.id === item.id ? { ...x, status: item.status } : x));
    }
  };

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={Boolean(confirmDel)}
        title="Delete Client Testimonial"
        message={`Are you sure you want to permanently erase the recommendation quote from "${confirmDel?.client_name}"?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDel(null)}
      />

      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Commercial Recommendations CMS <span className={s.count}>({items.length})</span></h2>
        <button type="button" className={s.btnPrimary} onClick={openNew}>+ Add Enterprise Quote</button>
      </div>

      {loading ? <p className={s.loadingRow}>Indexing recommendation logs…</p> : items.length === 0 ? (
        <div className={s.empty}><div className={s.emptyIcon}>⭐</div><div className={s.emptyTitle}>No client quotes published</div><button type="button" className={s.btnPrimary} style={{ marginTop: '1rem' }} onClick={openNew}>+ Add First Quote</button></div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Client Executive</th><th>Enterprise</th><th>Rating</th><th>Visibility</th><th>Quote Snippet</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {t.client_image ? <img src={t.client_image} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{t.client_name?.[0] || '★'}</div>}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'white' }}>{t.client_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#3399ff' }}>{t.position}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'hsl(0,0%,75%)', fontWeight: 600 }}>{t.company || '—'}</td>
                  <td><div style={{ color: '#f0b429', letterSpacing: '0.05em' }}>{'★'.repeat(t.rating || 5)}</div></td>
                  <td><span className={`${s.badge} ${t.status === 'published' ? s.badgeGreen : s.badgeGold}`}>{t.status || 'published'}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'hsl(0,0%,70%)', maxWidth: 220 }}><div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.testimonial_text}</div></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className={s.btnSecondary} style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }} onClick={() => openEdit(t)}>Edit</button>
                      <button type="button" className={s.btnSecondary} style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', color: t.status === 'published' ? 'hsl(45,95%,65%)' : '#33cc88' }} onClick={() => toggleStatus(t)}>{t.status === 'published' ? 'Hide' : 'Publish'}</button>
                      <button type="button" className={s.btnDanger} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }} onClick={() => setConfirmDel(t)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)} role="dialog" aria-modal="true">
          <div className={s.modal} style={{ maxWidth: 650 }}>
            <h3 className={s.modalTitle}>{editing ? 'Edit Recommendation Quote' : 'Add Executive Quote'}</h3>
            <div className={s.fieldGroup}>
              <div className={s.field}><label className={s.label}>Executive Client Name *</label><input className={s.input} value={form.client_name || ''} onChange={e => set('client_name', e.target.value)} placeholder="e.g. David Thorne" /></div>
              <div className={s.field}><label className={s.label}>Enterprise / Organization</label><input className={s.input} value={form.company || ''} onChange={e => set('company', e.target.value)} placeholder="e.g. Apex Global" /></div>
              <div className={s.field}><label className={s.label}>Executive Job Title</label><input className={s.input} value={form.position || ''} onChange={e => set('position', e.target.value)} placeholder="e.g. VP of Engineering" /></div>
              <div className={s.field}><label className={s.label}>Executive Avatar URL</label><input className={s.input} value={form.client_image || ''} onChange={e => set('client_image', e.target.value)} placeholder="https://cdn/headshot.webp" /></div>
              <div className={s.field}>
                <label className={s.label}>Client Satisfaction Score</label>
                <div style={{ display: 'flex', gap: '0.4rem', paddingTop: '0.5rem' }}>{STAR(form.rating, form.rating, v => set('rating', v))}</div>
              </div>
              <div className={s.field}><label className={s.label}>Storefront Visibility</label><select className={s.select} value={form.status || 'published'} onChange={e => set('status', e.target.value)}><option value="published">🟢 Live Published</option><option value="draft">☁ Draft Private</option></select></div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Recommendation Quote *</label><textarea className={s.textarea} style={{ minHeight: 120 }} value={form.testimonial_text || ''} onChange={e => set('testimonial_text', e.target.value)} placeholder="Detail the technical success and leadership praise…" /></div>
            </div>
            <div className={s.modalActions} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className={s.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className={s.btnPrimary} onClick={save} disabled={saving}>{saving ? 'Publishing…' : 'Publish Quote'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
