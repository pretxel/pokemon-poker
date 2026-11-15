import type { PokemonCardDef } from '@/types';

export const POKEMON_CARDS: PokemonCardDef[] = [
  { value: '0',  label: '0',  name: 'Magikarp',   id: 129, color: '#5B7EE5' },
  { value: '1',  label: '1',  name: 'Bulbasaur',  id: 1,   color: '#78C850' },
  { value: '2',  label: '2',  name: 'Charmander', id: 4,   color: '#F08030' },
  { value: '3',  label: '3',  name: 'Squirtle',   id: 7,   color: '#6890F0' },
  { value: '5',  label: '5',  name: 'Pikachu',    id: 25,  color: '#F8D030' },
  { value: '8',  label: '8',  name: 'Eevee',      id: 133, color: '#C88540' },
  { value: '13', label: '13', name: 'Gengar',     id: 94,  color: '#705898' },
  { value: '21', label: '21', name: 'Snorlax',    id: 143, color: '#78A878' },
  { value: '34', label: '34', name: 'Dragonite',  id: 149, color: '#FAA764' },
  { value: '?',  label: '?',  name: 'Ditto',      id: 132, color: '#9B7FA6' },
  { value: '∞',  label: '∞',  name: 'Mewtwo',     id: 150, color: '#B8A0D8' },
];

export function getSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

export function getCardByValue(value: string): PokemonCardDef | null {
  return POKEMON_CARDS.find((c) => c.value === value) ?? null;
}

export function cardLabel(card: PokemonCardDef): string {
  return `${card.name}, ${card.label} ${card.label === '1' ? 'point' : 'points'}`;
}

export type CardSize = 'hand' | 'seat' | 'hero' | 'result';

const SPRITE_PX: Record<CardSize, number> = { hand: 96, seat: 48, hero: 96, result: 96 };

interface PokemonCardProps {
  card: PokemonCardDef | null;
  size?: CardSize;
  /** Show the card back. Toggling this animates a flip. */
  faceDown?: boolean;
  /** Set when the card is purely decorative or labelled by its container. */
  decorative?: boolean;
}

/**
 * Presentational card face. Interactive wrappers (Hand) supply the button
 * semantics; this component only draws the card.
 */
export default function PokemonCard({ card, size = 'hand', faceDown = false, decorative = true }: PokemonCardProps) {
  const px = SPRITE_PX[size];
  return (
    <span
      className={`pcard pcard--${size}${faceDown ? ' is-face-down' : ''}`}
      style={card ? ({ '--card-color': card.color } as React.CSSProperties) : undefined}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="pcard__inner">
        <span className="pcard__face pcard__front">
          {card && (
            <>
              <span className="pcard__value">{card.label}</span>
              <span className="pcard__art">
                <img src={getSpriteUrl(card.id)} alt="" width={px} height={px} loading="lazy" />
              </span>
              <span className="pcard__name">{card.name}</span>
            </>
          )}
        </span>
        <span className="pcard__face pcard__back" />
      </span>
    </span>
  );
}
