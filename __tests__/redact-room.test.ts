import { redactRoomState, HIDDEN_VOTE } from '../lib/redact-room';
import type { RoomState } from '../types';

function room(revealed: boolean): RoomState {
  return {
    id: 'ABC123',
    name: 'Sprint',
    createdAt: '2026-11-15T00:00:00.000Z',
    players: [
      { id: 'p1', name: 'Ana', isAdmin: true, vote: '5' },
      { id: 'p2', name: 'Ben', isAdmin: false, vote: null },
      { id: 'p3', name: 'Cy', isAdmin: false, vote: '13' },
    ],
    currentStory: { name: 'PROJ-1', revealed, votes: { p1: '5', p3: '13' } },
    stories: [{ name: 'PROJ-0', votes: { p1: '3', p3: '8' }, average: '5.5', savedAt: '2026-11-14T00:00:00.000Z' }],
  };
}

describe('redactRoomState', () => {
  test('hides vote values before reveal but keeps who has voted', () => {
    const out = redactRoomState(room(false));
    expect(out.players.map((p) => p.vote)).toEqual([HIDDEN_VOTE, null, HIDDEN_VOTE]);
  });

  test('removes current story vote values before reveal', () => {
    const out = redactRoomState(room(false));
    expect(out.currentStory?.votes).toEqual({});
  });

  test('no real vote value appears anywhere in the unrevealed payload', () => {
    const json = JSON.stringify(redactRoomState(room(false)).players) +
      JSON.stringify(redactRoomState(room(false)).currentStory);
    expect(json).not.toContain('"5"');
    expect(json).not.toContain('"13"');
  });

  test('leaves everything intact after reveal', () => {
    const input = room(true);
    expect(redactRoomState(input)).toEqual(input);
  });

  test('keeps saved story history, which was already revealed', () => {
    const out = redactRoomState(room(false));
    expect(out.stories[0].votes).toEqual({ p1: '3', p3: '8' });
  });

  test('handles a room with no current story', () => {
    const input = { ...room(false), currentStory: null };
    const out = redactRoomState(input);
    expect(out.currentStory).toBeNull();
    expect(out.players.map((p) => p.vote)).toEqual([HIDDEN_VOTE, null, HIDDEN_VOTE]);
  });

  test('does not mutate its input', () => {
    const input = room(false);
    redactRoomState(input);
    expect(input.players[0].vote).toBe('5');
    expect(input.currentStory?.votes).toEqual({ p1: '5', p3: '13' });
  });
});
