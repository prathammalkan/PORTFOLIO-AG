'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Admin/ToastProvider';
import s from '../../admin.module.css';

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
  };
  return (
    <div className={s.tagInput}>
      {tags.map(t => (
        <span key={t} className={s.tag}>
          {t}
          <span className={s.tagRemove} onClick={() => onChange(tags.filter(x => x !== t))}>×</span>
        </span>
      ))}
      <input
        className={s.tagInputField}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder="Type and press Enter…"
      />
    </div>
  );
}

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewProject() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', category: 'Web Development', status: 'draft', featured: false,
    featured_image: '', thumbnail: '',
    description: '', client_name: '', client_industry: '', project_date: '', project_duration: '',
    technologies: ['Next.js', 'PostgreSQL'], skills: ['Architecture'], tools: ['Vercel'],
    results: '', challenges: '', process: '', case_study: '',
    live_url: '', repo_url: '', drive_url: '',
    meta_title: '', meta_description: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (targetStatus = form.status) => {
    if (!form.name.trim()) {
      toast.error('Project Name is required.');
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      status: targetStatus,
      slug: form.slug.trim() || generateSlug(form.name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'insert', table: 'projects', data: payload })
    });

    if (res.ok) {
      toast.success(`Project ${targetStatus === 'published' ? 'published' : 'saved as draft'}!`);
      router.push('/admin/projects');
    } else {
      const err = await res.json();
      toast.error('Save failed: ' + (err.error || 'Server rejected mutation'));
      setSaving(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Create New Enterprise Case Study</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className={s.btnSecondary} onClick={() => save('draft')} disabled={saving}>Save Draft</button>
          <button type="button" className={s.btnPrimary} onClick={() => save('published')} disabled={saving}>
            {saving ? 'Publishing…' : 'Publish Project'}
          </button>
        </div>
      </div>

      <div className={s.form}>
        {/* Basic Info */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Case Study Branding & Categorization</div>
          <div className={s.fieldGroup}>
            <div className={s.field}>
              <label className={s.label}>Project Title *</label>
              <input className={s.input} value={form.name} onChange={e => { set('name', e.target.value); if (!form.slug) set('slug', generateSlug(e.target.value)); }} placeholder="e.g. Veloura Luxury E-Commerce" />
            </div>
            <div className={s.field}>
              <label className={s.label}>URL Slug *</label>
              <input className={s.input} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="veloura-luxury-ecommerce" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Domain Category</label>
              <select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>
                {['Web Development', 'Mobile App Ecosystem', 'Cinematography & Video', 'Brand Identity & Design', 'Full-Stack Architecture'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Featured Hero Image URL</label>
              <input className={s.input} value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder="https://cdn/hero.webp" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Card Thumbnail URL</label>
              <input className={s.input} value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://cdn/thumb.webp" />
            </div>
            <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              <label htmlFor="featured" className={s.label} style={{ cursor: 'pointer', marginBottom: 0, color: 'hsl(45,95%,60%)' }}>⭐ Feature on Homepage Hero Carousel</label>
            </div>
          </div>
        </div>

        {/* Description & Client */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Client Scope & Timeline</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Project Overview & Problem Statement</label>
              <textarea className={s.textarea} style={{ minHeight: 120 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detail the business crisis, scale requirements, and your leadership role…" />
            </div>
            <div className={s.field}><label className={s.label}>Client / Company Name</label><input className={s.input} value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="e.g. Acme Corp" /></div>
            <div className={s.field}><label className={s.label}>Client Industry</label><input className={s.input} value={form.client_industry} onChange={e => set('client_industry', e.target.value)} placeholder="e.g. Fintech / Jewellery" /></div>
            <div className={s.field}><label className={s.label}>Project Launch Date</label><input type="date" className={s.input} value={form.project_date} onChange={e => set('project_date', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Engagement Duration</label><input className={s.input} value={form.project_duration} onChange={e => set('project_duration', e.target.value)} placeholder="e.g. 8 weeks sprint" /></div>
          </div>
        </div>

        {/* Technical */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Engineering & Tech Stack Matrix</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Core Frameworks & Tech</label><TagInput tags={form.technologies} onChange={v => set('technologies', v)} /></div>
            <div className={s.field}><label className={s.label}>Architectural Skills Applied</label><TagInput tags={form.skills} onChange={v => set('skills', v)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>DevOps & Deployment Tools</label><TagInput tags={form.tools} onChange={v => set('tools', v)} /></div>
          </div>
        </div>

        {/* Results */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Measurable Commercial Impact</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Key Results & Metrics</label><textarea className={s.textarea} value={form.results} onChange={e => set('results', e.target.value)} placeholder="e.g. 45% conversion uplift, sub-100ms LCP" /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Architectural Challenges Overcome</label><textarea className={s.textarea} value={form.challenges} onChange={e => set('challenges', e.target.value)} placeholder="Detail concurrency bottlenecks, state synchronization, or RLS rules…" /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>System Workflow & Process Teardown</label><textarea className={s.textarea} value={form.process} onChange={e => set('process', e.target.value)} placeholder="Explain your design decisions and tradeoffs…" /></div>
          </div>
        </div>

        {/* Links */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Artifact & Live Deployment URLs</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Production Live URL</label><input className={s.input} value={form.live_url} onChange={e => set('live_url', e.target.value)} placeholder="https://domain.com" /></div>
            <div className={s.field}><label className={s.label}>Git Repository URL</label><input className={s.input} value={form.repo_url} onChange={e => set('repo_url', e.target.value)} placeholder="https://github.com/..." /></div>
            <div className={s.field}><label className={s.label}>Case Study Assets (Google Drive)</label><input className={s.input} value={form.drive_url} onChange={e => set('drive_url', e.target.value)} placeholder="https://drive.google.com/..." /></div>
          </div>
        </div>

        {/* SEO */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Search Engine Optimization (SEO)</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>SEO Title Tag</label><input className={s.input} value={form.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder="Project Name — Pratham Malkan Architecture" /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Meta Description ({form.meta_description.length}/160)</label><textarea className={s.textarea} style={{ minHeight: 70 }} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} maxLength={160} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
