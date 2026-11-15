## Context

Pokemon Poker is a real-time planning-poker app built with Next.js 16 App Router, Pusher and Prisma.

- **Audience**: small scrum teams estimating stories on a call. Most use laptops, some use phones.
- **Primary job**: get everyone's estimate down face-down, reveal together, and agree fast.
- **Tone**: playful, because of the Pokémon theme, without hurting a work tool's legibility.

The UI today is six client components styled by one 1,052-line `app/globals.css` plus many inline `style={{}}` blocks:
- Theme: "Deep Space TCG", with near-black `#09090f`, animated aurora blurs, Syne and Manrope, and emojis as icons.
- Voting cards are `div`s with `onClick`.
- There are no `:focus-visible` or `prefers-reduced-motion` rules.
- `roomAction()` ignores the response.

Constraints:
- No API, Pusher event or `RoomState` changes. This is presentation-only.
- No new runtime dependencies. Fonts come through `next/font/google`.
- Sprites keep loading from PokeAPI's GitHub sprite URLs.
- The design must be an original identity. It must not imitate official Pokémon TCG card frames, logos or game UI. The theme comes only from the creature names and sprites the app already uses.

## Goals / Non-Goals

**Goals:**
- One memorable moment: the simultaneous reveal on a shared table.
- A bright, daytime identity grounded in the subject: a meadow table, because creatures are found in tall grass and the team sits around it.
- Keyboard-complete voting, visible focus, AA contrast, reduced-motion support, and a layout that works from 360px up.
- Remove inline styles, keeping styling in tokens and component sections of `globals.css`.

**Non-Goals:**
- Changing game rules, the card deck values or persistence.
- A manual theme toggle (dark follows the OS only).
- Reworking `client/` (legacy Vite app), the OG image or the app icon.
- Internationalization (copy stays in English).

## Decisions

### D1. Design plan: tokens

**Color** (light, the default):

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#EAF2F8` | Page background, a cool sky-washed paper |
| `--ink` | `#182235` | Text, outlines, icons |
| `--meadow` | `#4E9F5C` | Table surface |
| `--meadow-deep` | `#3B7F48` | Mown-stripe pattern on the table, card shadows on the table |
| `--berry` | `#D93A2B` | The one call to action per screen (Reveal cards, Start a room) |
| `--sun` | `#F5C518` | Selected card, your seat, focus ring fill |
| `--card` | `#FFFFFF` | Card faces, inputs |
| `--line` | `#C9D6E2` | Hairlines and input borders |

Dark (`prefers-color-scheme: dark`) is dusk on the same meadow: `--paper #111A24`, `--ink #E8EEF5`, `--meadow #2F6B3E`, `--meadow-deep #24552F`, `--card #1C2633`, `--line #2C3A4A`. `--berry` and `--sun` stay the same. Every text/background pair is checked for 4.5:1 contrast, and 3:1 for large numerals.

The per-Pokémon `color` values in `POKEMON_CARDS` stay. They tint each card's art window and its distribution bar only.

**Type**:
- **Bricolage Grotesque** (variable, `opsz` and `wdth` axes) is the display face. It's used for the room name, the story title and card values. Card values are set at `wdth 75` and weight 800 so "34" and "∞" read as large, condensed numerals: the one place type itself becomes the graphic.
- **Atkinson Hyperlegible** (400 and 700) is used for body text, labels, inputs and buttons. It was chosen for legibility at small sizes on a shared screen.
- **Scale** is a 1.25 ratio: 14, 16, 20, 25, 31, 39, 61px. Body is 16/1.5. Line length is capped at 68ch.
- Labels are sentence case. There's no uppercase tracking and no monospace for data.

**Shape and depth**: radius follows hierarchy rather than one value everywhere.

| Element | Radius |
|---|---|
| Table | 40px rounded rectangle |
| Cards | 12px |
| Inputs and buttons | 10px |
| Avatars | Circles |

Depth comes from hard, offset "sticker" shadows (`0 4px 0 var(--meadow-deep)` for cards on the table, `0 3px 0 var(--ink)` for pressed buttons). There are no grey blur shadows or gradient washes.

**Motion**: `--t-fast 120ms`, `--t 200ms`, `--ease cubic-bezier(.2,.8,.2,1)`. Animation that runs without user action exists only in the reveal (D4). The aurora orbs are removed.

### D2. Layout

Room, desktop (≥ 900px):

```
┌───────────────────────────────────────────────────────────────┐
│ Sprint 42 Planning   ABC123 [Copy invite link]   History  Leave │
├───────────────────────────────────────────────────────────────┤
│ Story: PROJ-123 Login with SSO                     [Edit] host│
├───────────────────────────────────────────────────────────────┤
│        (Ana)▢      (Ben)▢      (Cy)·      (You)▢               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │ ░░░░░░░░░░░░░░░ meadow table ░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│   │            3 of 5 voted     [ Reveal cards ]           │   │
│   │   after reveal: results replace this center block      │   │
│   └───────────────────────────────────────────────────────┘   │
│        (Dee)▢      (Eli)·                                     │
├───────────────────────────────────────────────────────────────┤
│   ╱0╲╱1╲╱2╲╱3╲╱5╲ ▲8▲ ╱13╲╱21╲╱34╲╱?╲╱∞╲   ← your hand        │
└───────────────────────────────────────────────────────────────┘
```

- The table area is left-aligned to the page grid and centered inside itself.
- Seats split into a top row and a bottom row: odd-indexed players go on top, even-indexed on the bottom, each row wrapping with flex. This scales past 12 players without polar-coordinate math.
- The hand is a sticky bottom dock. The selected card lifts 16px and gets a `--sun` outline.

