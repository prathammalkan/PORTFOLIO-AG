'use client';
import { useState, useEffect } from 'react';
import styles from './Navigation.module.css';

const navItems = [
  { id: 'hero', label: 'Home', color: 'var(--light-primary)' },
  { id: 'trust', label: 'Services', color: 'var(--light-secondary)' },
  { id: 'worlds', label: 'Worlds', color: 'var(--light-secondary)' },
  { id: 'world-code', label: 'Code', color: 'var(--code-primary)' },
  { id: 'world-cinema', label: 'Cinema', color: 'var(--cinema-primary)' },
  { id: 'world-canvas', label: 'Canvas', color: 'var(--canvas-primary)' },
  { id: 'world-about', label: 'About', color: 'var(--about-primary)' },
  { id: 'process', label: 'Process', color: 'var(--light-secondary)' },
  { id: 'contact', label: 'Contact', color: 'var(--light-primary)' },
];

export default function Navigation({ show }) {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
      const sections = navItems.map(n => document.getElementById(n.id)).filter(Boolean);
      let current = 'hero';
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) current = sec.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <>
      {/* Sticky Header */}
      <header className={`${styles.header} ${scrolled ? styles.headerVisible : ''}`}>
        <button className={styles.logo} onClick={() => scrollTo('hero')}>PM</button>
        <button className={styles.headerCta} onClick={() => scrollTo('contact')}>Get in Touch</button>
      </header>

      {/* Desktop Spectrum Bar */}
      <nav className={styles.spectrumBar} aria-label="Section navigation">
        {navItems.map((n) => (
          <button
            key={n.id}
            className={`${styles.dot} ${active === n.id ? styles.dotActive : ''}`}
            style={{ '--dot-color': n.color }}
            onClick={() => scrollTo(n.id)}
            aria-label={n.label}
            title={n.label}
          >
            <span className={styles.dotLabel}>{n.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        {[
          { id: 'hero', label: '⬡', title: 'Home' },
          { id: 'world-code', label: '⟨/⟩', title: 'Code' },
          { id: 'world-cinema', label: '▶', title: 'Cinema' },
          { id: 'world-canvas', label: '◆', title: 'Canvas' },
          { id: 'world-about', label: '●', title: 'About' },
          { id: 'contact', label: '✉', title: 'Contact' },
        ].map((n) => (
          <button
            key={n.id}
            className={`${styles.mobileItem} ${active === n.id ? styles.mobileItemActive : ''}`}
            onClick={() => scrollTo(n.id)}
            aria-label={n.title}
          >
            <span className={styles.mobileIcon}>{n.label}</span>
            <span className={styles.mobileLabel}>{n.title}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
