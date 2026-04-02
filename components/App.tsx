'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPusher } from '@/lib/pusher-client';
import Home from './Home';
import Room from './Room';
import type { RoomState } from '@/types';

interface AppState {
  view: 'home' | 'room';
  roomId: string | null;
  playerId: string | null;
  playerName: string | null;
  isAdmin: boolean;
  room: RoomState | null;
}

const initialState: AppState = {
  view: 'home',
  roomId: null,
  playerId: null,
  playerName: null,
  isAdmin: false,
  room: null,
};

interface AppProps {
  initialRoomId?: string;
}

export default function App({ initialRoomId }: AppProps) {
  const router = useRouter();
  const [state, setState] = useState<AppState>(initialState);

  // Subscribe to Pusher room channel while in a room
  useEffect(() => {
    if (!state.roomId) return;

    const pusher = getPusher();
    const channel = pusher.subscribe(`room-${state.roomId}`);

    channel.bind('room-updated', (room: RoomState) => {
      setState((prev) => {
        if (!prev.playerId) return prev;
        const me = room.players.find((p) => p.id === prev.playerId);
        return { ...prev, isAdmin: me ? me.isAdmin : prev.isAdmin, room };
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`room-${state.roomId!}`);
    };
  }, [state.roomId]);

  // Notify server on tab/browser close
  useEffect(() => {
    if (state.view !== 'room' || !state.playerId || !state.roomId) return;

    const handleBeforeUnload = () => {
      const blob = new Blob(
        [JSON.stringify({ roomCode: state.roomId, playerId: state.playerId })],
        { type: 'application/json' }
      );
      navigator.sendBeacon('/api/leave-room', blob);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.view, state.playerId, state.roomId]);

  function onJoined({
    roomId,
    playerId,
    room,
  }: {
    roomId: string;
    playerId: string;
    room: RoomState;
  }) {
    const me = room.players.find((p) => p.id === playerId);
    setState({
      view: 'room',
      roomId,
      playerId,
      playerName: me?.name ?? null,
      isAdmin: me?.isAdmin ?? false,
      room,
    });
    window.history.replaceState(null, '', `/room/${roomId}`);
  }

  function onLeave() {
    setState(initialState);
    router.push('/');
  }

  if (state.view === 'room' && state.room) {
    return (
      <Room
        roomId={state.roomId!}
        playerId={state.playerId!}
        playerName={state.playerName!}
        isAdmin={state.isAdmin}
        room={state.room}
        onLeave={onLeave}
      />
    );
  }

  return <Home onJoined={onJoined} initialRoomId={initialRoomId} />;
}
