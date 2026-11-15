'use client';

import { useRef, useState } from 'react';
import PokemonCard, { POKEMON_CARDS } from './PokemonCard';
import type { RoomState } from '@/types';

const HERO_VALUES = ['1', '3', '5', '8', '13'];
const HERO_LIFT = [14, 4, 0, 4, 14];

const NETWORK_ERROR = "Couldn't reach the server. Check your connection and try again.";

type Joined = { roomId: string; playerId: string; room: RoomState };
type FormKey = 'create' | 'join';

interface HomeProps {
  onJoined: (data: Joined) => void;
  initialRoomId?: string;
}

function DeckFan() {
  const cards = HERO_VALUES.map((v) => POKEMON_CARDS.find((c) => c.value === v)!);
  return (
    <div className="fan" aria-hidden="true">
      {cards.map((card, i) => (
        <span key={card.value} style={{ '--i': i, '--lift': HERO_LIFT[i] } as React.CSSProperties}>
          <PokemonCard card={card} size="hero" />
        </span>
      ))}
    </div>
  );
}

export default function Home({ onJoined, initialRoomId }: HomeProps) {
  const [inviteMode, setInviteMode] = useState(Boolean(initialRoomId));
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState(initialRoomId ?? '');
  const [loading, setLoading] = useState<FormKey | null>(null);
  const [error, setError] = useState<{ form: FormKey; text: string } | null>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);

  const trimmedName = name.trim();

  function clearErrorFor(form: FormKey | 'name') {
    if (error && (form === 'name' || error.form === form)) setError(null);
  }

  async function submit(form: FormKey, path: string, body: Record<string, string>) {
    if (!trimmedName) {
      nameInput.current?.focus();
      return;
    }
    setLoading(form);
    setError(null);
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (form === 'join' && res.status === 404) {
          setError({ form, text: `No room with code ${body.roomId}. Check the code with your host.` });
          codeInput.current?.focus();
        } else {
          setError({ form, text: data.error ?? NETWORK_ERROR });
        }
        return;
      }
      onJoined(data as Joined);
    } catch {
      setError({ form, text: NETWORK_ERROR });
    } finally {
      setLoading(null);
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim()) return;
    submit('create', '/api/create-room', { roomName: roomName.trim(), playerName: trimmedName });
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    submit('join', '/api/join-room', { roomId: code.toUpperCase(), playerName: trimmedName });
  }

  const nameField = (
    <div className="field">
      <label htmlFor="player-name" className="field__label">Your name</label>
      <input
        id="player-name"
        ref={nameInput}
        className="input"
        placeholder="Ash"
        value={name}
        onChange={(e) => { setName(e.target.value); clearErrorFor('name'); }}
        maxLength={24}
        autoComplete="nickname"
        required
      />
    </div>
  );

  const joinError = error?.form === 'join' && (
    <p className="form-error" role="alert" id="join-error">{error.text}</p>
  );

  return (
    <main className="lobby">
      <div className="lobby__intro">
        <DeckFan />
        <h1 className="lobby__title">Pokemon Poker</h1>
        <p className="lobby__lede">Estimate stories with your team. Everyone picks a card, then you all reveal at once.</p>
      </div>

      {inviteMode ? (
        <section className="lobby__panel" aria-labelledby="join-heading">
          <h2 id="join-heading" className="lobby__heading">Join room {code}</h2>
          <form className="lobby__form" onSubmit={handleJoin}>
            {nameField}
            {joinError}
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading === 'join' || !trimmedName}
            >
              {loading === 'join' ? 'Joining…' : `Join room ${code}`}
            </button>
          </form>
          <hr className="lobby__divider" />
          <button
            type="button"
            className="btn btn--link"
            onClick={() => { setInviteMode(false); setCode(''); setError(null); }}
          >
            Start a different room instead
          </button>
        </section>
      ) : (
        <section className="lobby__panel" aria-labelledby="start-heading">
          <h2 id="start-heading" className="lobby__heading">Start a room</h2>
          {nameField}

          <form className="lobby__form" onSubmit={handleCreate} id="create">
            <div className="field">
              <label htmlFor="room-name" className="field__label">Room name</label>
              <input
                id="room-name"
                className="input"
                placeholder="Sprint 42 planning"
                value={roomName}
                onChange={(e) => { setRoomName(e.target.value); clearErrorFor('create'); }}
                maxLength={40}
                autoComplete="off"
                required
              />
            </div>
            {error?.form === 'create' && <p className="form-error" role="alert">{error.text}</p>}
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading === 'create' || !trimmedName || !roomName.trim()}
            >
              {loading === 'create' ? 'Starting…' : 'Start a room'}
            </button>
          </form>

          <hr className="lobby__divider" />

          <form className="lobby__form" onSubmit={handleJoin}>
            <label htmlFor="join-code" className="lobby__subheading">Have a code?</label>
            <div className="lobby__join-row">
              <input
                id="join-code"
                ref={codeInput}
                className="input input--code"
                placeholder="ABC123"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); clearErrorFor('join'); }}
                maxLength={6}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-describedby={error?.form === 'join' ? 'join-error' : undefined}
                required
              />
              <button
                type="submit"
                className="btn"
                disabled={loading === 'join' || !trimmedName || code.length !== 6}
              >
                {loading === 'join' ? 'Joining…' : 'Join'}
              </button>
            </div>
            {joinError}
          </form>
        </section>
      )}
    </main>
  );
}
