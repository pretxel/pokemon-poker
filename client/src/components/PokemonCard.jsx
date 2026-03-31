import React from 'react';

export const POKEMON_CARDS = [
  { value: '0',  label: '0',  name: 'Magikarp',  id: 129, color: '#5B7EE5' },
  { value: '1',  label: '1',  name: 'Bulbasaur', id: 1,   color: '#78C850' },
  { value: '2',  label: '2',  name: 'Charmander',id: 4,   color: '#F08030' },
  { value: '3',  label: '3',  name: 'Squirtle',  id: 7,   color: '#6890F0' },
  { value: '5',  label: '5',  name: 'Pikachu',   id: 25,  color: '#F8D030' },
  { value: '8',  label: '8',  name: 'Eevee',     id: 133, color: '#C88540' },
  { value: '13', label: '13', name: 'Gengar',    id: 94,  color: '#705898' },
  { value: '21', label: '21', name: 'Snorlax',   id: 143, color: '#78A878' },
  { value: '34', label: '34', name: 'Dragonite', id: 149, color: '#FAA764' },
  { value: '?',  label: '?',  name: 'Ditto',     id: 132, color: '#9B7FA6' },
  { value: '∞',  label: '∞',  name: 'Mewtwo',    id: 150, color: '#B8A0D8' },
];

export function getSpriteUrl(pokemonId) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

export function getCardByValue(value) {
  return POKEMON_CARDS.find((c) => c.value === value) || null;
}

export default function PokemonCard({ card, selected, disabled, onSelect }) {
  function handleClick() {
    if (!disabled && onSelect) onSelect(card.value);
  }

  return (
    <div
      className={`pokemon-card-wrapper${selected ? ' flipped selected' : ''}${disabled ? ' disabled' : ''}`}
      style={{ '--card-color': card.color }}
      onClick={handleClick}
      title={`${card.name} — ${card.label} points`}
    >
      <div className="pokemon-card-inner">
        {/* Back face — Pokeball */}
        <div className="pokemon-card-face pokemon-card-back">
          <div className="pokeball-center" />
        </div>

        {/* Front face — Pokemon */}
        <div
          className="pokemon-card-face pokemon-card-front"
          style={{
            background: `linear-gradient(145deg, ${card.color}44 0%, ${card.color}18 100%)`,
            borderColor: selected ? card.color : 'rgba(255,255,255,0.15)',
          }}
        >
          <span className="card-value-badge">{card.label}</span>
          <img
            className="card-sprite"
            src={getSpriteUrl(card.id)}
            alt={card.name}
            loading="lazy"
          />
          <span className="card-pokemon-name">{card.name}</span>
        </div>
      </div>
    </div>
  );
}
