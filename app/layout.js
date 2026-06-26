import { Space_Grotesk, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PageTracker from '@/components/Analytics/PageTracker';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata = {
  metadataBase: new URL('https://prathammalkan.com'),
  title: "Pratham Malkan — Creative Technologist | Design, Code & Motion",
  description: "Multidisciplinary Creative Technologist crafting immersive digital experiences through design, code, and motion. Web Development, App Development, Video Editing, Graphic Design.",
  keywords: ["Creative Technologist", "Web Developer", "App Developer", "Video Editor", "Graphic Designer", "Pratham Malkan", "Portfolio"],
  authors: [{ name: "Pratham Malkan" }],
  creator: "Pratham Malkan",
  openGraph: {
    title: "Pratham Malkan — Creative Technologist",
    description: "Crafting immersive digital experiences through design, code, and motion.",
    type: "website",
    locale: "en_US",
    siteName: "Pratham Malkan Portfolio",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pratham Malkan — Creative Technologist' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pratham Malkan — Creative Technologist",
    description: "Crafting immersive digital experiences through design, code, and motion.",
    creator: "@PrathamM1310",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://prathammalkan.com/#person',
      name: 'Pratham Malkan',
      url: 'https://prathammalkan.com',
      jobTitle: 'Creative Technologist',
      sameAs: [
        'https://github.com/prathammalkan',
        'https://www.linkedin.com/in/pratham-malkan-aa2388376',
        'https://x.com/PrathamM1310',
        'https://www.instagram.com/pratham.malkan'
      ],
      description: 'Multidisciplinary Creative Technologist crafting digital experiences through design, code, and motion.'
    },
    {
      '@type': 'WebSite',
      '@id': 'https://prathammalkan.com/#website',
      url: 'https://prathammalkan.com',
      name: 'Pratham Malkan Portfolio',
      publisher: { '@id': 'https://prathammalkan.com/#person' }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body>
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
