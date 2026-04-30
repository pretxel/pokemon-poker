import type { Metadata, Viewport } from 'next';
import { Syne, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

const SITE_NAME = 'Pokemon Poker';
const TAGLINE = 'Pokémon-themed Scrum planning poker';
const DESCRIPTION =
  'Free real-time Scrum planning poker with a Pokémon twist. Create a room, share the code, vote with Pokémon cards, reveal together. No accounts, no setup.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'planning poker',
    'scrum poker',
    'pokemon poker',
    'agile estimation',
    'story points',
    'fibonacci voting',
    'sprint planning',
    'real-time estimation',
    'team retrospective',
    'pokemon scrum',
    'remote team estimation',
    'free planning poker',
  ],
  authors: [{ name: 'Edsel Serrano' }],
  creator: 'Edsel Serrano',
  publisher: 'Edsel Serrano',
  category: 'productivity',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#09090f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const webAppLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Real-time Scrum planning poker',
    'Pokémon-themed Fibonacci card values',
    'Shareable 6-character room code',
    'No accounts required',
    'Live vote reveal with consensus detection',
    'Story history per session',
  ],
  inLanguage: 'en',
  isAccessibleForFree: true,
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Pokemon Poker free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Pokemon Poker is free with no sign-up and no payment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need an account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. You only enter a display name when you create or join a room.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Pokemon Poker work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The admin creates a room and shares a 6-character code. Players join, the admin sets a story, players vote with Pokémon cards, and the admin reveals all votes at once.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do the Pokémon cards mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each Pokémon maps to a Fibonacci-style story-point value: Magikarp=0, Bulbasaur=1, Charmander=2, Squirtle=3, Pikachu=5, Eevee=8, Gengar=13, Snorlax=21, Dragonite=34, Ditto=? (unknown), Mewtwo=∞ (too big).',
      },
    },
    {
      '@type': 'Question',
      name: 'How many players can join a room?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'There is no hard cap. Typical Scrum sessions of 3–10 people work well.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are votes anonymous?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Each vote is associated with the player display name and shown on reveal, matching standard Scrum planning poker.',
      },
    },
  ],
};

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to run a planning poker session with Pokemon Poker',
  description:
    'Estimate Scrum stories with your team using Pokémon-themed planning poker cards.',
  totalTime: 'PT15M',
  supply: [{ '@type': 'HowToSupply', name: 'Sprint backlog with stories to estimate' }],
  tool: [{ '@type': 'HowToTool', name: 'A web browser' }],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Create a room',
      text: 'Open the home page, enter your display name and a room name, then click Create Room. You become the admin.',
      url: `${SITE_URL}/#create`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Share the room code',
      text: 'Copy the 6-character room code or the room URL and send it to your team.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Set a story',
      text: 'As admin, type the story name or ticket ID and submit it.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Players vote',
      text: 'Each player picks one Pokémon card representing their effort estimate. Votes stay hidden until the admin reveals.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Reveal and discuss',
      text: 'The admin clicks Reveal Cards. The app shows the average, min, max, distribution, and consensus banner if everyone agrees.',
    },
    {
      '@type': 'HowToStep',
      position: 6,
      name: 'Save and continue',
      text: 'Click Save & Next Story to record the round and start the next one, or Vote Again to re-cast on the same story.',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable}`}>
      <body>
        {children}
        <footer className="site-footer">
          Made with <span className="heart" aria-label="love" role="img">❤️</span>
          <span className="sep">|</span>2026<span className="sep">|</span>pretxel
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
        <Analytics />
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
