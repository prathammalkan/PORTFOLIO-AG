'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CaseStudy.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CaseStudyClient({ project }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    let lenis;
    import('lenis').then((mod) => {
      const Lenis = mod.default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    });

    // GSAP Animations
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.heroTitle}`, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }
      );
      gsap.fromTo(`.${styles.heroTagline}`, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo(`.${styles.heroMetric}`, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      );

      gsap.utils.toArray(`.${styles.section}`).forEach(section => {
        gsap.fromTo(section,
          { opacity: 0, y: 40 },
          { 
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
            }
          }
        );
      });
    }, containerRef);

    return () => {
      if (lenis) lenis.destroy();
      ctx.revert();
    };
  }, []);

  const sectionsList = [
    { id: 'overview', title: '01 / Overview' },
    { id: 'problem', title: '02 / The Problem' },
    { id: 'research', title: '03 / Research' },
    { id: 'strategy', title: '04 / Strategy' },
    { id: 'design', title: '05 / Design' },
    { id: 'engineering', title: '06 / Engineering' },
    { id: 'challenges', title: '07 / Challenges' },
    { id: 'decisions', title: '08 / Tradeoffs' },
    { id: 'results', title: '09 / Results' },
    { id: 'lessonsLearned', title: '10 / Lessons Learned' }
  ];

  return (
    <div ref={containerRef} className={styles.container} style={{ '--theme-color': project.themeColor }}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          <span>← Back to Worlds</span>
        </Link>
        {project.live && (
          <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.liveLink}>
            View Live Site ↗
          </a>
        )}
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.themeGlow} />
        <h1 className={styles.heroTitle}>{project.name}</h1>
        <p className={styles.heroTagline}>{project.tagline}</p>
        
        <div className={styles.heroMetrics}>
          {project.heroMetrics.map((m, i) => (
            <div key={i} className={styles.heroMetric}>
              <span className={styles.metricValue}>{m.value}</span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.metaData}>
          <div className={styles.metaBlock}>
            <span className={styles.metaTitle}>Roles</span>
            <div className={styles.metaTags}>
              {project.roles.map(r => <span key={r} className={styles.tag}>{r}</span>)}
            </div>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaTitle}>Tech Stack</span>
            <div className={styles.metaTags}>
              {project.stack.map(s => <span key={s} className={styles.tag}>{s}</span>)}
            </div>
          </div>
        </div>
      </header>

      {/* Case Study Content */}
      <main className={styles.mainContent}>
        {sectionsList.map((sec) => (
          project.sections[sec.id] && (
            <section key={sec.id} className={styles.section} id={sec.id}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{sec.title}</h2>
                <div className={styles.sectionLine} />
              </div>
              <p className={styles.sectionText}>{project.sections[sec.id]}</p>
            </section>
          )
        ))}
      </main>

      {/* Footer CTA */}
      <footer className={styles.footerCta}>
        <h2 className={styles.footerTitle}>Ready to build your next product?</h2>
        <Link href="/#contact" className={styles.ctaButton}>
          Start a Conversation
        </Link>
      </footer>
    </div>
  );
}
