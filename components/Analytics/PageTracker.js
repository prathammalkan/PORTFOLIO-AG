'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getSessionId() {
  let id = localStorage.getItem('prism_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('prism_session_id', id);
  }
  return id;
}

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    const sessionId = getSessionId();

    // Track pageview
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        sessionId,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
      }),
    }).catch(() => {});

    // Track clicks on elements with data-track attribute
    const handleClick = (e) => {
      const tracked = e.target.closest('[data-track]');
      if (!tracked) return;
      const eventName = tracked.getAttribute('data-track');
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventData: { text: tracked.innerText?.trim().substring(0, 100) },
          sessionId,
          path: pathname,
        }),
      }).catch(() => {});
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