Room, mobile (< 600px): the header collapses to the room name plus a menu (Copy invite link, History, Leave). Seats become a 3-column grid above a smaller table. The hand becomes a horizontal scroll strip with scroll snap, and cards shrink to 64×90px.

Lobby:

```
┌────────────────────────────────────────────┐
│  [fanned 5-card hand illustration]         │
│  Estimate stories together, reveal at once.│
│  ┌ Start a room ───────────────┐           │
│  │ Your name  [            ]   │           │
│  │ Room name  [            ]   │           │
│  │ [ Start a room ] (berry)    │           │
│  └─────────────────────────────┘           │
│  Have a code?  [ABC123] [Join]  ← secondary │
└────────────────────────────────────────────┘
```

When the page is opened from `/room/[id]`, the lobby shows a single "Join Sprint 42 Planning" form with only the name field.

### D3. Review against the brief: what changed from the first draft

- **First instinct**: keep the dark background and swap the accent to Pokéball red. That's the "near-black with one bright accent" default. **Changed** to the bright meadow-on-paper scheme because a daytime work tool shared on calls reads better light, and grass ties to the subject.
- **Considered** casino green felt for the table. That's a poker cliché with no link to this app's creatures. **Reframed** as a mown meadow with stripe texture (a CSS `repeating-linear-gradient` at a 4% luminance step). It's the same "green table" grounding, but specific to this product.
- **Results first draft**: three stat tiles (Average, Min, Max) with big numbers. That's the generic stat-tile treatment. **Changed**: the card closest to the average is placed face-up in the table center as the suggested estimate. The spread is written as one sentence ("Votes ranged from 3 to 8 across 5 people"), with the distribution bars below it. Consensus places the agreed card on the table with the line "Everyone picked 5".
- **Removed**: emoji icons, ALL-CAPS panel titles, the "Create a room · Share the code · …" middle-dot strapline, and `→` suffixes.

### D4. Reveal sequence, the single orchestrated animation

When `currentStory.revealed` flips to true, the table adds `.is-revealed`. Each seat card has `--i` (seat index), and `transform: rotateY(180deg)` runs with `transition-delay: calc(var(--i) * 70ms)`, capped at 700ms total. Results fade in 150ms after the last flip.

Under `prefers-reduced-motion: reduce`, transitions are removed: cards show face-up immediately and results appear without a fade.

Alternatives considered: Framer Motion was rejected as a new dependency for one effect. The Web Animations API was rejected because CSS transitions driven by state are enough and easier to reduce.

### D5. Card hand semantics

- `Hand` renders `<div role="toolbar" aria-label="Your cards">` with one `<button aria-pressed>` per card.
- Roving tabindex: Tab enters the hand on the selected card (or the first card), Left/Right/Home/End move focus, and Enter/Space votes.
- Disabled state (no story, or revealed) sets `aria-disabled="true"` and keeps the cards focusable, so screen-reader users still hear why.
- The accessible name is `"Pikachu, 5 points"`.
- Rejected: number-key shortcuts. Multi-digit values (13, 21, 34) and `?`/`∞` make the mapping ambiguous.

### D6. Action feedback and optimistic vote

- `roomAction()` returns `{ ok, error }`.
- `Room` keeps `pendingVote` for an optimistic selection, which is cleared when Pusher state arrives or reverted on failure.
- Errors show in a single `role="status"` line under the story bar ("Couldn't save your vote. Check your connection and pick again.") and clear on the next successful action.
- Copy invite link uses the same line: "Link copied".

### D7. Styling architecture

- Keep the single global stylesheet, rewritten. It's organized as tokens, then base, then one section per component. Classes stay flat and BEM-ish (`.seat`, `.seat__card`, `.seat--you`) to avoid specificity fights.
- All inline `style={{}}` blocks move to classes. The exceptions are the CSS custom properties `--card-color` and `--i`.
- Alternatives considered:
  - **Tailwind**: rejected. It adds a dependency and a full markup rewrite for a 6-component app.
  - **CSS Modules**: viable, but a single token-driven file is simpler to review in one pass. It can be revisited later.

### D8. Icons

A local `components/Icon.tsx` holds about 8 hand-drawn 24px stroke SVGs: copy, check, history, leave, edit, crown (host), clock (waiting), and a closed-card glyph for "voted". They use `currentColor` and are `aria-hidden` when paired with text.

## Risks / Trade-offs

- **[Risk]** Large layout change confuses returning users. → **Mitigation**: same flows and same order (story, vote, reveal, next). Only presentation moves.
- **[Risk]** Seat rows get crowded at 15+ players. → **Mitigation**: rows wrap. Above 12 players, seats switch to a compact name-plus-dot mode.
- **[Risk]** External sprite URLs cause layout shift. → **Mitigation**: explicit `width`/`height` on every `<img>` and a fixed art window size.
- **[Risk]** Optimistic vote diverges from server state. → **Mitigation**: server state always wins on the next Pusher update, and failures revert explicitly.
- **[Trade-off]** Light-by-default changes the established dark look. Dark remains available via the OS setting.

## Migration Plan

This is a presentation-only change, shipped in one deploy. Rollback is reverting the commit, since no data or API changes are involved. Verify with `npm run build`, the existing Jest suite, and a manual pass:
- Two browsers in one room: vote, reveal, vote again, next story.
- A 360px viewport.
- Keyboard only.
- Reduced motion on.

## Open Questions

- Should copy move to Spanish, or become bilingual? Assumed English, as today.
- Keep "trainer" vocabulary for participants? Assumed yes in light doses ("5 trainers at the table"). Roles use plain words ("Host").
