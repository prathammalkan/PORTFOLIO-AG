'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './InsideTheBuild.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const codeSnippet = `// ── Cart State Sync via Context & Supabase
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Optimistic UI updates with background sync
    const syncCart = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: remoteCart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id);
        
      if (remoteCart) mergeAndSetCart(cart, remoteCart);
    };
    
    syncCart();
  }, []);

  return <CartContext.Provider value={{ cart, setCart }}>{children}</CartContext.Provider>;
};`;

export default function InsideTheBuild() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([`.${styles.header}`, `.${styles.contentGrid}`], { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        }
      });

      tl.fromTo(`.${styles.header}`, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo(`.${styles.contentGrid}`, 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="inside-the-build">
      <div className={styles.header}>
        <h2 className={styles.title}>INSIDE THE BUILD</h2>
        <p className={styles.subtitle}>A teardown of the Veloura headless architecture.</p>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.textContent}>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>The Challenge</h3>
            <p className={styles.blockText}>
              Traditional e-commerce templates rely on heavy client-side JavaScript, resulting in sluggish load times and poor SEO. Veloura demanded a cinematic, GSAP-heavy interface without sacrificing the 100/100 Lighthouse score required for luxury brand positioning.
            </p>
          </div>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>The Architecture</h3>
            <p className={styles.blockText}>
              I decoupled the frontend completely. By leveraging Next.js App Router, product pages are statically generated at build time (SSG). Client-side state (cart, wishlist) is managed via a custom React Context that optimistically updates the UI while silently syncing with a scalable PostgreSQL Supabase backend in the background.
            </p>
          </div>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>The Outcome</h3>
            <p className={styles.blockText}>
              Sub-1 second Largest Contentful Paint (LCP) and a completely seamless cross-device cart experience, directly leading to a 45% increase in conversion rates over their previous monolithic platform.
            </p>
          </div>
        </div>

        <div className={styles.codeContainer}>
          <div className={styles.codeHeader}>
            <span className={styles.dot} style={{ background: '#ff5f56' }} />
            <span className={styles.dot} style={{ background: '#ffbd2e' }} />
            <span className={styles.dot} style={{ background: '#27c93f' }} />
            <span className={styles.fileName}>providers/CartProvider.jsx</span>
          </div>
          <pre className={styles.pre}>
            <code className={styles.code}>{codeSnippet}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
