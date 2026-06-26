'use client';
import { useState, useEffect, useRef } from 'react';
import s from '@/app/admin/admin.module.css';

export function WritingEditor({ content, onChange, onUploadImage, autosaveTime }) {
  const [tab, setTab] = useState('write'); // 'write' | 'preview' | 'split'
  const [revisions, setRevisions] = useState([]);
  const [showRev, setShowRev] = useState(false);
  const textareaRef = useRef(null);

  // Word count & read time
  const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

  // Autosave snapshot to local revision history
  useEffect(() => {
    if (!content || content.length < 50) return;
    const timer = setTimeout(() => {
      setRevisions(prev => [
        { time: new Date().toLocaleTimeString(), text: content },
        ...prev.slice(0, 4)
      ]);
    }, 15000);
    return () => clearTimeout(timer);
  }, [content]);

  const insertSyntax = (before, after = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = content.substring(start, end);
    const updated = content.substring(0, start) + before + sel + after + content.substring(end);
    onChange(updated, readTime);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    const url = await onUploadImage(file);
    if (url) {
      insertSyntax(`\n![${file.name}](${url})\n`);
    }
  };

  const renderMarkdownPreview = (text) => {
    if (!text) return <p style={{ color: 'hsl(0,0%,40%)' }}>Nothing to preview…</p>;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) return <h1 key={idx} style={{ fontSize: '1.6rem', color: 'white', margin: '1rem 0 0.5rem' }}>{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={idx} style={{ fontSize: '1.3rem', color: 'hsl(0,0%,92%)', margin: '1rem 0 0.4rem' }}>{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={idx} style={{ fontSize: '1.1rem', color: 'hsl(0,0%,85%)', margin: '0.8rem 0 0.3rem' }}>{line.slice(4)}</h3>;
      if (line.startsWith('```')) return <pre key={idx} style={{ background: 'hsl(240,10%,12%)', padding: '0.75rem', borderRadius: 8, overflowX: 'auto', color: 'hsl(210,100%,75%)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{line}</pre>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} style={{ marginLeft: '1.5rem', color: 'hsl(0,0%,80%)', marginBottom: '0.25rem' }}>{line.slice(2)}</li>;
      if (line.match(/^!\[.*\]\(.*\)$/)) {
        const m = line.match(/^!\[(.*)\]\((.*)\)$/);
        return <img key={idx} src={m[2]} alt={m[1]} style={{ maxWidth: '100%', borderRadius: 8, margin: '1rem 0', display: 'block' }} />;
      }
      if (!line.trim()) return <div key={idx} style={{ height: '0.5rem' }} />;
      return <p key={idx} style={{ color: 'hsl(0,0%,80%)', margin: '0 0 0.75rem', lineHeight: 1.6 }}>{line}</p>;
    });
  };

  return (
    <div className={s.panel} style={{ padding: 0, overflow: 'hidden' }}>
      {/* Editor Toolbar */}
      <div style={{
        padding: '0.75rem 1.25rem', background: 'hsl(240,8%,10%)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button type="button" className={s.btnSecondary} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => insertSyntax('**', '**')} title="Bold"><b>B</b></button>
          <button type="button" className={s.btnSecondary} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => insertSyntax('*', '*')} title="Italic"><i>I</i></button>
          <button type="button" className={s.btnSecondary} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => insertSyntax('### ')} title="Heading 3">H3</button>
          <button type="button" className={s.btnSecondary} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => insertSyntax('```javascript\n', '\n```')} title="Code Block">&lt;/&gt;</button>
          <button type="button" className={s.btnSecondary} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => insertSyntax('- ')} title="Bullet List">• List</button>
          <label className={s.btnSecondary} style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
            <span>🖼️ Img</span>
            <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'hsl(0,0%,50%)' }}>
            {words} words · {readTime} {autosaveTime ? `· ☁ Autosaved ${autosaveTime}` : ''}
          </span>
          {revisions.length > 0 && (
            <button type="button" className={s.filterTab} style={{ fontSize: '0.72rem' }} onClick={() => setShowRev(!showRev)}>
              🕒 Revisions ({revisions.length})
            </button>
          )}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 2 }}>
            {['write', 'preview', 'split'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  padding: '0.25rem 0.6rem', fontSize: '0.72rem', border: 'none', borderRadius: 4, cursor: 'pointer',
                  background: tab === t ? 'hsl(210,100%,60%)' : 'transparent', color: tab === t ? 'white' : 'hsl(0,0%,60%)',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revision Drawer */}
      {showRev && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(45,95%,60%)', marginBottom: '0.5rem' }}>Recent Snapshot History (Session Only):</div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {revisions.map((rev, rIdx) => (
              <button key={rIdx} type="button" className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => { onChange(rev.text, readTime); setShowRev(false); }}>
                Restore {rev.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Split/Write/Preview Pane */}
      <div style={{ display: 'grid', gridTemplateColumns: tab === 'split' ? '1fr 1fr' : '1fr', minHeight: 450 }}>
        {tab !== 'preview' && (
          <textarea
            ref={textareaRef}
            className={s.textarea}
            style={{
              width: '100%', height: '100%', minHeight: 450, border: 'none', borderRadius: 0,
              padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: 1.6,
              resize: 'vertical', borderRight: tab === 'split' ? '1px solid rgba(255,255,255,0.06)' : 'none'
            }}
            value={content}
            onChange={e => onChange(e.target.value, `${Math.max(1, Math.ceil(e.target.value.trim().split(/\s+/).filter(Boolean).length / 200))} min read`)}
            placeholder="# Write your enterprise engineering strategy or teardown here…"
          />
        )}

        {tab !== 'write' && (
          <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 600, background: 'hsl(240,10%,6%)' }}>
            {renderMarkdownPreview(content)}
          </div>
        )}
      </div>
    </div>
  );
}
