import React from 'react';
import { getCardByValue } from './PokemonCard';

const AVATAR_COLORS = [
  '#CC0000', '#3B4CCA', '#2ECC71', '#9B59B6',
  '#E67E22', '#1ABC9C', '#E74C3C', '#3498DB',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function PlayerList({ players, playerId, revealed }) {
  return (
    <div className="player-list">
      {players.map((player) => {
        const isYou = player.id === playerId;
        const card = player.vote ? getCardByValue(player.vote) : null;
        const avatarColor = getAvatarColor(player.name);

        return (
          <div key={player.id} className={`player-item${isYou ? ' is-you' : ''}`}>
            <div className="player-avatar" style={{ background: avatarColor }}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              <div className="player-badges">
                {player.isAdmin && <span className="badge badge-admin">👑 Admin</span>}
                {isYou && <span className="badge badge-you">You</span>}
              </div>
            </div>
            <div className="player-vote-status">
              {player.vote === null ? (
                <span title="Waiting to vote">⏳</span>
              ) : revealed && card ? (
                <span className="player-vote-value" title={`${card.name} — ${card.label} pts`}>
                  {card.label}
                </span>
              ) : (
                <span title="Voted!">✅</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
