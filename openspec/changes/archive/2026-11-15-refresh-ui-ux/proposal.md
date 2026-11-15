## Why

The current UI has a generic look: a near-black "deep space" background with drifting aurora blurs, Syne and Manrope, rounded glass panels, ALL-CAPS labels on every section and emojis used as icons. Nothing about it says "a team estimating stories together." It also has real usability gaps:
- Voting cards are clickable `div`s, so you can't vote with the keyboard.
- There are no visible focus states and no reduced-motion support.
- Failed room actions fail silently.
- Layout is spread across many inline styles.

Estimation is a group ritual: people sit down, put cards down face-down, then flip them together. The UI should be built around that moment.

## What Changes

- **New visual identity**: a bright daytime palette with a tabletop feel instead of the dark aurora theme. New type pairing: Bricolage Grotesque for display and card values, Atkinson Hyperlegible for body text. Design tokens on `:root`, with a matching dark scheme under `prefers-color-scheme`.
- **Room becomes a table**: participants sit around a central table. When someone votes, a face-down card appears at their seat. The host's reveal flips every card in one staggered move. This is the single orchestrated animation in the app. Results (average, spread, distribution, consensus) take the table's center after the reveal.
- **Hand of cards**: the 11 Pokémon cards become a fanned "hand" docked at the bottom of the room. The selected card lifts. Cards are real `<button>`s with `aria-pressed`, arrow-key navigation within the hand and visible focus.
- **Lobby simplified**:
  - Starting a room is the main action and joining with a code is secondary.
  - Opening an invite link (`/room/[id]`) only asks for a name.
  - A fanned card hand replaces the Pokéball logo as the hero.
- **Story bar**: the current story sits in a header strip, and the host edits it inline. Story history moves into a collapsible side drawer.
- **Feedback and copy**:
  - Room actions surface failures in an inline status line.
  - "Copy invite link" copies the link and confirms with "Link copied".
  - "Admin" is renamed "Host".
  - Labels are sentence case and buttons name the outcome ("Reveal cards", "Next story").
- **Quality floor**: SVG icons replace emojis, inline styles move to CSS, and there's visible `:focus-visible`, `prefers-reduced-motion` support, WCAG AA contrast, and a responsive layout down to 360px.
- **Removed**: aurora orb animations, emoji iconography, the uppercase panel-title pattern.

## Capabilities

### New Capabilities
- `visual-identity`: design tokens (color, type, spacing, radius, motion), light and dark schemes, icon set, and the accessibility floor (focus, contrast, reduced motion, responsive breakpoints).
- `lobby-experience`: home and invite-link entry flows: creating a room, joining by code, joining from an invite link, and error and loading states.
- `estimation-table`: the room experience: story bar, table with seats, card hand, reveal sequence, results, history drawer, host controls, and action feedback.

### Modified Capabilities
<!-- None: openspec/specs only covers dependency-maintenance, which is unaffected. -->

## Impact

- **Code**:
  - `app/globals.css` (rewritten), `app/layout.tsx` (fonts, footer styling).
  - `components/Home.tsx`, `Room.tsx`, `PokemonCard.tsx`, `PlayerList.tsx` (becomes the table seats) and `VoteResults.tsx`.
  - New small components: `Icon`, `StoryBar`, `Table`, `Hand`, `HistoryDrawer`.
- **APIs**: none. All `/api/*` routes, Pusher events and `RoomState` types stay unchanged.
- **Dependencies**: none added. Fonts load via `next/font/google`.
- **Out of scope**: legacy `client/` Vite app, `opengraph-image`/`icon` artwork, and any game-logic or persistence changes.
