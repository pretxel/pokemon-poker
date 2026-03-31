'use client';

import { useState } from 'react';
import socket from '@/lib/socket';

function PokeballSVG() {
  return (
    <svg viewBox="0 0 100 100" className="home-pokeball-svg">
      <circle cx="50" cy="50" r="48" fill="none" stroke="#111" strokeWidth="3" />
      <path d="M2 50 Q2 2 50 2 Q98 2 98 50 Z" fill="#CC0000" />
      <path d="M2 50 Q2 98 50 98 Q98 98 98 50 Z" fill="white" />
      <rect x="2" y="46" width="96" height="8" fill="#111" />
      <circle cx="50" cy="50" r="13" fill="white" stroke="#111" strokeWidth="3" />
      <circle cx="50" cy="50" r="7" fill="#e8e8e8" />
    </svg>
  );
}

interface HomeProps {
  error: string | null;
  clearError: () => void;
  initialRoomId?: string;
}

export default function Home({ error, clearError, initialRoomId }: HomeProps) {
  const [createName, setCreateName] = useState('');
  const [createRoom, setCreateRoom] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState(initialRoomId ?? '');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim() || !createRoom.trim()) return;
    setLoading('create');
    socket.emit('create-room', { roomName: createRoom.trim(), playerName: createName.trim() });
    setTimeout(() => setLoading(null), 4000);
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinName.trim() || !joinCode.trim()) return;
    setLoading('join');
    socket.emit('join-room', { roomId: joinCode.trim().toUpperCase(), playerName: joinName.trim() });
    setTimeout(() => setLoading(null), 4000);
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-logo">
          <PokeballSVG />
          <h1 className="home-title">Pokemon Poker</h1>
        </div>
        <p className="home-subtitle">Scrum planning estimation with your favorite Pokemon</p>
      </div>

      {error && (
        <div
          className="alert alert-error fade-in"
          style={{ marginBottom: 20, maxWidth: 700, width: '100%' }}
        >
          <span>⚠️</span>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: '1.1rem',
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="home-grid">
        {/* Create Room Panel */}
        <div className="home-panel">
          <div className="home-panel-title">
            <span className="home-panel-icon">✨</span>
            Create Room
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="create-name">Your Name</label>
              <input
                id="create-name"
                className="form-control"
                placeholder="Ash Ketchum"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                maxLength={24}
                autoComplete="off"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="create-room">Room Name</label>
              <input
                id="create-room"
                className="form-control"
                placeholder="Sprint 42 Planning"
                value={createRoom}
                onChange={(e) => setCreateRoom(e.target.value)}
                maxLength={40}
                autoComplete="off"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading === 'create' || !createName.trim() || !createRoom.trim()}
            >
              {loading === 'create' ? (
                <><span className="spin" style={{ display: 'inline-block' }}>⚽</span>Creating…</>
              ) : (
                <>🏠 Create Room</>
              )}
            </button>
          </form>
        </div>

        {/* Join Room Panel */}
        <div className="home-panel">
          <div className="home-panel-title">
            <span className="home-panel-icon">🚪</span>
            Join Room
          </div>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="join-name">Your Name</label>
              <input
                id="join-name"
                className="form-control"
                placeholder="Misty"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                maxLength={24}
                autoComplete="off"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="join-code">Room Code</label>
              <input
                id="join-code"
                className="form-control code-input"
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary btn-full btn-lg"
              disabled={loading === 'join' || !joinName.trim() || joinCode.length < 6}
            >
              {loading === 'join' ? (
                <><span className="spin" style={{ display: 'inline-block' }}>⚽</span>Joining…</>
              ) : (
                <>🚶 Join Room</>
              )}
            </button>
          </form>
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          maxWidth: 700,
          width: '100%',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.28)',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
        }}
      >
        Create a room · Share the code · Pick your Pokemon · Reveal together
      </div>
    </div>
  );
}
