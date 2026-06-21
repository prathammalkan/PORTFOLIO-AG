'use client';
import { useState } from 'react';
import styles from './ContactForm.module.css';

const services = ['Web Development', 'App Development', 'Video Editing', 'Graphic Design', 'Multiple Services', 'Other'];

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', service: '', budget: '', message: '', _honey: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  return (
    <section className={styles.section} id="contact">
      <div className={styles.convergence}>
        <div className={styles.beam1} />
        <div className={styles.beam2} />
        <div className={styles.beam3} />
        <div className={styles.beam4} />
      </div>

      <h2 className={styles.title}>Let&apos;s Create Something Extraordinary</h2>
      <p className={styles.subtitle}>
        Whether you need a product built, a brand designed, a video produced, or all of the above — I&apos;m ready.
      </p>

      {status === 'sent' ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h3>Message Sent!</h3>
          <p>Thank you for reaching out. I&apos;ll get back to you within 24 hours.</p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={submit}>
          {/* Honeypot — hidden from users, catches bots */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }} aria-hidden="true">
            <input type="text" name="_honey" value={form._honey} onChange={handle} tabIndex={-1} autoComplete="off" />
          </div>

          <div className={styles.row} suppressHydrationWarning>
            <div className={styles.field} suppressHydrationWarning>
              <label className={styles.label} htmlFor="name">Name</label>
              <input className={styles.input} type="text" id="name" name="name" value={form.name} onChange={handle} required placeholder="Your name" suppressHydrationWarning />
            </div>
            <div className={styles.field} suppressHydrationWarning>
              <label className={styles.label} htmlFor="email">Email</label>
              <input className={styles.input} type="email" id="email" name="email" value={form.email} onChange={handle} required placeholder="your@email.com" suppressHydrationWarning />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="service">Service Interest</label>
              <select className={styles.select} id="service" name="service" value={form.service} onChange={handle} required>
                <option value="">Select a service</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="budget">Budget Range</label>
              <select className={styles.select} id="budget" name="budget" value={form.budget} onChange={handle}>
                <option value="">Select range</option>
                <option value="<25k">&lt; ₹25K</option>
                <option value="25k-50k">₹25K – 50K</option>
                <option value="50k-1l">₹50K – 1L</option>
                <option value="1l-3l">₹1L – 3L</option>
                <option value="3l+">₹3L+</option>
                <option value="discuss">Let&apos;s Discuss</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="message">Project Details</label>
            <textarea className={styles.textarea} id="message" name="message" value={form.message} onChange={handle} required rows="5" placeholder="Tell me about your project..." />
          </div>

          {status === 'error' && (
            <p className={styles.errorMsg}>{errorMsg}</p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={status === 'sending'}>
            <span>{status === 'sending' ? 'Sending...' : 'Send Your Vision'}</span>
            {status !== 'sending' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            )}
          </button>
        </form>
      )}

      <div className={styles.altContact}>
        <div className={styles.emailBlock}>
          <span className={styles.emailLabel}>Or email directly</span>
          <a href="mailto:malkanpratham@gmail.com" className={styles.emailLink}>malkanpratham@gmail.com</a>
        </div>
        <div className={styles.socialRow}>
          {[
            { n: 'GitHub', u: 'https://github.com/prathammalkan' },
            { n: 'LinkedIn', u: 'https://www.linkedin.com/in/pratham-malkan-aa2388376' },
            { n: 'Instagram', u: 'https://www.instagram.com/pratham.malkan' },
            { n: 'X', u: 'https://x.com/PrathamM1310' },
            { n: 'YouTube', u: 'https://youtube.com/@imm0rtal7-p' },
          ].map(s => (
            <a key={s.n} href={s.u} target="_blank" rel="noopener noreferrer" className={styles.socialItem}>{s.n}</a>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 Pratham Malkan. Crafted with passion.</p>
      </footer>
    </section>
  );
}
