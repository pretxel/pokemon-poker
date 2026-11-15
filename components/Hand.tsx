'use client';

import { useRef, useState } from 'react';
import PokemonCard, { POKEMON_CARDS, cardLabel } from './PokemonCard';

interface HandProps {
  selected: string | null;
  disabled: boolean;
  hint: string;
  onSelect: (value: string) => void;
}

export default function Hand({ selected, disabled, hint, onSelect }: HandProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIdx = POKEMON_CARDS.findIndex((c) => c.value === selected);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const tabStop = focusIdx ?? (selectedIdx >= 0 ? selectedIdx : 0);

  function moveFocus(next: number) {
    const count = POKEMON_CARDS.length;
    const idx = (next + count) % count;
    setFocusIdx(idx);
    refs.current[idx]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        moveFocus(tabStop + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        moveFocus(tabStop - 1);
        break;
      case 'Home':
        e.preventDefault();
        moveFocus(0);
        break;
      case 'End':
        e.preventDefault();
        moveFocus(POKEMON_CARDS.length - 1);
        break;
    }
  }

  return (
    <div className="hand-dock">
      <p className="hand-dock__hint" id="hand-hint">{hint}</p>
      <div
        className="hand"
        role="toolbar"
        aria-label="Your cards"
        aria-describedby="hand-hint"
        onKeyDown={handleKeyDown}
      >
        {POKEMON_CARDS.map((card, i) => (
          <button
            key={card.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            className="hand__card"
            style={{ '--i': i } as React.CSSProperties}
            tabIndex={i === tabStop ? 0 : -1}
            aria-pressed={selected === card.value}
            aria-disabled={disabled || undefined}
            aria-label={cardLabel(card)}
            onFocus={() => setFocusIdx(i)}
            onClick={() => { if (!disabled) onSelect(card.value); }}
          >
            <PokemonCard card={card} size="hand" />
          </button>
        ))}
      </div>
    </div>
  );
}
