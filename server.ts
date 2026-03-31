import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import type { RoomState, Player, CurrentStory, SavedStory } from './types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT ?? '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ──────────────────────────────────────────────
// In-memory room store (same data model as server.js)
// ──────────────────────────────────────────────

interface InMemoryStory {
  name: string;
  votes: Map<string, string>;
  revealed: boolean;
}

interface InMemoryRoom {
  id: string;
  name: string;
  createdAt: string;
  players: Map<string, Player>;
  currentStory: InMemoryStory;
  stories: SavedStory[];
}

const rooms = new Map<string, InMemoryRoom>();

function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getRoomState(room: InMemoryRoom): RoomState {
  const players: Player[] = [];
  for (const [, player] of room.players) {
    players.push({ ...player });
  }

  const currentStory: CurrentStory | null = room.currentStory?.name
    ? {
        name: room.currentStory.name,
        revealed: room.currentStory.revealed,
        votes: Object.fromEntries(room.currentStory.votes),
      }
    : null;

  return {
    id: room.id,
    name: room.name,
    createdAt: room.createdAt,
    players,
    currentStory,
    stories: room.stories,
  };
}

function findRoomBySocket(socketId: string): InMemoryRoom | null {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) return room;
  }
  return null;
}

// ──────────────────────────────────────────────
// Bootstrap Next.js + Socket.io
// ──────────────────────────────────────────────

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create a new room
    socket.on('create-room', ({ roomName, playerName }: { roomName: string; playerName: string }) => {
      if (!roomName || !playerName) {
        socket.emit('error', { message: 'Room name and player name are required.' });
        return;
      }

      let roomId = generateRoomId();
      while (rooms.has(roomId)) roomId = generateRoomId();

      const player: Player = {
        id: socket.id,
        name: playerName.trim(),
        isAdmin: true,
        vote: null,
      };

      const room: InMemoryRoom = {
        id: roomId,
        name: roomName.trim(),
        createdAt: new Date().toISOString(),
        players: new Map([[socket.id, player]]),
        currentStory: { name: '', votes: new Map(), revealed: false },
        stories: [],
      };

      rooms.set(roomId, room);
      socket.join(roomId);
      console.log(`Room created: ${roomId} by ${playerName}`);

      socket.emit('room-joined', { roomId, playerId: socket.id, room: getRoomState(room) });
    });

    // Join an existing room
    socket.on('join-room', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
      if (!roomId || !playerName) {
        socket.emit('error', { message: 'Room code and player name are required.' });
        return;
      }

      const room = rooms.get(roomId.toUpperCase());
      if (!room) {
        socket.emit('error', { message: `Room "${roomId}" not found. Check the code and try again.` });
        return;
      }

      const player: Player = {
        id: socket.id,
        name: playerName.trim(),
        isAdmin: false,
        vote: null,
      };

      room.players.set(socket.id, player);
      socket.join(room.id);
      console.log(`Player ${playerName} joined room ${roomId}`);

      socket.emit('room-joined', { roomId: room.id, playerId: socket.id, room: getRoomState(room) });
      socket.to(room.id).emit('room-updated', getRoomState(room));
    });

    // Set current story (admin only)
    socket.on('set-story', ({ storyName }: { storyName: string }) => {
      const room = findRoomBySocket(socket.id);
      if (!room) { socket.emit('error', { message: 'You are not in a room.' }); return; }

      const player = room.players.get(socket.id);
      if (!player?.isAdmin) { socket.emit('error', { message: 'Only admins can set the story.' }); return; }

      room.currentStory = { name: storyName.trim(), votes: new Map(), revealed: false };
      for (const [, p] of room.players) p.vote = null;

      io.to(room.id).emit('room-updated', getRoomState(room));
    });

    // Submit a vote
    socket.on('vote', ({ value }: { value: string }) => {
      const room = findRoomBySocket(socket.id);
      if (!room) { socket.emit('error', { message: 'You are not in a room.' }); return; }

      if (!room.currentStory?.name || room.currentStory.revealed) {
        socket.emit('error', { message: 'Voting is not currently active.' });
        return;
      }

      const player = room.players.get(socket.id);
      if (!player) return;

      player.vote = value;
      room.currentStory.votes.set(socket.id, value);
      io.to(room.id).emit('room-updated', getRoomState(room));
    });

    // Reveal votes (admin only)
    socket.on('reveal-votes', () => {
      const room = findRoomBySocket(socket.id);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player?.isAdmin) { socket.emit('error', { message: 'Only admins can reveal votes.' }); return; }

      if (room.currentStory) room.currentStory.revealed = true;
      io.to(room.id).emit('room-updated', getRoomState(room));
    });

    // Reset round (admin only)
    socket.on('reset-round', () => {
      const room = findRoomBySocket(socket.id);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player?.isAdmin) { socket.emit('error', { message: 'Only admins can reset the round.' }); return; }

      if (room.currentStory) {
        room.currentStory.votes = new Map();
        room.currentStory.revealed = false;
      }
      for (const [, p] of room.players) p.vote = null;

      io.to(room.id).emit('room-updated', getRoomState(room));
    });

    // Save story to history (admin only)
    socket.on('save-story', () => {
      const room = findRoomBySocket(socket.id);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player?.isAdmin) { socket.emit('error', { message: 'Only admins can save the story.' }); return; }

      if (room.currentStory?.name) {
        const numericVotes: number[] = [];
        for (const [, vote] of room.currentStory.votes) {
          const num = parseFloat(vote);
          if (!isNaN(num)) numericVotes.push(num);
        }
        const average =
          numericVotes.length > 0
            ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
            : null;

        room.stories.push({
          name: room.currentStory.name,
          votes: Object.fromEntries(room.currentStory.votes),
          average,
          savedAt: new Date().toISOString(),
        });
      }

      room.currentStory = { name: '', votes: new Map(), revealed: false };
      for (const [, p] of room.players) p.vote = null;

      io.to(room.id).emit('room-updated', getRoomState(room));
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const room = findRoomBySocket(socket.id);
      if (!room) return;

      const wasAdmin = room.players.get(socket.id)?.isAdmin ?? false;
      room.players.delete(socket.id);
      room.currentStory?.votes.delete(socket.id);

      if (room.players.size === 0) {
        rooms.delete(room.id);
        console.log(`Room ${room.id} deleted (empty)`);
        return;
      }

      if (wasAdmin) {
        const [, nextPlayer] = room.players.entries().next().value as [string, Player];
        nextPlayer.isAdmin = true;
        console.log(`Admin transferred to ${nextPlayer.name} in room ${room.id}`);
      }

      io.to(room.id).emit('room-updated', getRoomState(room));
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Pokemon Poker ready on http://${hostname}:${port}`);
  });
});
