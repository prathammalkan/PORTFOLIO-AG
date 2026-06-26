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



export default function PrismHero({ visible }) {
  const sectionRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current) return;
    hasAnimated.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([firstNameRef.current, lastNameRef.current, `.${styles.accentLine}`, `.${styles.title}`, `.${styles.statement}`, `.${styles.capBadge}`, `.${styles.ctas}`, `.${styles.availability}`, `.${styles.scrollIndicator}`], { opacity: 1, clipPath: 'none', scale: 1, scaleX: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.15 });

    tl.fromTo(firstNameRef.current,
      { clipPath: 'inset(0 50% 0 50%)', opacity: 0.7 },
      { clipPath: 'inset(0 0% 0 0%)', opacity: 1, duration: 1.1, ease: 'power4.out' }
    );

    tl.fromTo(lastNameRef.current,
      { clipPath: 'inset(0 50% 0 50%)', opacity: 0.7 },
      { clipPath: 'inset(0 0% 0 0%)', opacity: 1, duration: 1.1, ease: 'power4.out' },
      '-=0.85'
    );

    tl.fromTo(`.${styles.accentLine}`,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );

    tl.fromTo(`.${styles.title}`,
      { opacity: 0, y: 15, clipPath: 'inset(100% 0 0 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    );

    tl.fromTo(`.${styles.statement}`,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.35'
    );

    tl.fromTo(`.${styles.capBadge}`,
      { opacity: 0, scale: 0.85, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
      '-=0.35'
    );

    tl.fromTo(`.${styles.ctas}`,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.25'
    );

    tl.fromTo(`.${styles.availability}`,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.3'
    );

    tl.fromTo(`.${styles.scrollIndicator}`,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.2'
    );

  }, [visible]);

  return (
    <section ref={sectionRef} className={styles.section} id="hero">
      <div className={styles.atmosphere}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.container}>
        <div className={styles.identity}>
          <div className={styles.nameBlock}>
            <h1 className={styles.name}>
              <span ref={firstNameRef} className={styles.nameLine}>PRATHAM</span>
              <span ref={lastNameRef} className={styles.nameLine}>MALKAN</span>
            </h1>
            <div className={styles.accentLine} />
          </div>

          <p className={styles.title}>Creative Technologist</p>

          <p className={styles.statement}>
            Multidisciplinary designer and engineer building high-performance web platforms, mobile apps, and motion systems. Partnering with founders to design, build, and ship production software.
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
              <span>Book a Discovery Call</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#world-code" className={styles.secondaryCta}>
              Read Case Studies
            </a>
          </div>
        </div>

        {/* ── Right: Credibility ── */}
        <div className={styles.credibility}>


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
