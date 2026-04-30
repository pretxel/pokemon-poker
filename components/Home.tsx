'use client';

import { useState } from 'react';
import type { RoomState } from '@/types';

function PokeballSVG() {
  return (
    <svg viewBox="0 0 100 100" className="home-pokeball-svg" aria-hidden="true">
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
  onJoined: (data: { roomId: string; playerId: string; room: RoomState }) => void;
  initialRoomId?: string;
}

export default function Home({ onJoined, initialRoomId }: HomeProps) {
  const [createName, setCreateName] = useState('');
  const [createRoom, setCreateRoom] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState(initialRoomId ?? '');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim() || !createRoom.trim()) return;
    setLoading('create');
    setError(null);
    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: createRoom.trim(), playerName: createName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create room.'); return; }
      onJoined(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinName.trim() || !joinCode.trim()) return;
    setLoading('join');
    setError(null);
    try {
      const res = await fetch('/api/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: joinCode.trim().toUpperCase(), playerName: joinName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to join room.'); return; }
      onJoined(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  const hasInitialCode = Boolean(initialRoomId);

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-logo">
          <PokeballSVG />
          <h1 className="home-title">
            Pokémon<span className="accent"> Poker<span className="accent-dot">.</span></span>
          </h1>
        </div>
        <p className="home-subtitle">
          Honest scrum estimates, with Pokémon as your point scale.
        </p>
      </div>

      {error && (
        <div
          className="alert alert-error fade-in"
          role="alert"
          style={{ marginBottom: 20, maxWidth: 700, width: '100%' }}
        >
          <span aria-hidden="true">⚠</span>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: '1.2rem',
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
            <span className="display-italic">Start a session</span>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="create-name">Your name</label>
              <input
                id="create-name"
                className="form-control"
                placeholder="Ash Ketchum"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                maxLength={24}
                autoComplete="off"
                autoFocus={!hasInitialCode}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="create-room">Room name</label>
              <input
                id="create-room"
                className="form-control"
                placeholder="Sprint 42 planning"
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
                <><span className="spin">◐</span>Creating…</>
              ) : (
                <>Create room</>
              )}
            </button>
          </form>
        </div>

        {/* Join Room Panel */}
        <div className="home-panel">
          <div className="home-panel-title">
            <span className="display-italic">Join a session</span>
          </div>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="join-name">Your name</label>
              <input
                id="join-name"
                className="form-control"
                placeholder="Misty"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                maxLength={24}
                autoComplete="off"
                autoFocus={hasInitialCode}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="join-code">Room code</label>
              <input
                id="join-code"
                className="form-control code-input"
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
                required
                aria-describedby="join-code-hint"
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary btn-full btn-lg"
              disabled={loading === 'join' || !joinName.trim() || joinCode.length < 6}
            >
              {loading === 'join' ? (
                <><span className="spin">◐</span>Joining…</>
              ) : (
                <>Join room</>
              )}
            </button>
          </form>
        </div>
      </div>

      <div
        id="join-code-hint"
        style={{
          marginTop: 40,
          maxWidth: 700,
          width: '100%',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.34)',
          fontSize: '0.86rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
        }}
      >
        Create · share the code · pick a Pokémon · reveal together.
      </div>
    </div>
  );
}
