import { POKEMON_CARDS, getSpriteUrl, getCardByValue } from '../components/PokemonCard';
import type { PokemonCardDef } from '../types';

describe('POKEMON_CARDS', () => {
  test('contains 11 cards', () => {
    expect(POKEMON_CARDS).toHaveLength(11);
  });

  test('each card has required properties', () => {
    for (const card of POKEMON_CARDS) {
      expect(card).toHaveProperty('value');
      expect(card).toHaveProperty('label');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('color');
      expect(typeof card.value).toBe('string');
      expect(typeof card.label).toBe('string');
      expect(typeof card.name).toBe('string');
      expect(typeof card.id).toBe('number');
      expect(typeof card.color).toBe('string');
    }
  });

  test('all values are unique', () => {
    const values = POKEMON_CARDS.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });

  test('all pokemon IDs are unique', () => {
    const ids = POKEMON_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all pokemon names are unique', () => {
    const names = POKEMON_CARDS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test('colors are valid hex format', () => {
    for (const card of POKEMON_CARDS) {
      expect(card.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test('contains expected fibonacci-like point values', () => {
    const values = POKEMON_CARDS.map((c) => c.value);
    expect(values).toEqual(
      expect.arrayContaining(['0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '∞'])
    );
  });

  test('maps specific pokemon to expected values', () => {
    const mappings: Record<string, string> = {
      '0': 'Magikarp',
      '1': 'Bulbasaur',
      '2': 'Charmander',
      '3': 'Squirtle',
      '5': 'Pikachu',
      '8': 'Eevee',
      '13': 'Gengar',
      '21': 'Snorlax',
      '34': 'Dragonite',
      '?': 'Ditto',
      '∞': 'Mewtwo',
    };

    for (const card of POKEMON_CARDS) {
      expect(mappings[card.value]).toBe(card.name);
    }
  });
});

describe('getSpriteUrl', () => {
  test('returns correct PokeAPI sprite URL for a given ID', () => {
    expect(getSpriteUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    );
  });

  test('works for various pokemon IDs', () => {
    const ids = [1, 4, 7, 25, 94, 129, 132, 133, 143, 149, 150];
    for (const id of ids) {
      const url = getSpriteUrl(id);
      expect(url).toContain(`/${id}.png`);
      expect(url).toMatch(/^https:\/\/raw\.githubusercontent\.com/);
    }
  });
});

describe('getCardByValue', () => {
  test('returns the correct card for a valid value', () => {
    const card = getCardByValue('5');
    expect(card).not.toBeNull();
    expect(card!.name).toBe('Pikachu');
    expect(card!.id).toBe(25);
  });

  test('returns null for an invalid value', () => {
    expect(getCardByValue('999')).toBeNull();
    expect(getCardByValue('')).toBeNull();
    expect(getCardByValue('pikachu')).toBeNull();
  });

  test('returns correct card for every defined value', () => {
    for (const expected of POKEMON_CARDS) {
      const card = getCardByValue(expected.value);
      expect(card).toEqual(expected);
    }
  });

  test('returns card for special values', () => {
    const questionCard = getCardByValue('?');
    expect(questionCard).not.toBeNull();
    expect(questionCard!.name).toBe('Ditto');

    const infinityCard = getCardByValue('∞');
    expect(infinityCard).not.toBeNull();
    expect(infinityCard!.name).toBe('Mewtwo');
  });
});
