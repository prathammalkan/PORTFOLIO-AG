'use client';
import { useEffect, useRef } from 'react';
import styles from './PrismHero.module.css';
import gsap from 'gsap';

const capabilities = [
  { label: 'Web Development', world: 'code' },
  { label: 'App Development', world: 'code' },
  { label: 'Video Editing', world: 'cinema' },
  { label: 'Graphic Design', world: 'canvas' },
  { label: 'Product Strategy', world: 'about' },
];

const quickStats = [
  { value: '2+', label: 'Years' },
  { value: '10+', label: 'Projects' },
  { value: '5+', label: 'Clients' },
  { value: '4', label: 'Disciplines' },
];

export default function PrismHero({ visible }) {
  const sectionRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline({ delay: 0.15 });

    // ── NAME REVEAL: Clip-path mask expanding from center ──
    // First name line
    tl.fromTo(firstNameRef.current,
      { clipPath: 'inset(0 50% 0 50%)', opacity: 0.7 },
      { clipPath: 'inset(0 0% 0 0%)', opacity: 1, duration: 1.1, ease: 'power4.out' }
    );

    // Last name line (slight delay, same effect)
    tl.fromTo(lastNameRef.current,
      { clipPath: 'inset(0 50% 0 50%)', opacity: 0.7 },
      { clipPath: 'inset(0 0% 0 0%)', opacity: 1, duration: 1.1, ease: 'power4.out' },
      '-=0.85'
    );

    // ── Accent line expands ──
    tl.fromTo(`.${styles.accentLine}`,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );

    // ── Title slides in ──
    tl.fromTo(`.${styles.title}`,
      { opacity: 0, y: 15, clipPath: 'inset(100% 0 0 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    );

    // ── Positioning statement ──
    tl.fromTo(`.${styles.statement}`,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.35'
    );

    // ── Capabilities badges ──
    tl.fromTo(`.${styles.capBadge}`,
      { opacity: 0, scale: 0.85, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
      '-=0.35'
    );

    // ── Stats ──
    tl.fromTo(`.${styles.statItem}`,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      '-=0.3'
    );

    // ── CTAs ──
    tl.fromTo(`.${styles.ctas}`,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.25'
    );

    // ── Availability ──
    tl.fromTo(`.${styles.availability}`,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.3'
    );

    // ── Scroll indicator ──
    tl.fromTo(`.${styles.scrollIndicator}`,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.2'
    );

  }, [visible]);

  return (
    <section ref={sectionRef} className={styles.section} id="hero">
      {/* Atmospheric background */}
      <div className={styles.atmosphere}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.container}>
        {/* ── Left: Identity ── */}
        <div className={styles.identity}>
          {/* Name */}
          <div className={styles.nameBlock}>
            <h1 className={styles.name}>
              <span ref={firstNameRef} className={styles.nameLine}>PRATHAM</span>
              <span ref={lastNameRef} className={styles.nameLine}>MALKAN</span>
            </h1>
            <div className={styles.accentLine} />
          </div>

          {/* Title */}
          <p className={styles.title}>Creative Technologist</p>

          {/* Positioning */}
          <p className={styles.statement}>
            I design, develop, edit, and launch digital products — end to end. From <em>concept</em> to <em>deployment</em>, I handle every layer of the stack.
          </p>

          {/* Capabilities */}
          <div className={styles.capabilities}>
            {capabilities.map((c) => (
              <span key={c.label} className={`${styles.capBadge} ${styles[`cap_${c.world}`]}`}>
                {c.label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className={styles.ctas}>
            <a href="#contact" className={styles.primaryCta}>
              <span>Start a Project</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#worlds" className={styles.secondaryCta}>
              Explore My Work
            </a>
          </div>
        </div>

        {/* ── Right: Credibility ── */}
        <div className={styles.credibility}>
          {/* Stats */}
          <div className={styles.statsGrid}>
            {quickStats.map((s, i) => (
              <div key={i} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Availability */}
          <div className={styles.availability}>
            <span className={styles.availDot} />
            <span className={styles.availText}>Available for new projects</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <span className={styles.scrollText}>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
