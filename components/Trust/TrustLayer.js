'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './TrustLayer.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const metrics = [
  { value: 12, suffix: '+', label: 'Products Launched' },
  { value: 3, suffix: '', label: 'Industries Scaled' },
  { value: 4, prefix: '< ', suffix: ' Weeks', label: 'To Production MVP' },
  { value: 100, suffix: '%', label: 'Client Success Rate' },
];

const services = [
  {
    world: 'code', id: 'world-code',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: 'Web & App Development',
    desc: 'Custom websites, web applications, and mobile apps built for performance and scale.',
  },
  {
    world: 'cinema', id: 'world-cinema',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
    title: 'Video Editing & Motion',
    desc: 'Commercial videos, social media content, motion graphics, and promotional reels.',
  },
  {
    world: 'canvas', id: 'world-canvas',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
      </svg>
    ),
    title: 'Graphic Design & Branding',
    desc: 'Logo design, brand identity, social media creatives, print materials, and visual systems.',
  },
  {
    world: 'about', id: 'world-about',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    title: 'Product Strategy',
    desc: 'End-to-end product thinking — from concept and user research through design to launch.',
  },
];

const industries = ['Food & Beverage', 'Personal Branding', 'E-Commerce', 'Gaming', 'Technology', 'Luxury Retail'];

function AnimatedCounter({ value, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(value);
      return;
    }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const start = performance.now();
        const duration = 1500;
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export default function TrustLayer() {
  const sectionRef = useRef(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([`.${styles.metricItem}`, `.${styles.serviceCard}`], { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.metricItem}`, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.metricsRow}`, start: 'top 80%' }
      });
      gsap.fromTo(`.${styles.serviceCard}`, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.servicesRow}`, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="trust">
      <div className={styles.topLine} />

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>PROVEN OUTCOMES</h2>
        <p className={styles.sectionSubtitle}>The numbers behind the builds.</p>
      </div>

      <div className={styles.metricsRow}>
        {metrics.map((m, i) => (
          <div key={i} className={styles.metricItem}>
            <div className={styles.metricValue}>
              <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <div className={styles.metricLabel}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.logoCloudSection}>
        <p className={styles.logoCloudTitle}>TRUSTED BY FORWARD-THINKING BRANDS</p>
        <div className={styles.logoCloud}>
          <span className={styles.textLogo}>Burger Villa</span>
          <span className={styles.textLogo}>Sneh Khatri</span>
          <span className={styles.textLogo}>GameZone</span>
          <span className={styles.textLogo}>Veloura</span>
        </div>
      </div>

      <div className={styles.servicesRow}>
        {services.map((s, i) => (
          <button
            key={i}
            className={`${styles.serviceCard} ${styles[s.world]}`}
            onClick={() => scrollTo(s.id)}
            aria-label={`Go to ${s.title} section`}
          >
            <div className={styles.serviceIcon}>{s.icon}</div>
            <h3 className={styles.serviceTitle}>{s.title}</h3>
            <p className={styles.serviceDesc}>{s.desc}</p>
            <span className={styles.serviceLink}>Learn More →</span>
          </button>
        ))}
      </div>

      <div className={styles.industriesRow}>
        {industries.map((ind, i) => (
          <span key={i} className={styles.industryTag}>{ind}</span>
        ))}
      </div>
    </section>
  );
}
