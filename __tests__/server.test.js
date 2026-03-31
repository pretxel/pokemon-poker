const http = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');

// We need a fresh server per test suite, so we replicate the setup
// rather than importing server.js (which shares global state).

let httpServer;
let io;
let rooms;

function createTestServer() {
  const express = require('express');
  const app = express();
  const srv = http.createServer(app);
  const ioServer = new Server(srv, { cors: { origin: '*' } });
  const roomsMap = new Map();

  // Copy server logic — require the real module to get the handlers registered
  // Instead, we load the actual server module and use its exports
  return { server: srv, io: ioServer, rooms: roomsMap };
}

// Helper: connect a client socket to the test server
function connectClient(port) {
  return Client(`http://localhost:${port}`, {
    transports: ['websocket'],
    forceNew: true,
  });
}

// Helper: wait for an event with a timeout
function waitForEvent(socket, event, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for "${event}"`)), timeout);
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

// We'll use the actual server.js module. To avoid port conflicts,
// we start it on a dynamic port.
let serverInstance;
let serverPort;

beforeAll((done) => {
  // Set a random port to avoid conflicts
  const { server: srv } = require('../server');
  serverInstance = srv;
  serverInstance.listen(0, () => {
    serverPort = serverInstance.address().port;
    done();
  });
});

afterAll((done) => {
  serverInstance.close(done);
});

describe('Pokemon Poker Server', () => {
  let client1;
  let client2;

  afterEach((done) => {
    // Disconnect all clients after each test
    const clients = [client1, client2].filter((c) => c && c.connected);
    let remaining = clients.length;
    if (remaining === 0) return done();
    clients.forEach((c) => {
      c.on('disconnect', () => {
        remaining--;
        if (remaining === 0) done();
      });
      c.disconnect();
    });
  });

  describe('create-room', () => {
    test('should create a room and return room state', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Test Room', playerName: 'Alice' });
      const data = await waitForEvent(client1, 'room-joined');

      expect(data.roomId).toMatch(/^[A-Z0-9]{6}$/);
      expect(data.playerId).toBeDefined();
      expect(data.room.name).toBe('Test Room');
      expect(data.room.players).toHaveLength(1);
      expect(data.room.players[0].name).toBe('Alice');
      expect(data.room.players[0].isAdmin).toBe(true);
    });

    test('should emit error if roomName is missing', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: '', playerName: 'Alice' });
      const data = await waitForEvent(client1, 'error');

      expect(data.message).toMatch(/required/i);
    });

    test('should emit error if playerName is missing', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Room', playerName: '' });
      const data = await waitForEvent(client1, 'error');

      expect(data.message).toMatch(/required/i);
    });
  });

  describe('join-room', () => {
    test('should allow a second player to join an existing room', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Join Test', playerName: 'Alice' });
      const createData = await waitForEvent(client1, 'room-joined');
      const roomId = createData.roomId;

      client2 = connectClient(serverPort);
      await waitForEvent(client2, 'connect');

      const roomUpdatePromise = waitForEvent(client1, 'room-updated');
      client2.emit('join-room', { roomId, playerName: 'Bob' });

      const joinData = await waitForEvent(client2, 'room-joined');
      expect(joinData.room.players).toHaveLength(2);
      expect(joinData.room.players[1].name).toBe('Bob');
      expect(joinData.room.players[1].isAdmin).toBe(false);

      // The first player should get a room-updated event
      const updateData = await roomUpdatePromise;
      expect(updateData.players).toHaveLength(2);
    });

    test('should emit error for non-existent room', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('join-room', { roomId: 'ZZZZZZ', playerName: 'Alice' });
      const data = await waitForEvent(client1, 'error');

      expect(data.message).toMatch(/not found/i);
    });

    test('should emit error if roomId is missing', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('join-room', { roomId: '', playerName: 'Alice' });
      const data = await waitForEvent(client1, 'error');

      expect(data.message).toMatch(/required/i);
    });

    test('should be case-insensitive for room ID', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Case Test', playerName: 'Alice' });
      const createData = await waitForEvent(client1, 'room-joined');
      const roomId = createData.roomId.toLowerCase();

      client2 = connectClient(serverPort);
      await waitForEvent(client2, 'connect');

      client2.emit('join-room', { roomId, playerName: 'Bob' });
      const joinData = await waitForEvent(client2, 'room-joined');

      expect(joinData.room.players).toHaveLength(2);
    });
  });

  describe('vote', () => {
    test('should allow a player to submit a vote', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Vote Test', playerName: 'Alice' });
      await waitForEvent(client1, 'room-joined');

      client1.emit('vote', { value: 'Pikachu' });
      const data = await waitForEvent(client1, 'room-updated');

      expect(data.players[0].vote).toBe('Pikachu');
      expect(data.currentStory.votes[client1.id]).toBe('Pikachu');
    });

    test('should allow multiple players to vote', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Multi Vote', playerName: 'Alice' });
      const createData = await waitForEvent(client1, 'room-joined');
      const roomId = createData.roomId;

      client2 = connectClient(serverPort);
      await waitForEvent(client2, 'connect');

      client2.emit('join-room', { roomId, playerName: 'Bob' });
      await waitForEvent(client2, 'room-joined');
      // Consume the room-updated from join
      await waitForEvent(client1, 'room-updated');

      client1.emit('vote', { value: 'Charmander' });
      // Wait for both clients to receive the update from client1's vote
      await waitForEvent(client1, 'room-updated');
      await waitForEvent(client2, 'room-updated');

      client2.emit('vote', { value: 'Bulbasaur' });
      // Wait for client1 to receive the update (has both votes)
      const data = await waitForEvent(client1, 'room-updated');

      expect(data.currentStory.votes[client1.id]).toBe('Charmander');
      expect(data.currentStory.votes[client2.id]).toBe('Bulbasaur');
    });

    test('should reject vote when votes are revealed', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Revealed Vote', playerName: 'Alice' });
      await waitForEvent(client1, 'room-joined');

      client1.emit('vote', { value: 'Pikachu' });
      await waitForEvent(client1, 'room-updated');

      client1.emit('reveal-votes');
      await waitForEvent(client1, 'room-updated');

      client1.emit('vote', { value: 'Eevee' });
      const errorData = await waitForEvent(client1, 'error');

      expect(errorData.message).toMatch(/not currently active/i);
    });
  });

  describe('reveal-votes', () => {
    test('should reveal votes when admin requests', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Reveal Test', playerName: 'Alice' });
      await waitForEvent(client1, 'room-joined');

      client1.emit('vote', { value: 'Pikachu' });
      await waitForEvent(client1, 'room-updated');

      client1.emit('reveal-votes');
      const data = await waitForEvent(client1, 'room-updated');

      expect(data.currentStory.revealed).toBe(true);
    });

    test('should reject reveal from non-admin', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Reveal Deny', playerName: 'Alice' });
      const createData = await waitForEvent(client1, 'room-joined');
      const roomId = createData.roomId;

      client2 = connectClient(serverPort);
      await waitForEvent(client2, 'connect');

      client2.emit('join-room', { roomId, playerName: 'Bob' });
      await waitForEvent(client2, 'room-joined');

      client2.emit('reveal-votes');
      const errorData = await waitForEvent(client2, 'error');

      expect(errorData.message).toMatch(/only admins/i);
    });
  });

  describe('reset-round', () => {
    test('should clear votes and set revealed to false', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Reset Test', playerName: 'Alice' });
      await waitForEvent(client1, 'room-joined');

      client1.emit('vote', { value: 'Pikachu' });
      await waitForEvent(client1, 'room-updated');

      client1.emit('reveal-votes');
      await waitForEvent(client1, 'room-updated');

      client1.emit('reset-round');
      const data = await waitForEvent(client1, 'room-updated');

      expect(data.currentStory.revealed).toBe(false);
      expect(Object.keys(data.currentStory.votes)).toHaveLength(0);
      expect(data.players[0].vote).toBeNull();
    });

    test('should reject reset from non-admin', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Reset Deny', playerName: 'Alice' });
      const createData = await waitForEvent(client1, 'room-joined');
      const roomId = createData.roomId;

      client2 = connectClient(serverPort);
      await waitForEvent(client2, 'connect');

      client2.emit('join-room', { roomId, playerName: 'Bob' });
      await waitForEvent(client2, 'room-joined');

      client2.emit('reset-round');
      const errorData = await waitForEvent(client2, 'error');

      expect(errorData.message).toMatch(/only admins/i);
    });

    test('should allow voting again after reset', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Re-vote Test', playerName: 'Alice' });
      await waitForEvent(client1, 'room-joined');

      client1.emit('vote', { value: 'Pikachu' });
      await waitForEvent(client1, 'room-updated');

      client1.emit('reveal-votes');
      await waitForEvent(client1, 'room-updated');

      client1.emit('reset-round');
      await waitForEvent(client1, 'room-updated');

      // Should be able to vote again
      client1.emit('vote', { value: 'Eevee' });
      const data = await waitForEvent(client1, 'room-updated');

      expect(data.players[0].vote).toBe('Eevee');
      expect(data.currentStory.votes[client1.id]).toBe('Eevee');
    });
  });

  describe('disconnect', () => {
    test('should remove player from room on disconnect', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Disconnect Test', playerName: 'Alice' });
      const createData = await waitForEvent(client1, 'room-joined');
      const roomId = createData.roomId;

      client2 = connectClient(serverPort);
      await waitForEvent(client2, 'connect');

      client2.emit('join-room', { roomId, playerName: 'Bob' });
      await waitForEvent(client2, 'room-joined');
      await waitForEvent(client1, 'room-updated');

      // Disconnect client2 and wait for room-updated on client1
      const updatePromise = waitForEvent(client1, 'room-updated');
      client2.disconnect();
      const data = await updatePromise;

      expect(data.players).toHaveLength(1);
      expect(data.players[0].name).toBe('Alice');
    });

    test('should transfer admin when admin disconnects', async () => {
      client1 = connectClient(serverPort);
      await waitForEvent(client1, 'connect');

      client1.emit('create-room', { roomName: 'Admin Transfer', playerName: 'Alice' });
      const createData = await waitForEvent(client1, 'room-joined');
      const roomId = createData.roomId;

      client2 = connectClient(serverPort);
      await waitForEvent(client2, 'connect');

      client2.emit('join-room', { roomId, playerName: 'Bob' });
      await waitForEvent(client2, 'room-joined');
      await waitForEvent(client1, 'room-updated');

      // Disconnect admin (client1) and check that Bob becomes admin
      const updatePromise = waitForEvent(client2, 'room-updated');
      client1.disconnect();
      const data = await updatePromise;

      expect(data.players).toHaveLength(1);
      expect(data.players[0].name).toBe('Bob');
      expect(data.players[0].isAdmin).toBe(true);
    });
  });
});
