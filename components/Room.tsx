'use client';

import { useState } from 'react';
import PokemonCard, { POKEMON_CARDS } from './PokemonCard';
import PlayerList from './PlayerList';
import VoteResults from './VoteResults';
import type { RoomState } from '@/types';

interface RoomProps {
  roomId: string;
  playerId: string;
  playerName: string;
  isAdmin: boolean;
  room: RoomState;
  onLeave: () => void;
}

async function roomAction(path: string, body: Record<string, unknown>) {
  await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export default function Room({ roomId, playerId, isAdmin, room, onLeave }: RoomProps) {
  const [storyInput, setStoryInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { players, currentStory, stories } = room;
  const me = players.find((p) => p.id === playerId);
  const myVote = me ? me.vote : null;
  const revealed = currentStory ? currentStory.revealed : false;
  const hasAnyVote = players.some((p) => p.vote !== null);
  const allVoted = players.length > 0 && players.every((p) => p.vote !== null);

  function handleVote(value: string) {
    if (revealed || !currentStory?.name) return;
    roomAction('/api/vote', { roomCode: roomId, playerId, value });
  }

  function handleSetStory(e: React.FormEvent) {
    e.preventDefault();
    if (!storyInput.trim()) return;
    roomAction('/api/set-story', { roomCode: roomId, playerId, storyName: storyInput.trim() });
    setStoryInput('');
  }

  function handleReveal() {
    roomAction('/api/reveal-votes', { roomCode: roomId, playerId });
  }

  function handleReset() {
    roomAction('/api/reset-round', { roomCode: roomId, playerId });
  }

  function handleSaveStory() {
    roomAction('/api/save-story', { roomCode: roomId, playerId });
    setStoryInput('');
  }

  function handleCopyCode() {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleLeave() {
    await roomAction('/api/leave-room', { roomCode: roomId, playerId });
    onLeave();
  }

  return (
    <div className="room-page">
      {/* Header */}
      <header className="room-header">
        <div className="room-header-left">
          <span className="room-pokeball">⚽</span>
          <span className="room-name">{room.name}</span>
          <div className="room-code-chip">
            {roomId}
            <button
              className="copy-btn"
              onClick={handleCopyCode}
              title={copied ? 'Copied!' : 'Copy room code'}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>
        <span className="room-player-count">
          {players.length} trainer{players.length !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={handleLeave}>
          Leave
        </button>
      </header>

      {/* Body */}
      <div className="room-body">
        {/* Main column */}
        <div className="room-main">
          {/* Current story */}
          <div className="story-section">
            <div className="panel-title">Current Story</div>

            {currentStory?.name ? (
              <div className="current-story-name">{currentStory.name}</div>
            ) : (
              <div className="no-story-text">
                {isAdmin
                  ? 'Set a story below to begin voting'
                  : 'Waiting for the admin to set a story…'}
              </div>
            )}

            {isAdmin && (
              <form className="story-input-row" onSubmit={handleSetStory} style={{ marginTop: 12 }}>
                <input
                  className="form-control"
                  placeholder="Story name or ticket ID (e.g. PROJ-123)"
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  maxLength={80}
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-yellow" disabled={!storyInput.trim()}>
                  Set
                </button>
              </form>
            )}
          </div>

          {/* Voting cards */}
          <div className="voting-section">
            <div className="panel-title">
              {revealed ? 'Cards Revealed' : myVote ? `Your vote: ${myVote}` : 'Pick Your Card'}
            </div>

            <div className="cards-grid">
              {POKEMON_CARDS.map((card) => (
                <PokemonCard
                  key={card.value}
                  card={card}
                  selected={myVote === card.value}
                  disabled={revealed || !currentStory?.name}
                  onSelect={handleVote}
                />
              ))}
            </div>

            {!isAdmin && !revealed && currentStory?.name && (
              <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
                {myVote
                  ? 'Vote cast — click another card to change it.'
                  : 'Click a card to cast your vote!'}
              </p>
            )}
            {!isAdmin && revealed && (
              <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                Waiting for the admin to start the next round…
              </p>
            )}

            {/* Admin controls */}
            {isAdmin && (
              <div className="voting-actions">
                {!revealed ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleReveal}
                    disabled={!hasAnyVote}
                    title={!hasAnyVote ? 'No votes yet' : ''}
                  >
                    🃏 Reveal Cards
                    {allVoted && players.length > 1 && ' — All voted!'}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={handleReset}>
                      🔄 Vote Again
                    </button>
                    {currentStory?.name && (
                      <button className="btn btn-yellow" onClick={handleSaveStory}>
                        💾 Save &amp; Next Story
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          {revealed && <VoteResults players={players} currentStory={currentStory} />}

          {/* Story history */}
          {stories && stories.length > 0 && (
            <div className="history-section">
              <button
                className="history-toggle"
                onClick={() => setHistoryOpen((o) => !o)}
              >
                📜 Story History ({stories.length})
                <span className={`history-chevron${historyOpen ? ' open' : ''}`}>▼</span>
              </button>
              {historyOpen && (
                <div className="history-list">
                  {[...stories].reverse().map((story, i) => (
                    <div key={i} className="history-item">
                      <span className="history-story-name">{story.name}</span>
                      {story.average !== null && story.average !== undefined && (
                        <span className="history-avg">avg {story.average}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="room-sidebar">
          <div className="panel">
            <div className="panel-title">Trainers ({players.length})</div>
            <PlayerList players={players} playerId={playerId} revealed={revealed} />
          </div>

          {currentStory?.name && !revealed && (
            <div className="panel">
              <div className="panel-title">Progress</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {players.filter((p) => p.vote !== null).length} / {players.length} voted
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 8,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 4,
                    background: 'var(--pokemon-green)',
                    width: `${players.length > 0
                      ? (players.filter((p) => p.vote !== null).length / players.length) * 100
                      : 0}%`,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
