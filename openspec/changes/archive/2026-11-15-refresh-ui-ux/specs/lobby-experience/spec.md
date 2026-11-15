## ADDED Requirements

### Requirement: Start a room is the primary lobby action
The lobby SHALL present "Start a room" (your name, room name) as the primary form with the single primary-colored button, and joining by code as a secondary, visually lighter form.

#### Scenario: Default lobby
- **WHEN** a user opens `/`
- **THEN** the "Start a room" form is shown first with a primary button, and a secondary "Have a code?" form with a code field and a "Join" button is shown below it

#### Scenario: Start a room succeeds
- **WHEN** the user submits a name and room name
- **THEN** the system creates the room and opens it with the user as host

### Requirement: Invite link joins with name only
When the lobby is opened from an invite link (`/room/[roomId]`), the system SHALL show a single join form titled with the room's code, asking only for the user's name.

#### Scenario: Open invite link
- **WHEN** a user opens `/room/ABC123` without an active session for that room
- **THEN** the lobby shows one form asking for their name with a "Join room ABC123" button, and no room-code or create-room fields

#### Scenario: Switch to starting a new room
- **WHEN** the invite-link user chooses "Start a different room instead"
- **THEN** the default lobby is shown

### Requirement: Join code input normalization
The join-by-code field SHALL uppercase input and accept exactly 6 characters, and the Join button SHALL stay disabled until a name and a 6-character code are present.

#### Scenario: Lowercase code typed
- **WHEN** the user types `abc123`
- **THEN** the field shows `ABC123`

#### Scenario: Incomplete code
- **WHEN** the code has fewer than 6 characters
- **THEN** the Join button is disabled

### Requirement: Lobby loading and error states
While a create or join request is in flight, the system SHALL disable the submitting button and change its label to a progress form of the same verb ("Starting…", "Joining…"). On failure it SHALL show an inline error next to the form that explains what happened and how to fix it, without apologizing.

#### Scenario: Room not found
- **WHEN** joining fails because the code does not exist
- **THEN** an inline error reads "No room with code ABC123. Check the code with your host." and focus moves to the code field

#### Scenario: Network failure
- **WHEN** the request fails to reach the server
- **THEN** an inline error reads "Couldn't reach the server. Check your connection and try again."

#### Scenario: Dismissing an error
- **WHEN** the user edits any field in the form that errored
- **THEN** the error clears

### Requirement: Lobby hero shows the deck
The lobby hero SHALL show a fanned arrangement of cards from the actual deck, with a one-line plain description of what the app does, instead of a logo mark.

#### Scenario: Lobby hero
- **WHEN** the lobby renders
- **THEN** at least 5 deck cards are displayed in a fan with sprites and point values, and their images have empty `alt` (decorative)
