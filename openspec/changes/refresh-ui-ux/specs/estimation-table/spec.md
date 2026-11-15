## ADDED Requirements

### Requirement: Room header and invite
The room header SHALL show the room name, the room code, a "Copy invite link" control, a "History" control and a "Leave" control. Copying SHALL place `<origin>/room/<code>` on the clipboard and confirm with "Link copied".

#### Scenario: Copy invite link
- **WHEN** the user activates "Copy invite link"
- **THEN** the invite URL is copied and the status line reads "Link copied" for about 2 seconds

#### Scenario: Narrow header
- **WHEN** the viewport is below 600px
- **THEN** copy, history and leave move into a header menu, and the room name stays visible

### Requirement: Story bar
The system SHALL show the current story in a bar beneath the header. The host SHALL be able to set or edit the story inline, and other participants SHALL see a waiting message when no story is set.

#### Scenario: Host sets a story
- **WHEN** the host types "PROJ-123 Login with SSO" and confirms
- **THEN** every participant's story bar shows that title

#### Scenario: No story yet, participant view
- **WHEN** no story is set and the viewer is not the host
- **THEN** the story bar reads "Waiting for the host to pick a story"

### Requirement: Table with seats
The system SHALL render every participant as a seat around a central table, showing their initial avatar and name, plus a "Host" marker and a "You" marker where applicable. Each seat SHALL show one of three states: waiting (no card), voted (face-down card), or revealed (face-up card showing value and sprite).

#### Scenario: Player votes
- **WHEN** a participant casts a vote before reveal
- **THEN** a face-down card appears at their seat for all participants, without exposing the value

#### Scenario: Large rooms
- **WHEN** more than 12 participants are in the room
- **THEN** seats switch to a compact mode that shows the name and a vote-state indicator

### Requirement: Table center shows progress
Before reveal, the table center SHALL show voting progress as "N of M voted". For the host, it SHALL also show the primary "Reveal cards" button, which is disabled until at least one vote exists.

#### Scenario: Partial votes, host view
- **WHEN** 3 of 5 participants have voted
- **THEN** the center reads "3 of 5 voted" and the "Reveal cards" button is enabled

#### Scenario: All voted
- **WHEN** every participant has voted
- **THEN** the center reads "Everyone voted"

### Requirement: Card hand
The system SHALL render the 11-card deck (0, 1, 2, 3, 5, 8, 13, 21, 34, ?, ∞ with their Pokémon) as a hand docked at the bottom of the room. Each card SHALL be a `button` with `aria-pressed` and an accessible name such as "Pikachu, 5 points". The hand SHALL support arrow-key navigation with a single tab stop.

#### Scenario: Select a card
- **WHEN** the user activates the Pikachu card while a story is set and not revealed
- **THEN** the card lifts and shows the selected style, `aria-pressed` is true, and a vote of `5` is sent

#### Scenario: Keyboard navigation
- **WHEN** focus is in the hand and the user presses Right Arrow
- **THEN** focus moves to the next card, and Enter or Space casts that vote

#### Scenario: Hand disabled
- **WHEN** no story is set, or the cards are revealed
- **THEN** cards have `aria-disabled="true"`, do not send votes, and remain focusable

#### Scenario: Mobile hand
- **WHEN** the viewport is below 600px
- **THEN** the hand is a horizontally scrollable strip with snap points, and the page itself does not scroll horizontally

### Requirement: Optimistic vote with failure feedback
The system SHALL show the user's selection immediately on click. If the vote request fails, it SHALL revert the selection and show an error in the room status line.

#### Scenario: Vote request fails
- **WHEN** the `/api/vote` request returns an error or fails to send
- **THEN** the selection returns to the previous value and the status line reads "Couldn't save your vote. Check your connection and pick again."

#### Scenario: Server state wins
- **WHEN** a room update arrives with a vote value for the user
- **THEN** the hand reflects the server value

### Requirement: Simultaneous reveal
When the host reveals, every seat card SHALL flip face-up in one staggered sequence lasting at most 700ms total, after which results appear in the table center. Under reduced motion, cards and results SHALL appear immediately.

#### Scenario: Reveal with motion
- **WHEN** the host activates "Reveal cards"
- **THEN** all participants see seat cards flip in seat order, and results appear after the last flip

#### Scenario: Reveal with reduced motion
- **WHEN** reduced motion is requested and cards are revealed
- **THEN** cards display face-up and results display with no animation

### Requirement: Results in table center
After reveal, the table center SHALL show:
- the deck card closest to the numeric average, as the suggested estimate
- a one-sentence spread summary (for example, "Votes ranged from 3 to 8 across 5 people")
- a distribution bar per value, with voter names

When all votes match, it SHALL show the agreed card with "Everyone picked <value>".

#### Scenario: Mixed votes
- **WHEN** votes are 3, 5, 5, 8
- **THEN** the center shows the 5 card as the suggested estimate, "Votes ranged from 3 to 8 across 4 people", and bars for 3, 5 (2 voters) and 8

#### Scenario: Consensus
- **WHEN** all votes are 5
- **THEN** the center shows the 5 card and "Everyone picked 5"

#### Scenario: Only non-numeric votes
- **WHEN** all votes are `?` or `∞`
- **THEN** no suggested estimate is shown, and the distribution bars are shown

### Requirement: Host round controls
After reveal, the host SHALL see "Vote again" (resets the current story's votes) and "Next story" (saves the story with its result and clears it). Non-host participants SHALL see "Waiting for the host to start the next round".

#### Scenario: Next story
- **WHEN** the host activates "Next story"
- **THEN** the story is saved to history with its average, and the story bar returns to its empty state

#### Scenario: Participant after reveal
- **WHEN** a non-host views revealed results
- **THEN** no round controls are shown, and the waiting message is shown

### Requirement: History drawer
The system SHALL show saved stories in a drawer opened from the header "History" control, listing the newest first with each story's title and average. The drawer SHALL close with Escape or its close button and SHALL return focus to the History control.

#### Scenario: Open history
- **WHEN** the user activates "History" and 3 stories are saved
- **THEN** a drawer lists the 3 stories, newest first, with their averages

#### Scenario: Empty history
- **WHEN** no stories are saved and the drawer opens
- **THEN** it reads "Finished stories show up here with their estimate"

#### Scenario: Close with Escape
- **WHEN** the drawer is open and the user presses Escape
- **THEN** the drawer closes and focus returns to the History control

### Requirement: Room action failures are visible
Every host action (set story, reveal, vote again, next story) and leave SHALL report failure in the room status line (`role="status"`) with what failed and what to do next.

#### Scenario: Reveal fails
- **WHEN** the reveal request fails
- **THEN** the status line reads "Couldn't reveal the cards. Try again." and the "Reveal cards" button stays available
