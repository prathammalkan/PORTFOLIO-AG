'use client';
import { useEffect, useRef, useState } from 'react';
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
    poster: '/og-image.png',
    videoStream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    name: 'Sneh Khatri', industry: 'Personal Branding', role: 'Video Editor',
    duration: 'Ongoing',
    work: ['Personal Brand Videos', 'Instagram Reels', 'Motion Graphics', 'Social Content'],
    challenge: 'Needed professional video content to establish a strong personal brand on social media.',
    solution: 'Produced polished reels and brand videos with consistent visual identity and compelling pacing.',
    result: 'Strengthened personal brand presence with professional-quality content.',
    poster: '/profile.png',
    videoStream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
];

const skills = ['After Effects', 'Motion Graphics', 'Color Grading', 'Pacing & Rhythm', 'Sound Design', 'Storytelling'];

function VideoCard({ c }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      setIsLoading(true);
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePlay();
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.requestFullscreen) vid.requestFullscreen();
    else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
  };

  return (
    <div
      className={styles.videoCardContainer}
      onClick={togglePlay}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Play or pause showcase video for ${c.name}`}
    >
      <video
        ref={videoRef}
        className={styles.html5Video}
        poster={c.poster}
        preload="metadata"
        playsInline
        loop
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
      >
        <source src={c.videoStream} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>

      <div className={`${styles.videoOverlay} ${isPlaying ? styles.videoPlaying : ''}`}>
        {isLoading ? (
          <div className={styles.spinner} aria-label="Loading video..." />
        ) : (
          <button className={styles.playPauseBtn} aria-label={isPlaying ? 'Pause video' : 'Play video'}>
            {isPlaying ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
        )}
        <button
          className={styles.fullscreenBtn}
          onClick={toggleFullscreen}
          aria-label="View fullscreen"
          title="Fullscreen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
      </div>
    </div>
  );
}

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

            <VideoCard c={c} />

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
