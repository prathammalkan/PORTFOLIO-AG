'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './WorldSelector.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const worlds = [
  {
    id: 'code', label: 'CODE', subtitle: 'Web & App Development',
    stat: '5 Products Built', color: 'var(--code-primary)',
    desc: 'Full-stack products from concept to deployment',
  },
  {
    id: 'cinema', label: 'CINEMA', subtitle: 'Video Editing',
    stat: '2 Clients Served', color: 'var(--cinema-primary)',
    desc: 'Cinematic storytelling through motion and editing',
  },
  {
    id: 'canvas', label: 'CANVAS', subtitle: 'Graphic Design',
    stat: '2+ Years of Craft', color: 'var(--canvas-primary)',
    desc: 'Visual identity, branding, and creative design',
  },
  {
    id: 'about', label: 'ABOUT', subtitle: 'The Person',
    stat: 'My Story', color: 'var(--about-primary)',
    desc: 'The mind behind the multidisciplinary work',
  },
];

export default function WorldSelector() {
  const [active, setActive] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.sectionTitle}`, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      });
      gsap.fromTo(`.${styles.panel}`, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.12,
        scrollTrigger: { trigger: `.${styles.panels}`, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleClick = (id) => {
    const el = document.getElementById(`world-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className={styles.section} id="worlds">
      <p className={styles.sectionTitle}>Explore My Worlds</p>

      <div className={styles.panels}>
        {worlds.map((w, i) => (
          <div
            key={w.id}
            className={`${styles.panel} ${styles[w.id]} ${active === i ? styles.panelActive : ''}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => handleClick(w.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(w.id)}
          >
            <div className={styles.panelBg} />
            <div className={styles.panelNumber}>0{i + 1}</div>
            <div className={styles.panelContent}>
              <h3 className={styles.worldTitle}>{w.label}</h3>
              <p className={styles.worldSubtitle}>{w.subtitle}</p>
              <p className={styles.worldDesc}>{w.desc}</p>
              <div className={styles.worldStat}>{w.stat}</div>
              <span className={styles.enterLink}>Enter World →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
