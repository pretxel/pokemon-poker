import React, { useState, useEffect } from 'react';
import socket from './socket';
import Home from './components/Home';
import Room from './components/Room';

const initialState = {
  view: 'home',
  roomId: null,
  playerId: null,
  playerName: null,
  isAdmin: false,
  room: null,
  error: null,
};

export default function App() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    function onRoomJoined({ roomId, playerId, room }) {
      // Determine if current socket is admin
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
    }

    function onRoomUpdated(room) {
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

    function onError({ message }) {
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
        roomId={state.roomId}
        playerId={state.playerId}
        playerName={state.playerName}
        isAdmin={state.isAdmin}
        room={state.room}
        onLeave={() => setState(initialState)}
      />
    );
  }

  return (
    <Home error={state.error} clearError={clearError} />
  );
}
