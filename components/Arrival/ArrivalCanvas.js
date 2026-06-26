'use client';
import { useEffect, useState, useRef } from 'react';
import styles from './ArrivalCanvas.module.css';

export default function ArrivalCanvas({ onComplete }) {
  const [lineActive, setLineActive] = useState(false);
  const [displayNum, setDisplayNum] = useState(0);
  const [hiding, setHiding] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    // Trigger CSS width transition
    const raf = requestAnimationFrame(() => {
      setLineActive(true);
    });

    // Animate minimal percentage counter
    const startTime = Date.now();
    const duration = 750; // 750ms luxury pace
    let timerId;

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / duration);
      // Cubic ease out
      const easeOut = 1 - Math.pow(1 - ratio, 3);
      const currentVal = Math.floor(easeOut * 100);

      setDisplayNum(currentVal);

      if (ratio < 1) {
        timerId = requestAnimationFrame(updateCounter);
      } else {
        if (!completedRef.current) {
          completedRef.current = true;
          setHiding(true);
          setTimeout(() => {
            onComplete?.();
          }, 450);
        }
      }
    };

    timerId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(raf);
      if (timerId) cancelAnimationFrame(timerId);
    };
  }, [onComplete]);

  return (
    <div className={`${styles.wrapper} ${hiding ? styles.hidden : ''}`} role="progressbar" aria-valuenow={displayNum} aria-valuemin={0} aria-valuemax={100} aria-label="Loading portfolio experience">
      <div className={styles.loaderContainer}>
        <div className={styles.track}>
          <div className={styles.bar} style={{ width: lineActive ? '100%' : '0%' }} />
        </div>
        <span className={styles.counter}>
          {displayNum === 100 ? '100' : displayNum < 10 ? `0${displayNum}` : displayNum}
        </span>
      </div>
    </div>
  );
}
