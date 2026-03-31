'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import socket from '@/lib/socket';
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
  error: string | null;
}

const initialState: AppState = {
  view: 'home',
  roomId: null,
  playerId: null,
  playerName: null,
  isAdmin: false,
  room: null,
  error: null,
};

interface AppProps {
  initialRoomId?: string;
}

export default function App({ initialRoomId }: AppProps) {
  const router = useRouter();
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    function onRoomJoined({ roomId, playerId, room }: { roomId: string; playerId: string; room: RoomState }) {
      const me = room.players.find((p) => p.id === playerId);
      setState((prev) => ({
        ...prev,
        view: 'room',
        roomId,
        playerId,
        playerName: me ? me.name : prev.playerName,
        isAdmin: me ? me.isAdmin : false,
        room,
        error: null,
      }));
      // Update URL without navigating — router.push would unmount this App instance
      // and lose all socket state before the Room can render.
      window.history.replaceState(null, '', `/room/${roomId}`);
    }

    function onRoomUpdated(room: RoomState) {
      setState((prev) => {
        if (!prev.playerId) return prev;
        const me = room.players.find((p) => p.id === prev.playerId);
        return {
          ...prev,
          isAdmin: me ? me.isAdmin : prev.isAdmin,
          room,
        };
      });
    }

    function onError({ message }: { message: string }) {
      setState((prev) => ({ ...prev, error: message }));
    }

    socket.on('room-joined', onRoomJoined);
    socket.on('room-updated', onRoomUpdated);
    socket.on('error', onError);

    return () => {
      socket.off('room-joined', onRoomJoined);
      socket.off('room-updated', onRoomUpdated);
      socket.off('error', onError);
    };
  }, []);

  function clearError() {
    setState((prev) => ({ ...prev, error: null }));
  }

  if (state.view === 'room' && state.room) {
    return (
      <Room
        roomId={state.roomId!}
        playerId={state.playerId!}
        playerName={state.playerName!}
        isAdmin={state.isAdmin}
        room={state.room}
        onLeave={() => { setState(initialState); router.push('/'); }}
      />
    );
  }

  return <Home error={state.error} clearError={clearError} initialRoomId={initialRoomId} />;
}
