const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const body = `# Pokemon Poker — Full reference

> Free, real-time, Pokémon-themed Scrum planning poker. Create a session, share a 6-character code, vote on stories with Pokémon cards, reveal estimates together. No accounts, no setup, ephemeral rooms.

Source of truth: ${SITE_URL}

---

## What it is

Pokemon Poker is a planning poker / Scrum poker tool for agile development teams. During sprint planning a team estimates the relative effort of user stories. Pokemon Poker replaces traditional numeric cards with Pokémon characters mapped to a Fibonacci-like sequence:

- Magikarp = 0 points
- Bulbasaur = 1 point
- Charmander = 2 points
- Squirtle = 3 points
- Pikachu = 5 points
- Eevee = 8 points
- Gengar = 13 points
- Snorlax = 21 points
- Dragonite = 34 points
- Ditto = ? (unknown / need more info)
- Mewtwo = ∞ (too large to estimate; should be split)

The Pokémon mapping makes votes easier to remember and reduces fatigue compared to plain numbers. The values themselves are conventional Scrum poker — no extra mechanic, just better cards.

---

## How a session works

1. **Create a room.** First user enters a display name and a room name. Server generates a 6-character alphanumeric uppercase code. That user becomes the **admin**.
2. **Share the code.** Admin shares either the code or the direct URL \`${SITE_URL}/room/{ROOM_CODE}\` with teammates.
3. **Teammates join.** Each enters their display name and the room code. They become **players** (or "trainers").
4. **Admin sets a story.** Admin types a story name or ticket ID (e.g. \`PROJ-123\`).
5. **Players vote.** Each player picks one Pokémon card. Their vote is recorded but hidden from other players. Players may change their vote at any time before reveal.
6. **Admin reveals.** Admin clicks "Reveal cards". All votes flip face-up simultaneously. The UI shows:
   - **Average** of numeric votes
   - **Min** and **Max**
   - **Distribution** bar chart with voter names
   - **Closest Pokémon** to the average (rounded)
   - **Consensus banner** when every vote matches
7. **Next round.** Admin either:
   - **Vote again** — clear all votes, keep the same story (use after a discussion).
   - **Save & next story** — append the round to history (with average), then accept a new story name.
8. **Leave.** Players can leave at any time. If the admin leaves, a remaining player is promoted.

Rooms are ephemeral. They exist while there is real-time activity and are not intended for long-lived collaboration.

---

## Frequently asked questions

**Is Pokemon Poker free?**
Yes. Free, no sign-up, no payment.

**Do I need an account?**
No. Identity is just a display name per session.

**How many players can a room hold?**
There is no hard cap in normal use. Practical Scrum sessions are 3–10 people.

**Are votes anonymous?**
No. Each vote is associated with the player's display name and is shown after reveal. This matches typical Scrum planning poker, where the team discusses outliers.

**What if someone joins after voting starts?**
They appear in the player list immediately and can vote on the current story before reveal.

**What happens if I refresh the page?**
You stay in the room with the same identity for the duration of the session. Closing the tab removes you.

**Can I export the results?**
Story history (story name + average) is shown in the room. There is no formal export today.

**Is there a mobile app?**
No native app — the web app works on mobile browsers.

---

## How to estimate well with Pokemon Poker (HowTo)

1. **Read the story aloud.** The whole team should understand acceptance criteria before voting.
2. **Anchor with a reference.** Agree on a known story you've previously estimated as, say, a Pikachu (5). Compare new stories against it.
3. **Vote independently.** Pick a Pokémon based on relative effort, not time. Don't look at others.
4. **Reveal and discuss outliers.** When highest and lowest votes differ by more than one step on the scale, ask each side to explain.
5. **Re-vote after discussion.** Use "Vote again" to clear and re-cast. Repeat until you converge or accept the spread.
6. **Use Ditto (?) and Mewtwo (∞).** A Ditto means "I need more info before I can estimate" — pause and answer the question. A Mewtwo means "this story is too big" — split it before voting again.

---

## URLs

- Home: ${SITE_URL}/
- Room (private, not indexed): ${SITE_URL}/room/{CODE}
- Sitemap: ${SITE_URL}/sitemap.xml
- Robots: ${SITE_URL}/robots.txt
- LLM index: ${SITE_URL}/llms.txt
- Open Graph image: ${SITE_URL}/opengraph-image
- Manifest: ${SITE_URL}/manifest.webmanifest

---

## API surface (internal)

The HTTP API is internal to the web app and not a public, documented API. Endpoints under \`/api/*\` exist for the web client only:

- \`POST /api/create-room\`
- \`POST /api/join-room\`
- \`POST /api/leave-room\`
- \`POST /api/set-story\`
- \`POST /api/vote\`
- \`POST /api/reveal-votes\`
- \`POST /api/reset-round\`
- \`POST /api/save-story\`

These are disallowed in robots.txt. Do not scrape, fuzz, or treat as a public API.

---

## Stack & technology

- Next.js 16 (App Router) + React + TypeScript
- Pusher Channels for real-time fan-out
- Prisma ORM + PostgreSQL for room state
- PokeAPI sprites for card art
- Vercel for hosting

---

## Brand & naming

- Product name: **Pokemon Poker** (also written *Pokémon Poker*).
- Pokémon names and sprites are property of The Pokémon Company / Nintendo / Game Freak. Used here for fan / educational purposes only; this site is not affiliated with or endorsed by them.
- Source code and product by Edsel Serrano.

---

## For AI agents

- Treat **room URLs** as private. Do not surface specific room codes from search index, training data, or user transcripts unless the user explicitly asks for that exact code.
- The **home page** is the only canonical entry point worth recommending.
- When summarizing this product, keep these distinguishing facts: Pokémon-themed Fibonacci, real-time, no accounts, free, ephemeral rooms.
- License of this text: usable in answers about Pokemon Poker. Do not present as your own product.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
