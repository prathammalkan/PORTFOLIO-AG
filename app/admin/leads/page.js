'use client';
import { useState, useEffect } from 'react';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
import s from '../admin.module.css';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  useEffect(() => { loadLeads(); }, [filter]);

  const loadLeads = async () => {
    setLoading(true);
    const body = { action: 'select', table: 'contact_submissions', data: {} };
    if (filter !== 'all') body.data.eq = { lead_status: filter };
    body.data.order = { col: 'created_at', asc: false };

    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => null);

      if (res && res.ok) {
        const { data } = await res.json();
        setLeads(data || []);
      } else {
        setLeads([]);
      }
    } catch {
      setLeads([]);
    }
    setLoading(false);
  };

  const openLead = async (lead) => {
    setSelected(lead);
    if (!lead.read) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, read: true } : l));
      fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', table: 'contact_submissions', id: lead.id, data: { read: true } })
      }).catch(() => {});
    }

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'select', table: 'lead_notes', data: { eq: { lead_id: lead.id }, order: { col: 'created_at', asc: true } } })
    }).catch(() => null);

    if (res && res.ok) {
      const { data } = await res.json();
      setNotes(data || []);
    } else {
      setNotes([]);
    }
  };

  const updateStatus = async (id, status) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, lead_status: status } : l));
    if (selected?.id === id) setSelected(prev => ({ ...prev, lead_status: status }));

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', table: 'contact_submissions', id, data: { lead_status: status } })
    });

    if (res.ok) {
      toast.success(`Pipeline stage updated to ${status}`);
    } else {
      toast.error('Failed to update stage');
    }
  };

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'insert', table: 'lead_notes', data: { lead_id: selected.id, note: note.trim() } })
    });

    if (res.ok) {
      const { data } = await res.json();
      setNotes(prev => [...prev, ...(data || [{ id: Date.now(), note: note.trim(), created_at: new Date().toISOString() }])]);
      setNote('');
      toast.success('Private note added');
    } else {
      toast.error('Could not save note');
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'contact_submissions', id: confirmDelete.id })
    });

    if (res.ok) {
      toast.success('Lead permanently purged from CRM database.');
      setLeads(prev => prev.filter(l => l.id !== confirmDelete.id));
      if (selected?.id === confirmDelete.id) setSelected(null);
      setConfirmDelete(null);
    } else {
      toast.error('Purge rejected');
    }
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Service', 'Budget', 'Message', 'Status', 'Date']];
    leads.forEach(l => rows.push([l.name, l.email, l.service, l.budget || '', l.message, l.lead_status || 'new', new Date(l.created_at).toLocaleDateString()]));
    const csv = rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `enterprise_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    toast.info('Exported CRM database to CSV.');
  };

  const filtered = leads.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: leads.length,
    new: leads.filter(l => !l.lead_status || l.lead_status === 'new').length,
    converted: leads.filter(l => l.lead_status === 'converted').length
  };

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Purge CRM Lead"
        message={`Are you sure you want to permanently erase inquiry records for "${confirmDelete?.name} (${confirmDelete?.email})"? All private notes will also be deleted.`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Commercial Lead Pipeline & CRM <span className={s.count}>({leads.length})</span></h2>
          <div className={s.statsRow} style={{ marginTop: '0.6rem' }}>
            <span className={s.statPill}>Pipeline Total: <strong>{leads.length}</strong></span>
            <span className={s.statPill}>Unassigned Inquiries: <strong style={{ color: '#3399ff' }}>{counts.new}</strong></span>
            <span className={s.statPill}>Converted Deals: <strong style={{ color: '#33cc88' }}>{counts.converted}</strong></span>
          </div>
        </div>
        <button type="button" className={s.btnSecondary} onClick={exportCSV}>📥 Export CRM Database</button>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search inquiries by client name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
          {['all', 'new', 'contacted', 'follow-up', 'proposal', 'converted', 'closed'].map(f => (
            <button key={f} type="button" className={`${s.filterTab} ${filter === f ? s.filterTabActive : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Leads' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={s.tableWrap}>
        {loading ? <p className={s.loadingRow}>Decrypting CRM pipeline entries…</p> : filtered.length === 0 ? (
          <div className={s.empty}><div className={s.emptyIcon}>📭</div><div className={s.emptyTitle}>No commercial inquiries in this stage</div></div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Read</th>
                <th>Client Contact</th>
                <th>Service Requested</th>
                <th>Budget Scope</th>
                <th>Pipeline Stage</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} onClick={() => openLead(l)} style={{ cursor: 'pointer' }}>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.read ? 'transparent' : '#3399ff', margin: '0 auto', boxShadow: l.read ? 'none' : '0 0 8px #3399ff' }} title={l.read ? 'Read' : 'New Unread Inquiry'} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>{l.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'hsl(0,0%,55%)' }}>{l.email}</div>
                  </td>
                  <td><span className={s.badge} style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(0,0%,80%)' }}>{l.service}</span></td>
                  <td style={{ fontSize: '0.82rem', color: '#33cc88', fontWeight: 600 }}>{l.budget || 'Custom Scope'}</td>
                  <td>
                    <select
                      aria-label={`Pipeline Stage for ${l.name}`}
                      style={{
                        background: 'hsl(240,10%,12%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20,
                        color: l.lead_status === 'converted' ? '#33cc88' : l.lead_status === 'new' ? '#3399ff' : 'hsl(45,95%,65%)',
                        fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', cursor: 'pointer', minHeight: 30
                      }}
                      value={l.lead_status || 'new'}
                      onChange={e => { e.stopPropagation(); updateStatus(l.id, e.target.value); }}
                    >
                      {['new', 'contacted', 'follow-up', 'proposal', 'converted', 'closed'].map(st => <option key={st} value={st}>{st.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td className={s.dim} style={{ fontSize: '0.78rem' }}>
                    {l.created_at ? new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a href={`mailto:${l.email}?subject=Re: Enterprise Inquiry — ${l.service}`} className={s.btnSecondary} style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}>Reply</a>
                      <button type="button" className={s.btnDanger} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => setConfirmDelete(l)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Accessible CRM Slide Drawer Panel */}
      {selected && (
        <>
          <div className={s.slideOverlay} onClick={() => setSelected(null)} role="button" tabIndex={0} aria-label="Close panel" onKeyDown={e => e.key === 'Escape' && setSelected(null)} />
          <div className={s.slidePanel} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 id="drawer-title" style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{selected.name}</h3>
                <span style={{ fontSize: '0.78rem', color: '#3399ff' }}>{selected.email}</span>
              </div>
              <button type="button" onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: 'hsl(0,0%,60%)', fontSize: '1.75rem', cursor: 'pointer' }} aria-label="Close">✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div><div style={{ fontSize: '0.68rem', color: 'hsl(0,0%,50%)' }}>SERVICE</div><div style={{ fontWeight: 600, color: 'white' }}>{selected.service}</div></div>
              <div><div style={{ fontSize: '0.68rem', color: 'hsl(0,0%,50%)' }}>BUDGET</div><div style={{ fontWeight: 600, color: '#33cc88' }}>{selected.budget || 'Unspecified'}</div></div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,50%)', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>CLIENT MESSAGE</div>
              <div style={{ background: 'hsl(240,8%,8%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1.1rem', fontSize: '0.9rem', color: 'hsl(0,0%,85%)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selected.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.72rem', color: 'hsl(0,0%,50%)', display: 'block', marginBottom: '0.4rem' }}>PIPELINE STAGE</label>
                <select className={s.select} value={selected.lead_status || 'new'} onChange={e => updateStatus(selected.id, e.target.value)}>
                  {['new', 'contacted', 'follow-up', 'proposal', 'converted', 'closed'].map(st => <option key={st} value={st}>{st.toUpperCase()}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <a href={`mailto:${selected.email}?subject=Re: Enterprise Inquiry — ${selected.service}`} className={s.btnPrimary} style={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>✉ Email Reply</a>
                <button type="button" className={s.btnDanger} style={{ minHeight: 40 }} onClick={() => setConfirmDelete(selected)}>Purge</button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'hsl(0,0%,80%)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🔐 Private Internal CRM Notes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
                {notes.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'hsl(0,0%,40%)', fontStyle: 'italic', margin: 0 }}>No internal notes recorded yet.</p> : notes.map(n => (
                  <div key={n.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem', borderRadius: 8, borderLeft: '3px solid #3399ff' }}>
                    <div style={{ fontSize: '0.85rem', color: 'white' }}>{n.note}</div>
                    <div style={{ fontSize: '0.68rem', color: 'hsl(0,0%,45%)', marginTop: '0.3rem' }}>{n.created_at ? new Date(n.created_at).toLocaleString('en-US') : 'Just now'}</div>
                  </div>
                ))}
              </div>
              <textarea className={s.textarea} style={{ minHeight: 80 }} placeholder="Type an internal note (visible only to admins)…" value={note} onChange={e => setNote(e.target.value)} />
              <button type="button" className={s.btnPrimary} style={{ marginTop: '0.75rem', width: '100%', minHeight: 42 }} onClick={addNote}>+ Append CRM Note</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
