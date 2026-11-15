## ADDED Requirements

### Requirement: Design tokens drive all styling
The system SHALL define color, typography, radius, shadow and motion values as CSS custom properties on `:root`, and component styles SHALL reference those tokens instead of literal values. Components MUST NOT use inline `style` attributes except to set per-item custom properties (`--card-color`, `--i`).

#### Scenario: Tokens defined on root
- **WHEN** the app stylesheet loads
- **THEN** `:root` defines `--paper`, `--ink`, `--meadow`, `--meadow-deep`, `--berry`, `--sun`, `--card` and `--line`

#### Scenario: No inline layout styles
- **WHEN** any component in `components/` is rendered
- **THEN** no element carries an inline `style` attribute other than custom-property assignments

### Requirement: Light and dark color schemes
The system SHALL render a light scheme by default and SHALL switch to a dark scheme when the operating system reports `prefers-color-scheme: dark`, by redefining the same tokens.

#### Scenario: OS dark mode
- **WHEN** the user's OS is set to dark mode
- **THEN** the page background uses the dark `--paper` value and body text uses the dark `--ink` value

#### Scenario: Default light mode
- **WHEN** the OS reports no preference or light mode
- **THEN** the light token values apply

### Requirement: Typography system
The system SHALL use Bricolage Grotesque for display text (room name, story title, card values) and Atkinson Hyperlegible for body text, labels, inputs and buttons, both loaded via `next/font/google`. Labels and buttons SHALL use sentence case without uppercase transforms.

#### Scenario: Card values use display face
- **WHEN** a card is rendered
- **THEN** its point value is set in Bricolage Grotesque

#### Scenario: No uppercase labels
- **WHEN** the stylesheet is inspected
- **THEN** no label, heading or button rule applies `text-transform: uppercase`

### Requirement: Icon set replaces emoji
The system SHALL render interface icons as inline SVGs from a shared `Icon` component using `currentColor`. Emoji characters MUST NOT be used as interface icons.

#### Scenario: Copy link control
- **WHEN** the room header renders the invite control
- **THEN** it shows an SVG copy icon, not an emoji

#### Scenario: Decorative icons hidden from assistive tech
- **WHEN** an icon is paired with visible text
- **THEN** the icon has `aria-hidden="true"`

### Requirement: Accessibility floor
The system SHALL show a visible focus indicator on every interactive element via `:focus-visible`, SHALL meet WCAG 2.1 AA contrast (4.5:1 for body text, 3:1 for large text and UI boundaries) in both schemes, and SHALL disable non-essential animation and transitions under `prefers-reduced-motion: reduce`.

#### Scenario: Keyboard focus is visible
- **WHEN** a user tabs to any button, input or card
- **THEN** a focus ring of at least 2px is visible around it

#### Scenario: Reduced motion
- **WHEN** the OS requests reduced motion
- **THEN** no element animates position, rotation or scale, and state changes apply instantly

### Requirement: Responsive layout
The system SHALL remain fully usable without horizontal page scrolling from 360px viewport width upward.

#### Scenario: Small phone
- **WHEN** the room is viewed at 360px wide
- **THEN** the page has no horizontal scroll, and every card, seat and control is reachable

### Requirement: No ambient background animation
The system SHALL NOT run continuous decorative animations (such as the former aurora orbs) on the page background.

#### Scenario: Idle page
- **WHEN** the lobby or room is idle with no user action or state change
- **THEN** no element is animating
