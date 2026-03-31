const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// In-memory rooms store
const rooms = new Map();

/**
 * Generate a random 6-character uppercase alphanumeric room ID
 */
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Serialize room state to a plain object (converts Maps to arrays/objects)
 */
function getRoomState(room) {
  const players = [];
  for (const [socketId, player] of room.players) {
    players.push({ ...player });
  }

  const currentStory = room.currentStory
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

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  /**
   * Create a new room
   * Payload: { roomName, playerName }
   */
  socket.on('create-room', ({ roomName, playerName }) => {
    if (!roomName || !playerName) {
      socket.emit('error', { message: 'Room name and player name are required.' });
      return;
    }

    let roomId = generateRoomId();
    // Ensure uniqueness
    while (rooms.has(roomId)) {
      roomId = generateRoomId();
    }

    const player = {
      id: socket.id,
      name: playerName.trim(),
      isAdmin: true,
      vote: null,
    };

    const room = {
      id: roomId,
      name: roomName.trim(),
      createdAt: new Date().toISOString(),
      players: new Map([[socket.id, player]]),
      currentStory: {
        name: '',
        votes: new Map(),
        revealed: false,
      },
      stories: [],
    };

    rooms.set(roomId, room);
    socket.join(roomId);

    console.log(`Room created: ${roomId} by ${playerName}`);

    socket.emit('room-joined', {
      roomId,
      playerId: socket.id,
      room: getRoomState(room),
    });
  });

  /**
   * Join an existing room
   * Payload: { roomId, playerName }
   */
  socket.on('join-room', ({ roomId, playerName }) => {
    if (!roomId || !playerName) {
      socket.emit('error', { message: 'Room code and player name are required.' });
      return;
    }

    const room = rooms.get(roomId.toUpperCase());
    if (!room) {
      socket.emit('error', { message: `Room "${roomId}" not found. Check the code and try again.` });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName.trim(),
      isAdmin: false,
      vote: null,
    };

    room.players.set(socket.id, player);
    socket.join(roomId.toUpperCase());

    console.log(`Player ${playerName} joined room ${roomId}`);

    socket.emit('room-joined', {
      roomId: room.id,
      playerId: socket.id,
      room: getRoomState(room),
    });

    // Broadcast updated room state to all other players
    socket.to(room.id).emit('room-updated', getRoomState(room));
  });

  /**
   * Set current story name (admin only)
   * Payload: { storyName }
   */
  socket.on('set-story', ({ storyName }) => {
    const room = findRoomBySocket(socket.id);
    if (!room) {
      socket.emit('error', { message: 'You are not in a room.' });
      return;
    }

    const player = room.players.get(socket.id);
    if (!player || !player.isAdmin) {
      socket.emit('error', { message: 'Only admins can set the story.' });
      return;
    }

    // Reset votes when story changes
    room.currentStory = {
      name: storyName.trim(),
      votes: new Map(),
      revealed: false,
    };

    // Reset all player votes
    for (const [, p] of room.players) {
      p.vote = null;
    }

    io.to(room.id).emit('room-updated', getRoomState(room));
  });

  /**
   * Submit a vote
   * Payload: { value }
   */
  socket.on('vote', ({ value }) => {
    const room = findRoomBySocket(socket.id);
    if (!room) {
      socket.emit('error', { message: 'You are not in a room.' });
      return;
    }

    if (!room.currentStory || room.currentStory.revealed) {
      socket.emit('error', { message: 'Voting is not currently active.' });
      return;
    }

    const player = room.players.get(socket.id);
    if (!player) return;

    player.vote = value;
    room.currentStory.votes.set(socket.id, value);

    io.to(room.id).emit('room-updated', getRoomState(room));
  });

  /**
   * Reveal all votes (admin only)
   */
  socket.on('reveal-votes', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player || !player.isAdmin) {
      socket.emit('error', { message: 'Only admins can reveal votes.' });
      return;
    }

    if (room.currentStory) {
      room.currentStory.revealed = true;
    }

    io.to(room.id).emit('room-updated', getRoomState(room));
  });

  /**
   * Reset round (admin only) - clear votes for a new vote on the same story
   */
  socket.on('reset-round', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player || !player.isAdmin) {
      socket.emit('error', { message: 'Only admins can reset the round.' });
      return;
    }

    if (room.currentStory) {
      room.currentStory.votes = new Map();
      room.currentStory.revealed = false;
    }

    for (const [, p] of room.players) {
      p.vote = null;
    }

    io.to(room.id).emit('room-updated', getRoomState(room));
  });

  /**
   * Save current story to history and reset for new round (admin only)
   */
  socket.on('save-story', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player || !player.isAdmin) {
      socket.emit('error', { message: 'Only admins can save the story.' });
      return;
    }

    if (room.currentStory && room.currentStory.name) {
      // Compute final vote for the story (average of numeric votes)
      const numericVotes = [];
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

    // Reset for next story
    room.currentStory = {
      name: '',
      votes: new Map(),
      revealed: false,
    };

    for (const [, p] of room.players) {
      p.vote = null;
    }

    io.to(room.id).emit('room-updated', getRoomState(room));
  });

  /**
   * Handle disconnect
   */
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);

    const room = findRoomBySocket(socket.id);
    if (!room) return;

    const wasAdmin = room.players.get(socket.id)?.isAdmin;
    room.players.delete(socket.id);

    // Remove vote if existed
    if (room.currentStory) {
      room.currentStory.votes.delete(socket.id);
    }

    // If no players left, delete room
    if (room.players.size === 0) {
      rooms.delete(room.id);
      console.log(`Room ${room.id} deleted (empty)`);
      return;
    }

    // Transfer admin if needed
    if (wasAdmin && room.players.size > 0) {
      const [, nextPlayer] = room.players.entries().next().value;
      nextPlayer.isAdmin = true;
      console.log(`Admin transferred to ${nextPlayer.name} in room ${room.id}`);
    }

    io.to(room.id).emit('room-updated', getRoomState(room));
  });
});

/**
 * Helper: find which room a socket is in
 */
function findRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) {
      return room;
    }
  }
  return null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Pokemon Poker server running on port ${PORT}`);
  });
}

module.exports = { server, io, rooms };
