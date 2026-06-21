'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

const STATUS_COLORS = { new: 'Blue', contacted: 'Gold', 'follow-up': 'Gold', proposal: 'Purple', converted: 'Green', closed: 'Gray' };

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeads(); }, [filter]);

  const loadLeads = async () => {
    setLoading(true);
    let q = supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('lead_status', filter);
    const { data } = await q;
    setLeads(data || []);
    setLoading(false);
  };

  const openLead = async (lead) => {
    setSelected(lead);
    if (!lead.read) {
      await supabase.from('contact_submissions').update({ read: true }).eq('id', lead.id);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, read: true } : l));
    }
    const { data } = await supabase.from('lead_notes').select('*').eq('lead_id', lead.id).order('created_at');
    setNotes(data || []);
  };

  const updateStatus = async (id, status) => {
    await supabase.from('contact_submissions').update({ lead_status: status }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, lead_status: status } : l));
    if (selected?.id === id) setSelected(prev => ({ ...prev, lead_status: status }));
  };

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    const { data } = await supabase.from('lead_notes').insert({ lead_id: selected.id, note: note.trim() }).select().single();
    setNotes(prev => [...prev, data]);
    setNote('');
  };

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead permanently?')) return;
    await supabase.from('contact_submissions').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Service', 'Budget', 'Message', 'Status', 'Date']];
    leads.forEach(l => rows.push([l.name, l.email, l.service, l.budget || '', l.message, l.lead_status || 'new', new Date(l.created_at).toLocaleDateString()]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  };

  const filtered = leads.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()));

  const counts = { all: leads.length, new: leads.filter(l => !l.lead_status || l.lead_status === 'new').length, contacted: leads.filter(l => l.lead_status === 'contacted').length, converted: leads.filter(l => l.lead_status === 'converted').length };

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Leads & CRM <span className={s.count}>({leads.length})</span></h2>
          <div className={s.statsRow} style={{ marginTop: '0.5rem' }}>
            <span className={s.statPill}>Total: <strong>{leads.length}</strong></span>
            <span className={s.statPill}>New: <strong style={{ color: '#3399ff' }}>{counts.new}</strong></span>
            <span className={s.statPill}>Converted: <strong style={{ color: '#33cc88' }}>{counts.converted}</strong></span>
          </div>
        </div>
        <button className={s.btnSecondary} onClick={exportCSV}>📥 Export CSV</button>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        {['all', 'new', 'contacted', 'follow-up', 'proposal', 'converted', 'closed'].map(f => (
          <button key={f} className={`${s.filterTab} ${filter === f ? s.filterTabActive : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={s.tableWrap}>
        {loading ? <p className={s.loadingRow}>Loading leads…</p> : filtered.length === 0 ? (
          <div className={s.empty}><div className={s.emptyIcon}>📭</div><div className={s.emptyTitle}>No leads found</div></div>
        ) : (
          <table className={s.table}>
            <thead><tr><th></th><th>Name</th><th>Email</th><th>Service</th><th>Budget</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} onClick={() => openLead(l)} style={{ cursor: 'pointer' }}>
                  <td><div style={{ width: 6, height: 6, borderRadius: '50%', background: l.read ? 'transparent' : '#3399ff', margin: '0 auto' }} /></td>
                  <td><div style={{ fontWeight: 600, color: 'hsl(0,0%,90%)', fontSize: '0.85rem' }}>{l.name}</div></td>
                  <td style={{ fontSize: '0.8rem', color: 'hsl(0,0%,60%)' }}>{l.email}</td>
                  <td style={{ fontSize: '0.8rem' }}>{l.service}</td>
                  <td style={{ fontSize: '0.8rem', color: 'hsl(0,0%,55%)' }}>{l.budget || '—'}</td>
                  <td>
                    <select className={s.badge} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, color: 'hsl(0,0%,75%)', fontSize: '0.72rem', padding: '0.15rem 0.5rem', cursor: 'pointer' }}
                      value={l.lead_status || 'new'}
                      onChange={e => { e.stopPropagation(); updateStatus(l.id, e.target.value); }}>
                      {['new', 'contacted', 'follow-up', 'proposal', 'converted', 'closed'].map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,50%)' }}>{new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <a href={`mailto:${l.email}?subject=Re: Portfolio Inquiry — ${l.service}`} className={s.btnSecondary} style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>Reply</a>
                      <button className={s.btnDanger} style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }} onClick={() => deleteLead(l.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide panel */}
      {selected && (
        <>
          <div className={s.slideOverlay} onClick={() => setSelected(null)} />
          <div className={s.slidePanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ color: 'hsl(0,0%,90%)', margin: 0 }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ color: 'hsl(0,0%,50%)', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['Email', selected.email], ['Service', selected.service], ['Budget', selected.budget || '—'], ['Date', new Date(selected.created_at).toLocaleString('en-IN')]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'hsl(0,0%,45%)', width: 60, flexShrink: 0, paddingTop: 2 }}>{k}</span>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(0,0%,85%)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '1rem', fontSize: '0.85rem', color: 'hsl(0,0%,75%)', lineHeight: 1.7 }}>
              {selected.message}
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'hsl(0,0%,45%)', display: 'block', marginBottom: '0.4rem' }}>STATUS</label>
              <select className={s.select} value={selected.lead_status || 'new'} onChange={e => updateStatus(selected.id, e.target.value)}>
                {['new', 'contacted', 'follow-up', 'proposal', 'converted', 'closed'].map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={`mailto:${selected.email}?subject=Re: Portfolio Inquiry — ${selected.service}`} className={s.btnPrimary}>✉ Reply</a>
              <button className={s.btnDanger} onClick={() => deleteLead(selected.id)}>Delete Lead</button>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,45%)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Private Notes</div>
              {notes.map(n => (
                <div key={n.id} className={s.noteBox}>
                  {n.note}
                  <div className={s.noteDate}>{new Date(n.created_at).toLocaleString('en-IN')}</div>
                </div>
              ))}
              <textarea className={s.textarea} style={{ minHeight: 70 }} placeholder="Add a private note…" value={note} onChange={e => setNote(e.target.value)} />
              <button className={s.btnPrimary} style={{ marginTop: '0.5rem', width: '100%' }} onClick={addNote}>Add Note</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
