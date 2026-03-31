import { io, Socket } from 'socket.io-client';

// Lazy singleton — only created in the browser
let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    // With the custom server, socket.io is on the same origin
    _socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return _socket;
}

// Exported as a proxy so callers can use `socket.emit(...)` directly,
// matching the original client/src/socket.js import style.
const socketProxy = new Proxy({} as Socket, {
  get(_, prop: string) {
    const s = getSocket();
    const value = (s as unknown as Record<string, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(s);
    }
    return value;
  },
});

export default socketProxy;
