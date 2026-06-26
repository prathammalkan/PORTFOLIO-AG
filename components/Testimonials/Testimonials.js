'use client';
import { useEffect, useRef } from 'react';
import styles from './Testimonials.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Pratham delivered beyond our expectations. His ability to understand our brand and translate it into engaging video content was remarkable.",
    name: "Burger Villa",
    role: "Client — Video Editing",
    world: "cinema",
  },
  {
    quote: "Working with Pratham on personal brand videos was a great experience. He has a keen eye for pacing and storytelling that elevates every piece of content.",
    name: "Sneh Khatri",
    role: "Client — Video Editing",
    world: "cinema",
  },
  {
    quote: "The design work was consistently professional and creative. From posters to branding, every project was handled with care and attention to detail.",
    name: "Design Shop Clients",
    role: "Various — Graphic Design",
    world: "canvas",
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(`.${styles.card}`, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${styles.card}`, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.grid}`, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="testimonials">
      <div className={styles.topLine} />
      <h2 className={styles.title}>Words That Matter</h2>
      <p className={styles.subtitle}>What clients say about working together</p>

      <div className={styles.grid}>
        {testimonials.map((t, i) => (
          <div key={i} className={`${styles.card} ${styles[t.world]}`}>
            <div className={styles.quoteIcon}>&ldquo;</div>
            <p className={styles.quote}>{t.quote}</p>
            <div className={styles.author}>
              <div className={styles.avatar}>{t.name.charAt(0)}</div>
              <div>
                <div className={styles.name}>{t.name}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
