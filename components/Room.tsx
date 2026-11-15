'use client';

import { useEffect, useRef, useState } from 'react';
import Hand from './Hand';
import Table from './Table';
import StoryBar from './StoryBar';
import HistoryDrawer from './HistoryDrawer';
import Icon from './Icon';
import type { RoomState } from '@/types';
import { HIDDEN_VOTE } from '@/lib/redact-room';

interface RoomProps {
  roomId: string;
  playerId: string;
  playerName: string;
  isAdmin: boolean;
  room: RoomState;
  onLeave: () => void;
}

type ActionResult = { ok: true } | { ok: false; error: string };

async function roomAction(path: string, body: Record<string, unknown>): Promise<ActionResult> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? `Request failed (${res.status})` };
  } catch {
    return { ok: false, error: 'network' };
  }
}

type Status = { text: string; tone: 'info' | 'error' } | null;

const MESSAGES = {
  vote: "Couldn't save your vote. Check your connection and pick again.",
  story: "Couldn't set the story. Try again.",
  reveal: "Couldn't reveal the cards. Try again.",
  reset: "Couldn't restart the vote. Try again.",
  next: "Couldn't save the story. Try again.",
  leave: "Couldn't leave the room. Try again.",
  copy: "Couldn't copy the link. Copy it from the address bar instead.",
};

export default function Room({ roomId, playerId, isAdmin, room, onLeave }: RoomProps) {
  const [status, setStatus] = useState<Status>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  // Optimistic vote, valid only for the room snapshot it was made against.
  const [pending, setPending] = useState<{ value: string; room: RoomState } | null>(null);
  // The server hides vote values until reveal, so remember our own pick here.
  const [localVote, setLocalVote] = useState<string | null>(null);
  const historyButton = useRef<HTMLButtonElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { players, currentStory, stories } = room;
  const me = players.find((p) => p.id === playerId);
  const serverVote = me ? me.vote : null;
  const myVote =
    pending && pending.room === room ? pending.value
    : serverVote === HIDDEN_VOTE ? localVote
    : serverVote;
  const revealed = currentStory?.revealed ?? false;
  const hasStory = Boolean(currentStory?.name);

  useEffect(() => () => { if (statusTimer.current) clearTimeout(statusTimer.current); }, []);

  function showStatus(next: Status, clearAfterMs?: number) {
    if (statusTimer.current) clearTimeout(statusTimer.current);
    setStatus(next);
    if (clearAfterMs) statusTimer.current = setTimeout(() => setStatus(null), clearAfterMs);
  }

  async function run(path: string, body: Record<string, unknown>, failure: string) {
    const result = await roomAction(path, { roomCode: roomId, playerId, ...body });
    if (result.ok) {
      setStatus((s) => (s?.tone === 'error' ? null : s));
    } else {
      showStatus({ text: failure, tone: 'error' });
    }
    return result.ok;
  }

  async function handleVote(value: string) {
    if (revealed || !hasStory) return;
    const previous = localVote;
    setPending({ value, room });
    setLocalVote(value);
    const ok = await run('/api/vote', { value }, MESSAGES.vote);
    if (!ok) {
      setPending(null);
      setLocalVote(previous);
    }
  }

  function handleSetStory(storyName: string) {
    return run('/api/set-story', { storyName }, MESSAGES.story);
  }

  function handleCopyInvite() {
    setMenuOpen(false);
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(
      () => showStatus({ text: 'Link copied', tone: 'info' }, 2000),
      () => showStatus({ text: MESSAGES.copy, tone: 'error' }),
    );
  }

  async function handleLeave() {
    setMenuOpen(false);
    const ok = await run('/api/leave-room', {}, MESSAGES.leave);
    if (ok) onLeave();
  }

  function handleHistoryClosed() {
    setHistoryOpen(false);
    // On narrow screens the History button lives in the collapsed menu; focus the toggle instead.
    const target = historyButton.current?.offsetParent ? historyButton.current : menuToggle.current;
    target?.focus();
  }

  let hint: string;
  if (!hasStory) hint = 'Your cards unlock when a story is set.';
  else if (revealed) hint = 'Cards are revealed for this story.';
  else if (myVote) hint = 'Your card is down. Pick another to change it.';
  else hint = 'Pick a card to vote.';

  return (
    <div className="room">
      <header className="room-header">
        <div className="room-header__title">
          <h1 className="room-header__name">{room.name}</h1>
          <span className="room-code"><span className="visually-hidden">Room code </span>{roomId}</span>
        </div>

        <button
          ref={menuToggle}
          type="button"
          className="btn btn--ghost btn--sm room-header__menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="room-actions"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={18} /> Menu
        </button>

        <div
          id="room-actions"
          className={`room-header__actions${menuOpen ? ' is-open' : ''}`}
          onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false); }}
        >
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleCopyInvite}>
            <Icon name="copy" size={18} /> Copy invite link
          </button>
          <button
            ref={historyButton}
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => { setMenuOpen(false); setHistoryOpen(true); }}
          >
            <Icon name="history" size={18} /> History{stories.length > 0 ? ` (${stories.length})` : ''}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleLeave}>
            <Icon name="leave" size={18} /> Leave
          </button>
        </div>
      </header>

      <StoryBar story={currentStory?.name || null} isHost={isAdmin} onSetStory={handleSetStory} />

      <p className={`status-line${status?.tone === 'error' ? ' status-line--error' : ''}`} role="status">
        {status?.text}
      </p>

      <Table
        players={players}
        playerId={playerId}
        isHost={isAdmin}
        currentStory={currentStory}
        onReveal={() => run('/api/reveal-votes', {}, MESSAGES.reveal)}
        onVoteAgain={() => run('/api/reset-round', {}, MESSAGES.reset)}
        onNextStory={() => run('/api/save-story', {}, MESSAGES.next)}
      />

      <Hand
        selected={myVote}
        disabled={revealed || !hasStory}
        hint={hint}
        onSelect={handleVote}
      />

      <HistoryDrawer
        open={historyOpen}
        stories={stories ?? []}
        onClose={handleHistoryClosed}
      />
    </div>
  );
}
