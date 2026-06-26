'use client';
import { useEffect, useRef } from 'react';
import styles from './WorldCanvas.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const tools = [
  { name: 'Figma', category: 'Interface Systems' },
  { name: 'Adobe Photoshop', category: 'Retouching & Raster' },
  { name: 'Adobe Illustrator', category: 'Vector & Brand' },
  { name: 'After Effects', category: 'Motion Design' },
  { name: 'Blender', category: '3D & Spatial' },
];

const services = [
  'Logo Design',
  'Brand Identity',
  'Social Media Creatives',
  'Poster Design',
  'Print Materials',
  'Business Cards',
  'Brand Guidelines',
  'Product Packaging',
];

export default function WorldCanvas() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.heroTitle}`, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.fromTo(`.${styles.serviceItem}`, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, stagger: 0.06, duration: 0.5,
        scrollTrigger: { trigger: `.${styles.servicesGrid}`, start: 'top 80%' }
      });
      gsap.fromTo(`.${styles.toolCard}`, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, stagger: 0.08, duration: 0.6,
        scrollTrigger: { trigger: `.${styles.toolsGrid}`, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="world-canvas">
      <div className={styles.worldHero}>
        <h2 className={styles.heroTitle}>CANVAS</h2>
        <p className={styles.heroSubtitle}>Brand systems and visual design built with precision</p>
        <p className={styles.experience}>~2 Years of Professional Design Experience</p>
      </div>

      <div className={styles.servicesSection}>
        <h3 className={styles.sectionTitle}>Design Services</h3>
        <div className={styles.servicesGrid}>
          {services.map(s => (
            <div key={s} className={styles.serviceItem}>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.toolsSection}>
        <h3 className={styles.toolsTitle}>Design Stack</h3>
        <div className={styles.toolsGrid}>
          {tools.map(t => (
            <div key={t.name} className={styles.toolCard}>
              <span className={styles.toolName}>{t.name}</span>
              <span className={styles.toolCategory}>{t.category}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.worldCta}>
        <a href="#contact" className={styles.worldCtaLink}>
          Need design work? <strong>Let&apos;s design →</strong>
        </a>
      </div>
    </section>
  );
}
