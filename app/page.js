'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ArrivalCanvas = dynamic(() => import('@/components/Arrival/ArrivalCanvas'), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/Cursor/CustomCursor'), { ssr: false });
import PrismHero from '@/components/Hero/PrismHero';
import TrustLayer from '@/components/Trust/TrustLayer';
import WorldSelector from '@/components/Worlds/WorldSelector';
import WorldCode from '@/components/Worlds/WorldCode';
import WorldCinema from '@/components/Worlds/WorldCinema';
import WorldCanvas from '@/components/Worlds/WorldCanvas';
import WorldAbout from '@/components/Worlds/WorldAbout';
import Testimonials from '@/components/Testimonials/Testimonials';
import PrismProcess from '@/components/Process/PrismProcess';
import ContactForm from '@/components/Contact/ContactForm';
import Navigation from '@/components/Navigation/Navigation';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [arrivalDone, setArrivalDone] = useState(false);
  const [skipArrival, setSkipArrival] = useState(false);

  useEffect(() => {
    setMounted(true);
    const visited = localStorage.getItem('prism-visited');
    if (visited) {
      setSkipArrival(true);
      setArrivalDone(true);
    }

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

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  const handleArrivalComplete = () => {
    setArrivalDone(true);
    localStorage.setItem('prism-visited', 'true');
  };

  return (
    <>
      {mounted && !skipArrival && <ArrivalCanvas onComplete={handleArrivalComplete} />}
      <Navigation show={arrivalDone} />
      {arrivalDone && <CustomCursor />}
      <main>
        <PrismHero visible={arrivalDone} />
        <TrustLayer />
        <WorldSelector />
        <WorldCode />
        <WorldCinema />
        <WorldCanvas />
        <WorldAbout />
        <Testimonials />
        <PrismProcess />
        <ContactForm />
      </main>
    </>
  );
}
