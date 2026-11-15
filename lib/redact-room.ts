import type { RoomState } from '@/types';

/**
 * Placeholder sent in place of a real vote before the reveal. It tells other
 * clients that a player has voted without disclosing what they picked.
 */
export const HIDDEN_VOTE = 'hidden';

/**
 * Room state is broadcast on a public Pusher channel and returned to every
 * client, so vote values must not leave the server until the story is
 * revealed. Saved stories in history were already revealed and stay intact.
 */
export function redactRoomState(state: RoomState): RoomState {
  if (state.currentStory?.revealed) return state;

  return {
    ...state,
    players: state.players.map((p) => ({ ...p, vote: p.vote === null ? null : HIDDEN_VOTE })),
    currentStory: state.currentStory ? { ...state.currentStory, votes: {} } : null,
  };
}
