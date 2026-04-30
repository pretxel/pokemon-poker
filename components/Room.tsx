'use client';

import { useState, useEffect } from 'react';
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

const SHORTCUTS: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '5': '5',
  '8': '8',
  '13': 'G',
  '21': 'S',
  '34': 'D',
  '?': '?',
  '∞': 'M',
};
const KEY_TO_VALUE: Record<string, string> = Object.fromEntries(
  Object.entries(SHORTCUTS).map(([v, k]) => [k.toLowerCase(), v]),
);

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
  const [toast, setToast] = useState<string | null>(null);

  const { players, currentStory, stories } = room;
  const me = players.find((p) => p.id === playerId);
  const myVote = me ? me.vote : null;
  const revealed = currentStory ? currentStory.revealed : false;
  const hasAnyVote = players.some((p) => p.vote !== null);
  const allVoted = players.length > 0 && players.every((p) => p.vote !== null);
  const votedCount = players.filter((p) => p.vote !== null).length;
  const canVote = !revealed && Boolean(currentStory?.name);

  function handleVote(value: string) {
    if (!canVote) return;
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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function handleCopyCode() {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast('Invite link copied');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleLeave() {
    await roomAction('/api/leave-room', { roomCode: roomId, playerId });
    onLeave();
  }

  // Keyboard shortcuts: number / letter keys cast a vote
  useEffect(() => {
    if (!canVote) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const value = KEY_TO_VALUE[e.key.toLowerCase()];
      if (value) {
        e.preventDefault();
        handleVote(value);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canVote, roomId, playerId]);

  return (
    <div className="room-page">
      {/* Header */}
      <header className="room-header">
        <div className="room-header-left">
          <span className="room-pokeball" aria-hidden="true">⚪</span>
          <span className="room-name">{room.name}</span>
          <div className="room-code-chip">
            {roomId}
            <button
              type="button"
              className="copy-btn"
              onClick={handleCopyCode}
              aria-label="Copy invite link"
              title={copied ? 'Copied!' : 'Copy invite link'}
            >
              {copied ? '✓' : '⧉'}
            </button>
          </div>
        </div>
        <span className="room-player-count">
          {players.length} trainer{players.length !== 1 ? 's' : ''}
        </span>
        {currentStory?.name && !revealed && (
          <span
            className={`header-progress${allVoted ? ' complete' : ''}`}
            aria-live="polite"
          >
            <span className="header-progress-dot" />
            {votedCount} / {players.length} voted
          </span>
        )}
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
            <div className="panel-title">Current story</div>

            {currentStory?.name ? (
              <div className="current-story-name">{currentStory.name}</div>
            ) : (
              <div className="empty-story-state">
                <span className="pulse-dot" aria-hidden="true" />
                <span className="empty-story-state-text">
                  {isAdmin
                    ? 'Set a story below to begin voting.'
                    : 'Waiting for the admin to set a story…'}
                </span>
              </div>
            )}

            {isAdmin && (
              <form className="story-input-row" onSubmit={handleSetStory} style={{ marginTop: 14 }}>
                <input
                  className="form-control"
                  placeholder="Story name or ticket ID (e.g. PROJ-123)"
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  maxLength={80}
                  autoComplete="off"
                  aria-label="Story name"
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
              {revealed
                ? 'Cards revealed'
                : myVote
                ? <>Your vote: <span className="mono" style={{ color: 'var(--yellow)' }}>{myVote}</span></>
                : 'Pick your card'}
            </div>

            <div className="cards-grid">
              {POKEMON_CARDS.map((card, idx) => (
                <PokemonCard
                  key={card.value}
                  card={card}
                  index={idx}
                  shortcut={SHORTCUTS[card.value]}
                  selected={myVote === card.value}
                  disabled={revealed || !currentStory?.name}
                  onSelect={handleVote}
                />
              ))}
            </div>

            {canVote && (
              <div className="kbd-hint-row" aria-hidden="true">
                <span>Tip — press</span>
                <kbd>0</kbd><kbd>1</kbd><kbd>…</kbd><kbd>8</kbd>
                <span>or</span>
                <kbd>G</kbd><kbd>S</kbd><kbd>D</kbd><kbd>?</kbd><kbd>M</kbd>
                <span>to vote</span>
              </div>
            )}

            {!isAdmin && !revealed && currentStory?.name && (
              <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                {myVote
                  ? 'Vote cast — pick another card to change it.'
                  : 'Click a card to cast your vote.'}
              </p>
            )}
            {!isAdmin && revealed && (
              <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.42)', fontSize: '0.9rem' }}>
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
                    Reveal cards
                    {allVoted && players.length > 1 && ' — all voted'}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={handleReset}>
                      Vote again
                    </button>
                    {currentStory?.name && (
                      <button className="btn btn-yellow" onClick={handleSaveStory}>
                        Save &amp; next story
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
                type="button"
                className="history-toggle"
                onClick={() => setHistoryOpen((o) => !o)}
                aria-expanded={historyOpen}
              >
                Story history ({stories.length})
                <span className={`history-chevron${historyOpen ? ' open' : ''}`} aria-hidden="true">▼</span>
              </button>
              {historyOpen && (
                <div className="history-list">
                  {[...stories].reverse().map((story, i) => (
                    <div key={i} className="history-item">
                      <span className="history-story-name">{story.name}</span>
                      {story.average !== null && story.average !== undefined && (
                        <span className="history-avg mono">avg {story.average}</span>
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
              <div
                style={{
                  fontSize: '0.92rem',
                  color: 'rgba(255,255,255,0.65)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {votedCount} / {players.length} voted
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 8,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
                role="progressbar"
                aria-valuenow={votedCount}
                aria-valuemin={0}
                aria-valuemax={players.length}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 4,
                    background: allVoted ? '#22D37A' : 'var(--yellow)',
                    width: `${players.length > 0 ? (votedCount / players.length) * 100 : 0}%`,
                    transition: 'width 0.4s ease, background 0.4s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast" role="status">
          <span aria-hidden="true">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
