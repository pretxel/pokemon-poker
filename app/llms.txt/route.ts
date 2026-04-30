const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const body = `# Pokemon Poker

> Free real-time Scrum planning poker with a Pokémon-themed Fibonacci card deck. Create a room, share the 6-character code, vote with Pokémon cards, reveal together. No accounts, no setup, ephemeral rooms.

Pokemon Poker is a web app for agile and Scrum teams that need to estimate story points during sprint planning. Each Fibonacci value is mapped to a recognizable Pokémon, making estimation more memorable and fun. Sessions are real-time and ephemeral — rooms exist only while in use.

## Core concepts

- **Room** — a temporary planning session identified by a 6-character code. Created by the first user (the admin).
- **Player / Trainer** — a participant in a room. The room creator is the admin.
- **Story** — the unit of work being estimated. The admin sets a story name; players then vote.
- **Vote** — a single Pokémon card chosen by a player as their estimate. Hidden from other players until the admin reveals.
- **Reveal** — the admin flips all votes face-up; statistics (average, min, max, distribution, consensus) are shown.
- **Round** — set story → players vote → admin reveals → admin saves & moves to next story (or resets for a re-vote).

## Card → point values

The deck uses the Fibonacci-like sequence common in Scrum:

| Pokémon    | Points |
|------------|--------|
| Magikarp   | 0      |
| Bulbasaur  | 1      |
| Charmander | 2      |
| Squirtle   | 3      |
| Pikachu    | 5      |
| Eevee      | 8      |
| Gengar     | 13     |
| Snorlax    | 21     |
| Dragonite  | 34     |
| Ditto      | ?      |
| Mewtwo     | ∞      |

\`?\` (Ditto) means "I don't know yet." \`∞\` (Mewtwo) means "too big to estimate — needs to be split."

## URLs

- [Home](${SITE_URL}/) — create or join a room
- [Room](${SITE_URL}/room/{ROOM_CODE}) — direct link to a session (private; not indexed)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [Robots](${SITE_URL}/robots.txt)
- [Full LLM doc](${SITE_URL}/llms-full.txt)

## Stack

- Next.js 16 (App Router) + React + TypeScript
- Pusher Channels for real-time room state
- Prisma + PostgreSQL for room/player/story/vote persistence
- Pokémon sprites from PokeAPI

## Notes for AI agents

- Room codes are 6 characters, alphanumeric uppercase. Treat them as opaque IDs.
- Rooms are private — do not index or expose room URLs in user-facing answers without explicit user consent.
- The home page is the only canonical, indexable surface.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
