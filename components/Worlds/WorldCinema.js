'use client';
import { useEffect, useRef } from 'react';
import styles from './WorldCinema.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const clients = [
  {
    name: 'Burger Villa', industry: 'Food & Beverage', role: 'Video Editor',
    duration: '2–3 Months',
    work: ['Promotional Reels', 'Motion Graphics', 'Instagram Content', 'Food Marketing Videos'],
    challenge: 'Needed engaging social content to drive footfall and build brand presence on Instagram.',
    solution: 'Created high-energy promotional reels with dynamic motion graphics and appetizing visual storytelling.',
    result: 'Increased social media engagement and brand visibility across platforms.',
    driveLink: 'https://drive.google.com/drive/folders/1YapyohfakubXb8d3Zd0tbSCrk4UxzSD5',
  },
  {
    name: 'Sneh Khatri', industry: 'Personal Branding', role: 'Video Editor',
    duration: 'Ongoing',
    work: ['Personal Brand Videos', 'Instagram Reels', 'Motion Graphics', 'Social Content'],
    challenge: 'Needed professional video content to establish a strong personal brand on social media.',
    solution: 'Produced polished reels and brand videos with consistent visual identity and compelling pacing.',
    result: 'Strengthened personal brand presence with professional-quality content.',
    driveLink: 'https://drive.google.com/drive/folders/1KjLrDxBCRHU8u9NwsYgZV0buF3G5YHJe',
  },
];

const skills = ['After Effects', 'Motion Graphics', 'Color Grading', 'Pacing & Rhythm', 'Sound Design', 'Storytelling'];

export default function WorldCinema() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.heroTitle}`, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.fromTo(`.${styles.clientCard}`, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, stagger: 0.2, duration: 0.9,
        scrollTrigger: { trigger: `.${styles.clientsGrid}`, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="world-cinema">
      <div className={styles.letterboxTop} />
      <div className={styles.filmGrain} />

      <div className={styles.worldHero}>
        <h2 className={styles.heroTitle}>CINEMA</h2>
        <p className={styles.heroSubtitle}>Where stories come alive through motion</p>
      </div>

      <div className={styles.clientsGrid}>
        {clients.map((c) => (
          <div key={c.name} className={styles.clientCard}>
            <div className={styles.clientHeader}>
              <h3 className={styles.clientName}>{c.name}</h3>
              <span className={styles.clientIndustry}>{c.industry}</span>
            </div>
            <div className={styles.clientMeta}>
              <span>Role: {c.role}</span>
              <span>Duration: {c.duration}</span>
            </div>

            <div className={styles.videoPlaceholder}>
              <div className={styles.playIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <a href={c.driveLink} target="_blank" rel="noopener noreferrer" className={styles.viewWork}>
                View Work on Drive ↗
              </a>
            </div>

            <div className={styles.workTags}>
              {c.work.map(w => <span key={w} className={styles.workTag}>{w}</span>)}
            </div>

            <div className={styles.csrGrid}>
              <div className={styles.csrItem}>
                <span className={styles.csrLabel}>Challenge</span>
                <p>{c.challenge}</p>
              </div>
              <div className={styles.csrItem}>
                <span className={styles.csrLabel}>Solution</span>
                <p>{c.solution}</p>
              </div>
              <div className={styles.csrItem}>
                <span className={styles.csrLabel}>Result</span>
                <p>{c.result}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.skillsSection}>
        <h3 className={styles.skillsTitle}>Expertise</h3>
        <div className={styles.skillsList}>
          {skills.map(s => <span key={s} className={styles.skillPill}>{s}</span>)}
        </div>
      </div>

      <div className={styles.worldCta}>
        <a href="#contact" className={styles.worldCtaLink}>
          Need video content? <strong>Let&apos;s create →</strong>
        </a>
      </div>

      <div className={styles.letterboxBottom} />
    </section>
  );
}
