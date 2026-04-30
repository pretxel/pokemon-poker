import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pokemon Poker — Pokémon-themed Scrum planning poker',
    short_name: 'Pokemon Poker',
    description:
      'Free real-time Scrum planning poker with Pokémon cards. Create a room, share the code, vote together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090f',
    theme_color: '#09090f',
    orientation: 'portrait',
    categories: ['productivity', 'business', 'utilities'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}
