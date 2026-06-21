'use client';
import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch devices

    const dot = dotRef.current;
    const circle = circleRef.current;
    if (!dot || !circle) return;

    let mouseX = -100, mouseY = -100;
    let circleX = -100, circleY = -100;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    const lerp = (a, b, n) => a + (b - a) * n;

    const animate = () => {
      circleX = lerp(circleX, mouseX, 0.12);
      circleY = lerp(circleY, mouseY, 0.12);
      circle.style.transform = `translate(${circleX - 18}px, ${circleY - 18}px)`;
      requestAnimationFrame(animate);
    };

    const onEnterInteractive = () => {
      circle.classList.add(styles.expanded);
      dot.classList.add(styles.dotHover);
    };
    const onLeaveInteractive = () => {
      circle.classList.remove(styles.expanded);
      dot.classList.remove(styles.dotHover);
    };

    document.addEventListener('mousemove', onMove);
    requestAnimationFrame(animate);

    const interactives = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    // Re-observe for dynamic elements
    const obs = new MutationObserver(() => {
      const els = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
      els.forEach(el => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      obs.disconnect();
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.dot} />
      <div ref={circleRef} className={styles.circle} />
    </>
  );
}
