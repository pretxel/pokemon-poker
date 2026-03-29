# Pokemon Poker

A real-time scrum planning poker app where team members estimate stories using Pokemon-themed cards instead of plain numbers. Built with Next.js, Socket.io, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript
- **Real-time**: Socket.io 4 (WebSocket communication)
- **Database**: PostgreSQL with Prisma 6 ORM
- **Runtime**: Custom Node.js HTTP server (`server.ts`) serving both Next.js pages and Socket.io connections
- **Sprites**: Loaded from [PokeAPI](https://github.com/PokeAPI/sprites)

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and configure your database:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your `DATABASE_URL`:

   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/pokemon_poker"
   ```

3. Run database migrations:

   ```bash
   npm run db:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

## Pokemon Card Mapping

Each estimation card is represented by a Pokemon, mapped to modified Fibonacci values:

| Points | Pokemon   | Pokedex # |
|--------|-----------|-----------|
| 0      | Magikarp  | #129      |
| 1      | Bulbasaur | #1        |
| 2      | Charmander| #4        |
| 3      | Squirtle  | #7        |
| 5      | Pikachu   | #25       |
| 8      | Eevee     | #133      |
| 13     | Gengar    | #94       |
| 21     | Snorlax   | #143      |
| 34     | Dragonite | #149      |
| ?      | Ditto     | #132      |
| Infinity | Mewtwo    | #150      |

## How It Works

### Room Flow

1. **Create a room** — An admin enters their name and a room name. The server generates a 6-character alphanumeric room code.
2. **Share the code** — Other team members join by entering the room code and their name.
3. **Set a story** — The admin sets a story name or ticket ID for estimation.
4. **Vote** — Each participant picks a Pokemon card. Votes are hidden until revealed.
5. **Reveal** — The admin reveals all votes. The app shows individual votes and computes the average of numeric votes.
6. **Save & continue** — The admin can save the story result to history and move on to the next story, or reset the round to vote again.

### Real-time Communication

All interactions use Socket.io events emitted between the client and the custom Node.js server (`server.ts`):

- `create-room` / `join-room` — Room lifecycle
- `set-story` — Admin sets the current story
- `vote` — Player submits a vote
- `reveal-votes` — Admin reveals all votes
- `reset-round` — Admin clears votes for a re-vote
- `save-story` — Admin saves results to history and starts a new round
- `room-joined` / `room-updated` — Server pushes state to clients

Room state is held in-memory on the server. When all players disconnect, the room is automatically deleted. If the admin disconnects, admin rights transfer to the next player.

## File Structure

```
pokemon_poker/
  app/                  # Next.js app directory (pages & layout)
  components/
    App.tsx             # Root client component, manages view state & socket listeners
    Home.tsx            # Landing page — create or join a room
    Room.tsx            # Main room UI — story, voting cards, admin controls, history
    PokemonCard.tsx     # Card component & POKEMON_CARDS data
    PlayerList.tsx      # Sidebar player list
    VoteResults.tsx     # Vote results display after reveal
  lib/
    socket.ts           # Socket.io client instance
  types/
    index.ts            # Shared TypeScript interfaces (Player, RoomState, etc.)
  prisma/
    schema.prisma       # Database schema (Room, Player, Story, Vote models)
  server.ts             # Custom HTTP server — Next.js + Socket.io
  next.config.ts        # Next.js configuration (PokeAPI image domains)
  __tests__/            # Test files
```

## NPM Scripts

| Script            | Description                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Start the development server                 |
| `npm run build`   | Build the Next.js production bundle          |
| `npm start`       | Start the production server                  |
| `npm test`        | Run tests with Jest                          |
| `npm run db:generate` | Generate Prisma client                  |
| `npm run db:migrate`  | Run Prisma database migrations          |
| `npm run db:studio`   | Open Prisma Studio (database GUI)       |
# pokemon-poker
