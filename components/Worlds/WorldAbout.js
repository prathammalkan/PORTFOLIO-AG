'use client';
import { useEffect, useRef } from 'react';
import styles from './WorldAbout.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const philosophy = [
  { title: 'Design is problem-solving, not decoration.', desc: 'Every visual choice serves a purpose. Beauty emerges from clarity.' },
  { title: 'Technology should be invisible.', desc: 'The experience should be everything. Users shouldn\'t think about the tech — they should feel the product.' },
  { title: 'Every project deserves product-level thinking.', desc: 'Whether it\'s a poster or a platform, I approach it with the same strategic depth.' },
  { title: 'The best work lives at intersections.', desc: 'Design × Code × Motion × Strategy. The most powerful solutions blend disciplines.' },
];

const journey = [
  { year: '2021', title: 'Design Origins', desc: 'Joined a local design shop. Learned to translate client visions into visual reality.', color: 'var(--canvas-primary)' },
  { year: '2022', title: 'Expanding Horizons', desc: 'Mastered branding, print, social media design. Started exploring video editing.', color: 'var(--cinema-primary)' },
  { year: '2023', title: 'Into Code', desc: 'Began BCA at Saurashtra University. Self-taught web development alongside academics.', color: 'var(--code-primary)' },
  { year: '2024', title: 'Freelance & Build', desc: 'Freelance video work for Burger Villa & Sneh Khatri. Started building full-stack products.', color: 'var(--cinema-primary)' },
  { year: '2025', title: 'Product Builder', desc: 'Launched NisFlow, Veloura, GameZone, LostLink, MobStore. Evolved into Creative Technologist.', color: 'var(--code-primary)' },
];

const interests = ['Gaming', 'eSports', 'AI', 'Technology', 'Motion Design', 'Product Development'];

const socials = [
  { name: 'GitHub', url: 'https://github.com/prathammalkan', icon: 'GH' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/pratham-malkan-aa2388376', icon: 'LI' },
  { name: 'Instagram', url: 'https://www.instagram.com/pratham.malkan', icon: 'IG' },
  { name: 'X', url: 'https://x.com/PrathamM1310', icon: 'X' },
  { name: 'YouTube', url: 'https://youtube.com/@imm0rtal7-p', icon: 'YT' },
];

export default function WorldAbout() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.heroTitle}`, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.fromTo(`.${styles.storyParagraph}`, { opacity: 0, y: 25 }, {
        opacity: 1, y: 0, stagger: 0.15, duration: 0.8,
        scrollTrigger: { trigger: `.${styles.storySection}`, start: 'top 80%' }
      });
      gsap.fromTo(`.${styles.philCard}`, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.7,
        scrollTrigger: { trigger: `.${styles.philosophyGrid}`, start: 'top 80%' }
      });
      gsap.fromTo(`.${styles.journeyItem}`, { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, stagger: 0.15, duration: 0.7,
        scrollTrigger: { trigger: `.${styles.journeyTimeline}`, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="world-about">
      <div className={styles.worldHero}>
        <h2 className={styles.heroTitle}>THE PERSON</h2>
        <p className={styles.heroSubtitle}>Behind every pixel, every line of code, every frame</p>
      </div>

      <div className={styles.storySection}>
        <div className={styles.storyContent}>
          <p className={styles.storyParagraph}>
            I&apos;m a Creative Technologist who helps businesses, startups, and individuals transform ideas into <em>digital products and experiences</em>.
          </p>
          <p className={styles.storyParagraph}>
            My work combines design, development, AI, and motion to create solutions that are <em>visually engaging</em>, <em>technically reliable</em>, and focused on real business goals. From websites and mobile applications to branding systems and digital experiences, I handle the entire process from concept to execution.
          </p>
          <p className={styles.storyParagraph}>
            Over the past few years, I&apos;ve worked across design, content creation, product development, and client projects, gaining hands-on experience in understanding requirements, solving problems, and delivering results.
          </p>
          <p className={styles.storyParagraph}>
            Whether you&apos;re building a new product, improving an existing one, or creating a stronger digital presence — my focus is always the same: creating experiences that <em>look great</em>, <em>work seamlessly</em>, and provide <em>real value</em>.
          </p>
        </div>
        <div className={styles.storyImage}>
          <div className={styles.photoContainer}>
            <img src="/profile.jpeg" alt="Pratham Malkan" className={styles.photo} />
            <span className={styles.photoLabel}>Pratham Malkan</span>
            <span className={styles.photoLocation}>📍 India</span>
          </div>
        </div>
      </div>

      <div className={styles.philosophySection}>
        <h3 className={styles.sectionLabel}>Creative Philosophy</h3>
        <div className={styles.philosophyGrid}>
          {philosophy.map((p, i) => (
            <div key={i} className={styles.philCard}>
              <span className={styles.philNumber}>0{i + 1}</span>
              <h4 className={styles.philTitle}>&ldquo;{p.title}&rdquo;</h4>
              <p className={styles.philDesc}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.journeySection}>
        <h3 className={styles.sectionLabel}>The Journey</h3>
        <div className={styles.journeyTimeline}>
          {journey.map((j, i) => (
            <div key={i} className={styles.journeyItem}>
              <div className={styles.journeyDot} style={{ background: j.color }} />
              <div className={styles.journeyYear} style={{ color: j.color }}>{j.year}</div>
              <div className={styles.journeyContent}>
                <h4 className={styles.journeyTitle}>{j.title}</h4>
                <p className={styles.journeyDesc}>{j.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.educationSection}>
        <h3 className={styles.sectionLabel}>Education</h3>
        <div className={styles.eduCard}>
          <h4 className={styles.eduDegree}>Bachelor of Computer Applications (BCA)</h4>
          <p className={styles.eduInstitution}>Shree GK & CK Bosamia Arts & Commerce College</p>
          <p className={styles.eduUniversity}>Saurashtra University · 2023–2026</p>
        </div>
      </div>

      <div className={styles.interestsSection}>
        <h3 className={styles.sectionLabel}>Beyond Work</h3>
        <div className={styles.interestTags}>
          {interests.map(i => <span key={i} className={styles.interestTag}>{i}</span>)}
        </div>
      </div>

      <div className={styles.socialsSection}>
        <h3 className={styles.sectionLabel}>Connect</h3>
        <div className={styles.socialLinks}>
          {socials.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <span className={styles.socialIcon}>{s.icon}</span>
              <span className={styles.socialName}>{s.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
