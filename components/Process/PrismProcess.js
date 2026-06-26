'use client';
import { useEffect, useRef } from 'react';
import styles from './PrismProcess.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: 'PHASE 01', title: 'ARCHITECTURE & PROTOTYPING', desc: 'Laying the foundation. We map out the database schema, system design, and high-fidelity wireframes.', detail: 'System Design, Figma Prototypes, Tech Stack Selection', color: 'var(--code-primary)' },
  { num: 'PHASE 02', title: 'THE CORE ENGINEERING LOOP', desc: 'Building the engine. Writing the business logic, setting up authentication, and connecting the backend.', detail: 'Database Models, API Routes, State Management', color: 'var(--cinema-primary)' },
  { num: 'PHASE 03', title: 'POLISH, MOTION & DEPLOYMENT', desc: 'The final 10%. We add micro-interactions, optimize performance, and deploy to production.', detail: 'GSAP Animations, CI/CD Pipelines, Performance Audit', color: 'var(--canvas-primary)' },
];

export default function PrismProcess() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([`.${styles.title}`, `.${styles.step}`, `.${styles.beamFill}`], { opacity: 1, y: 0, x: 0, scaleX: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.title}`, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
      });
      gsap.fromTo(`.${styles.step}`, { opacity: 0, x: -40 }, {
        opacity: 1, x: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.stepsGrid}`, start: 'top 80%' }
      });
      gsap.fromTo(`.${styles.beamFill}`, { scaleX: 0 }, {
        scaleX: 1, duration: 2, ease: 'power2.out',
        scrollTrigger: { trigger: `.${styles.beam}`, start: 'top 85%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="process">
      <h2 className={styles.title}>How I Work</h2>
      <p className={styles.subtitle}>A clear process from first conversation to final delivery</p>

      <div className={styles.beam}>
        <div className={styles.beamFill} />
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((s, i) => (
          <div key={i} className={styles.step}>
            <div className={styles.stepDot} style={{ background: s.color, boxShadow: `0 0 15px ${s.color}` }} />
            <span className={styles.stepNum} style={{ color: s.color }}>{s.num}</span>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <p className={styles.stepDesc}>{s.desc}</p>
            <p className={styles.stepDetail}>{s.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
