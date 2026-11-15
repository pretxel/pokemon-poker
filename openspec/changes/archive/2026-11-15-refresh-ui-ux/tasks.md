## 1. Foundation: tokens, fonts, icons

- [x] 1.1 Swap Syne/Manrope for Bricolage Grotesque (variable, `opsz` + `wdth` axes) and Atkinson Hyperlegible (400/700) via `next/font/google` in `app/layout.tsx`, exposed as `--font-display` / `--font-body`
- [x] 1.2 Rewrite the top of `app/globals.css`:
  - light tokens on `:root` (`--paper`, `--ink`, `--meadow`, `--meadow-deep`, `--berry`, `--sun`, `--card`, `--line`), plus type scale, radii, sticker shadows and motion tokens
  - dark overrides under `@media (prefers-color-scheme: dark)`
- [x] 1.3 Remove the aurora `body::before/::after` orbs and their keyframes, and set the base `body`, headings, `:focus-visible` ring and a global `prefers-reduced-motion: reduce` block
- [x] 1.4 Restyle shared primitives (`.btn` primary/secondary/ghost, `.field`, `.input`, `.status-line`) with sentence-case labels and no `text-transform: uppercase`
- [x] 1.5 Create `components/Icon.tsx` with copy, check, history, leave, edit, crown, clock and card-back SVGs (`currentColor`, `aria-hidden` by default)
- [x] 1.6 Restyle the site footer in `app/layout.tsx` to the new tokens, replacing the emoji heart with text or an icon
- [x] 1.7 Verify the contrast of every token pair in both schemes (body text ≥ 4.5:1, large numerals and UI borders ≥ 3:1) and adjust hex values if any fail

## 2. Room action plumbing

- [x] 2.1 Make `roomAction()` in `components/Room.tsx` return `{ ok, error }`, catching network failures
- [x] 2.2 Add a room status line (`role="status"`) with set and clear helpers, used for "Link copied" and the per-action failure messages from the spec
- [x] 2.3 Add a `pendingVote` optimistic selection: set it on click, clear it when a Pusher update arrives, and revert it with an error on failure

## 3. Card component and hand

- [x] 3.1 Rebuild `PokemonCard.tsx` as a `<button>`:
  - `aria-pressed`, `aria-disabled` and the accessible name "Name, N points"
  - a fixed art window tinted by `--card-color`, and a sprite `<img>` with explicit width and height
  - the value in display type at `wdth 75` / weight 800
- [x] 3.2 Add a `size` prop (hand, seat, hero, result) so the same card renders at each size, plus a `faceDown` state with the card-back design
- [x] 3.3 Create `components/Hand.tsx`:
  - a `role="toolbar"` with roving tabindex (Left/Right/Home/End, Enter/Space)
  - a fanned sticky dock where the selected card lifts with a `--sun` outline
  - a scroll-snap strip below 600px

## 4. Table, seats and reveal

- [x] 4.1 Create `components/Table.tsx`:
  - a meadow surface with the mown-stripe `repeating-linear-gradient`
  - top and bottom seat rows, odd and even indexes, each wrapping with flex
- [x] 4.2 Replace `PlayerList.tsx` with seat rendering:
  - avatar initial, name, Host and You markers
  - a waiting, voted (face-down) or revealed (face-up) card state
  - a compact mode above 12 players
- [x] 4.3 Table center before reveal: show "N of M voted" or "Everyone voted", and for the host the berry "Reveal cards" button, disabled with no votes
- [x] 4.4 Implement the reveal: `.is-revealed` with `--i` stagger (70ms per seat, total delay capped at 700ms), results fading in after the last flip, and no motion under reduced motion

## 5. Results and round controls

- [x] 5.1 Rework `VoteResults.tsx` to render inside the table center:
  - the closest-to-average card as the suggested estimate
  - the spread sentence
  - distribution bars with voter names
  - consensus as "Everyone picked X"
  - the non-numeric-only case with no suggestion
- [x] 5.2 Host controls after reveal: "Vote again" and "Next story". Non-host participants see "Waiting for the host to start the next round"

## 6. Room shell: header, story bar, history

- [x] 6.1 Rebuild the room header with the room name, code, "Copy invite link", History and Leave, collapsing to a menu below 600px
- [x] 6.2 Create `components/StoryBar.tsx`:
  - the story title in display type
  - inline set and edit for the host
  - "Waiting for the host to pick a story" for participants
- [x] 6.3 Create `components/HistoryDrawer.tsx`:
  - newest-first stories with averages, and the empty-state copy
  - closes on Escape or the close button, and returns focus to the History control
- [x] 6.4 Recompose `Room.tsx` from the header, StoryBar, Table and Hand, removing every inline `style={{}}`, and rename "Admin" to "Host" across the UI

## 7. Lobby

- [x] 7.1 Rebuild `Home.tsx`:
  - a hero with a fanned 5-card deck (decorative `alt=""`) and the one-line description
  - "Start a room" as the primary form, with "Have a code?" as the secondary form
- [x] 7.2 Invite-link mode: when `initialRoomId` is set, show only the name field and "Join room CODE", plus a "Start a different room instead" link
- [x] 7.3 Loading labels ("Starting…", "Joining…"), plus inline errors per the spec (room not found moves focus to the code field, network failure) that clear on edit
- [x] 7.4 Remove the emoji, the Pokéball SVG logo, the middle-dot strapline and the inline styles from the lobby

## 8. Cleanup and verification

- [x] 8.1 Delete unused CSS rules left from the old theme, and confirm no `text-transform: uppercase` and no emoji icons remain (grep)
- [x] 8.2 Run `npm run build` and `npm test`, and confirm both pass
- [ ] 8.3 Manual pass in two browsers:
  - create, join via invite link, set story, vote, reveal, vote again, next story, history, leave
- [ ] 8.4 Check the 360px and 1440px viewports, keyboard-only voting, OS dark mode and reduced motion, and take screenshots of the lobby, room before reveal, and room after reveal for review
