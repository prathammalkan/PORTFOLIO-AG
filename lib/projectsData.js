export const projectsData = {
  veloura: {
    name: 'Veloura',
    tagline: 'Luxury Jewellery E-Commerce',
    tier: 'large',
    themeColor: 'var(--cinema-primary)',
    heroMetrics: [
      { value: '45%', label: 'Conversion Increase' },
      { value: '< 1s', label: 'LCP Load Time' },
      { value: '10k+', label: 'Concurrent Users' }
    ],
    roles: ['Full-Stack Architect', 'UI/UX Designer'],
    stack: ['Next.js', 'React', 'Supabase', 'CSS Modules', 'Vercel'],
    live: 'https://veloura-orpin-chi.vercel.app/',
    repo: 'https://github.com/prathammalkan/VELOURA',
    
    sections: {
      overview: "Veloura is a premium e-commerce platform built to democratize luxury. The goal was to provide an extremely high-end, smooth shopping experience typical of luxury fashion houses, but scaled for affordable jewellery. It features a full authentication flow, custom cart management, wishlist, and QR-based payments.",
      problem: "Shopify and standard template platforms were too rigid to deliver the micro-interactions and cinematic brand feel the client demanded. The business needed a headless architecture to allow completely custom UI while securely managing cart state and authentication.",
      research: "I analyzed 15+ top luxury brands (Cartier, Tiffany, Bulgari) and noticed a pattern: they rely on stark minimalism, high-resolution imagery, and buttery-smooth page transitions to imply quality. Standard e-commerce templates rely on clutter; we needed space.",
      strategy: "The plan was to decouple the frontend from the backend completely. Next.js App Router for server-rendered SEO benefits and instant transitions, Supabase for scalable PostgreSQL database and Auth, and pure CSS Modules to avoid the 'Tailwind template' look.",
      design: "The design system was built around absolute minimalism. A stark monochrome palette with subtle gold accents (Canvas World). Typography played the biggest role: Playfair Display for editorial luxury, Space Grotesk for utilitarian UI elements.",
      engineering: "Engineered a custom React context to handle global cart and wishlist state without the bloat of Redux. Integrated Supabase Auth for seamless magic-link logins, reducing cart abandonment. Product data is statically generated (SSG) at build time for instant loading, with client-side hydration for dynamic stock levels.",
      challenges: "Managing complex cart state synchronisation across multiple browser tabs and devices while dealing with Supabase's asynchronous auth state. A user adding an item on mobile needed to see it instantly if they logged in on desktop.",
      decisions: "Chose to explicitly write CSS Modules instead of using Tailwind or styled-components. This tradeoff meant slightly slower development time but gave me 100% control over the highly complex GSAP scroll animations without class-name conflicts.",
      results: "Launched to production in 4 weeks. The headless architecture resulted in a sub-1 second Largest Contentful Paint (LCP). The seamless auth and cart flow increased conversion rates by an estimated 45% compared to their previous template.",
      lessonsLearned: "I learned that in e-commerce, every millisecond counts. Over-engineering state management is easy, but keeping the cart logic as close to the UI as possible (while syncing to the DB in the background) provides the best user experience."
    }
  },
  nisflow: {
    name: 'NisFlow',
    tagline: 'AI-Powered Life Operating System',
    tier: 'hero',
    themeColor: 'var(--code-primary)',
    heroMetrics: [
      { value: '14+', label: 'Integrated Modules' },
      { value: 'Zero', label: 'Latency Sync' },
      { value: 'AI', label: 'Gemini Powered' }
    ],
    roles: ['Founder', 'Product Architect', 'Mobile Developer'],
    stack: ['Kotlin', 'Firebase', 'Gemini AI', 'Android'],
    repo: 'https://github.com/prathammalkan/NISFLOW-V2',
    
    sections: {
      overview: "NisFlow is a highly ambitious personal project: a complete life operating system. It centralizes productivity, health tracking, scheduling, finances, personal growth, and habits into one intelligent Android ecosystem, natively powered by Gemini AI.",
      problem: "The productivity market is fragmented. Users (including myself) were juggling Notion for notes, Todoist for tasks, MyFitnessPal for health, and Mint for finances. The friction of context-switching destroyed the actual productivity these apps promised.",
      research: "User interviews revealed that people abandon productivity systems because they require too much manual data entry. The system needed to be proactive, not reactive. It needed to understand context.",
      strategy: "Build a native Android application using Kotlin for maximum performance and deep OS integration. Use Firebase for real-time data sync across devices, and integrate the Gemini AI API to act as an invisible assistant that connects the 14 different modules.",
      design: "Designed a modular, card-based interface. The challenge was fitting 14 distinct apps (finance, health, tasks) into a single cohesive UI without overwhelming the user. I relied heavily on progressive disclosure—showing only what is immediately necessary.",
      engineering: "Architected a massive Firebase NoSQL database structure to interlink habits with daily tasks and financial goals. Implemented a custom caching layer in Kotlin to ensure the app works 100% offline, syncing to Firebase only when a connection is restored.",
      challenges: "The hardest part was the AI integration. Feeding the context of a user's entire day (tasks, finances, health data) into Gemini without hitting token limits required creating a highly optimized, compressed JSON summary generator on the client side.",
      decisions: "Chose native Kotlin over React Native or Flutter. This was a critical tradeoff: I sacrificed cross-platform reach (iOS) to gain access to low-level Android APIs for background syncing, alarms, and widgets, which are essential for a 'Life OS'.",
      results: "Currently in development, but the core 14 modules are integrated and communicating perfectly. The offline-first architecture allows for zero-latency interactions, and the Gemini AI context window successfully analyzes cross-module data.",
      lessonsLearned: "Building a monolith is exponentially harder than building a single-feature app. I learned the absolute necessity of strict interface contracts and clear architecture (MVVM) when building a system this massive."
    }
  }
};
