'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import s from '../../admin.module.css';

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const add = (e) => { if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); if (!tags.includes(input.trim())) onChange([...tags, input.trim()]); setInput(''); } };
  return (
    <div className={s.tagInput}>
      {tags.map(t => <span key={t} className={s.tag}>{t}<span className={s.tagRemove} onClick={() => onChange(tags.filter(x => x !== t))}>×</span></span>)}
      <input className={s.tagInputField} value={input} onChange={e => setInput(e.target.value)} onKeyDown={add} placeholder="Type and press Enter…" />
    </div>
  );
}

function generateSlug(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

export default function NewProject() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '', slug: '', category: 'Web Development', status: 'draft', featured: false,
    featured_image: '', thumbnail: '',
    description: '', client_name: '', client_industry: '', project_date: '', project_duration: '',
    technologies: [], skills: [], tools: [],
    results: '', challenges: '', process: '', case_study: '',
    live_url: '', repo_url: '', drive_url: '',
    meta_title: '', meta_description: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (status = form.status) => {
    if (!form.name) { setMsg('Project name is required.'); return; }
    setSaving(true);
    const { error } = await supabase.from('projects').insert({ ...form, status, slug: form.slug || generateSlug(form.name) });
    if (error) { setMsg('Error: ' + error.message); setSaving(false); return; }
    router.push('/admin/projects');
  };

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Create New Project</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={s.btnSecondary} onClick={() => save('draft')} disabled={saving}>Save Draft</button>
          <button className={s.btnPrimary} onClick={() => save('published')} disabled={saving}>Publish</button>
        </div>
      </div>

      {msg && <div className={msg.startsWith('Error') ? s.errorMsg : s.successMsg}>{msg}</div>}

      <div className={s.form}>
        {/* Basic Info */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Basic Information</div>
          <div className={s.fieldGroup}>
            <div className={s.field}>
              <label className={s.label}>Project Name *</label>
              <input className={s.input} value={form.name} onChange={e => { set('name', e.target.value); set('slug', generateSlug(e.target.value)); }} placeholder="My Awesome Project" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Slug (URL)</label>
              <input className={s.input} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="my-awesome-project" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Category</label>
              <select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>
                {['Web Development','App Development','Video Editing','Graphic Design','Mixed'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Featured Image URL</label>
              <input className={s.input} value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder="https://…" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Thumbnail URL</label>
              <input className={s.input} value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://…" />
            </div>
            <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              <label htmlFor="featured" className={s.label} style={{ cursor: 'pointer', marginBottom: 0 }}>⭐ Featured Project</label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Project Details</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Project Description</label>
              <textarea className={s.textarea} style={{ minHeight: 120 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what this project is, the goals, and your role…" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Client Name</label>
              <input className={s.input} value={form.client_name} onChange={e => set('client_name', e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Client Industry</label>
              <input className={s.input} value={form.client_industry} onChange={e => set('client_industry', e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Project Date</label>
              <input type="date" className={s.input} value={form.project_date} onChange={e => set('project_date', e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Duration</label>
              <input className={s.input} value={form.project_duration} onChange={e => set('project_duration', e.target.value)} placeholder="e.g. 3 months" />
            </div>
          </div>
        </div>

        {/* Technical */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Technical Stack</div>
          <div className={s.fieldGroup}>
            <div className={s.field}>
              <label className={s.label}>Technologies Used</label>
              <TagInput tags={form.technologies} onChange={v => set('technologies', v)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Skills Used</label>
              <TagInput tags={form.skills} onChange={v => set('skills', v)} />
            </div>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Tools Used</label>
              <TagInput tags={form.tools} onChange={v => set('tools', v)} />
            </div>
          </div>
        </div>

        {/* Results & Process */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Results & Process</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Results Achieved</label>
              <textarea className={s.textarea} value={form.results} onChange={e => set('results', e.target.value)} placeholder="What impact did this project have?" />
            </div>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Challenges</label>
              <textarea className={s.textarea} value={form.challenges} onChange={e => set('challenges', e.target.value)} placeholder="What were the key challenges and how did you solve them?" />
            </div>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Process Notes</label>
              <textarea className={s.textarea} value={form.process} onChange={e => set('process', e.target.value)} placeholder="Describe your approach and process…" />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Links</div>
          <div className={s.fieldGroup}>
            <div className={s.field}>
              <label className={s.label}>Live Demo URL</label>
              <input className={s.input} value={form.live_url} onChange={e => set('live_url', e.target.value)} placeholder="https://…" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Repository URL</label>
              <input className={s.input} value={form.repo_url} onChange={e => set('repo_url', e.target.value)} placeholder="https://github.com/…" />
            </div>
            <div className={s.field}>
              <label className={s.label}>Drive / Other Link</label>
              <input className={s.input} value={form.drive_url} onChange={e => set('drive_url', e.target.value)} placeholder="https://drive.google.com/…" />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>SEO Settings</div>
          <div className={s.fieldGroup}>
            <div className={s.field}>
              <label className={s.label}>Meta Title</label>
              <input className={s.input} value={form.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder="Project name | Pratham Malkan" />
            </div>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Meta Description <span style={{ color: form.meta_description.length > 160 ? '#f87171' : 'hsl(0,0%,40%)' }}>({form.meta_description.length}/160)</span></label>
              <textarea className={s.textarea} style={{ minHeight: 70 }} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} placeholder="Brief description for search engines…" maxLength={160} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
