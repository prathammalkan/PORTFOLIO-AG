'use client';
import { useEffect, useRef } from 'react';
import styles from './WorldCode.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    name: 'NISFLOW', tier: 'hero',
    tagline: 'AI-Powered Life Operating System',
    highlight: '14+ integrated modules · In Development',
    desc: 'Architected a central life OS with 14 connected modules, utilizing Gemini AI for zero-latency cross-module context analysis.',
    tags: ['Kotlin', 'Firebase', 'Gemini AI', 'Android'],
    roles: ['Founder', 'Product Architect', 'UX Designer', 'Mobile Developer'],
    status: 'in-development',
    caseStudy: '/work/nisflow',
    repo: 'https://github.com/prathammalkan/NISFLOW-V2',
  },
  {
    name: 'VELOURA', tier: 'large',
    tagline: 'Luxury Jewellery E-Commerce',
    highlight: 'Full-stack with admin dashboard · In Production',
    desc: 'Engineered a headless e-commerce architecture leading to a 45% increase in conversion and sub-1s load times via Next.js and Supabase.',
    tags: ['Next.js', 'Supabase', 'Vercel'],
    status: 'in-production',
    caseStudy: '/work/veloura',
    live: 'https://veloura-orpin-chi.vercel.app/',
    repo: 'https://github.com/prathammalkan/VELOURA',
  },
  {
    name: 'GAMEZONE', tier: 'medium',
    tagline: 'Gaming Center Management',
    desc: 'Complete gaming center ecosystem with device booking, café ordering, rewards, and leaderboards.',
    tags: ['Full Stack', 'Booking System'],
    live: 'https://gamezone-bay-theta.vercel.app/',
  },
  {
    name: 'LOSTLINK', tier: 'medium',
    tagline: 'Digital Lost & Found',
    desc: 'A digital lost-and-found ecosystem with item reporting, search, and real-time user communication.',
    tags: ['Full Stack', 'Real-time'],
    live: 'https://lostlinkproject.vercel.app/',
  },
  {
    name: 'MOBSTORE', tier: 'compact',
    tagline: 'Mobile Commerce Platform',
    desc: 'Mobile commerce ecosystem focused on sales, warranty management, and after-sales support.',
    tags: ['E-Commerce', 'Full Stack'],
    live: 'https://mob-store-seven.vercel.app/',
  },
];

export default function WorldCode() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([`.${styles.heroTitle}`, `.${styles.stat}`, `.${styles.card}`], { opacity: 1, y: 0, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.heroTitle}`, { opacity: 0, y: 50, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.fromTo(`.${styles.stat}`, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.6,
        scrollTrigger: { trigger: `.${styles.statsRow}`, start: 'top 85%' }
      });
      gsap.fromTo(`.${styles.card}`, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.projectGrid}`, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="world-code">
      <div className={styles.gridOverlay} />

      <div className={styles.worldHero}>
        <h2 className={styles.heroTitle}>{'{ CODE }'}</h2>
        <p className={styles.heroSubtitle}>Building products that solve real problems</p>
      </div>

      <div className={styles.statsRow}>
        {['5 Products', '3 Live', '2 Platforms', '10+ Technologies'].map((s, i) => (
          <div key={i} className={styles.stat}>
            <span className={styles.statValue}>{s.split(' ')[0]}</span>
            <span className={styles.statLabel}>{s.split(' ').slice(1).join(' ')}</span>
          </div>
        ))}
      </div>

      <div className={styles.projectGrid}>
        {projects.map((p) => (
          <div
            key={p.name}
            className={`${styles.card} ${styles[`tier_${p.tier}`]}`}
          >
            {p.highlight && <span className={styles.cardHighlight}>{p.highlight}</span>}
            {p.status && (
              <span className={`${styles.statusBadge} ${styles[`status_${p.status.replace('-', '_')}`]}`}>
                {p.status === 'in-development' ? '🚧 In Development' : '🟢 In Production'}
              </span>
            )}
            <h3 className={styles.cardName}>{p.name}</h3>
            <p className={styles.cardTagline}>{p.tagline}</p>
            <p className={styles.cardDesc}>{p.desc}</p>
            <div className={styles.cardTags}>
              {p.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
            <div className={styles.cardActions}>
              {p.caseStudy && (
                <a href={p.caseStudy} className={styles.cardCta} style={{ background: 'var(--light-primary)', color: 'var(--void-black)' }}>
                  Read Case Study →
                </a>
              )}
              {p.live && !p.caseStudy && (
                <a href={p.live} target="_blank" rel="noopener noreferrer" className={styles.cardCta}>
                  View Live ↗
                </a>
              )}
              {p.repo && (
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className={styles.cardLive}>
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.worldCta}>
        <a href="#contact" className={styles.worldCtaLink}>
          Need a product built? <strong>Let&apos;s talk →</strong>
        </a>
      </div>
    </section>
  );
}
