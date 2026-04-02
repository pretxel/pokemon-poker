import { prisma } from './prisma';
import type { RoomState, Player, CurrentStory, SavedStory } from '@/types';

export async function generateCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  while (true) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) return code;
  }
}

export async function getRoomState(roomCode: string): Promise<RoomState | null> {
  const room = await prisma.room.findUnique({
    where: { code: roomCode },
    include: {
      players: { orderBy: { createdAt: 'asc' } },
      stories: {
        include: { votes: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!room) return null;

  const currentStoryRecord = room.stories.find((s) => s.isCurrent);
  const savedStories = room.stories.filter((s) => !s.isCurrent && s.savedAt !== null);

  const players: Player[] = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    isAdmin: p.isAdmin,
    vote: p.vote,
  }));

  let currentStory: CurrentStory | null = null;
  if (currentStoryRecord && currentStoryRecord.name) {
    const votes: Record<string, string> = {};
    for (const vote of currentStoryRecord.votes) {
      votes[vote.playerId] = vote.value;
    }
    currentStory = {
      name: currentStoryRecord.name,
      revealed: currentStoryRecord.revealed,
      votes,
    };
  }

  const stories: SavedStory[] = savedStories.map((s) => ({
    name: s.name,
    votes: Object.fromEntries(s.votes.map((v) => [v.playerId, v.value])),
    average: s.average !== null ? s.average.toFixed(1) : null,
    savedAt: s.savedAt!.toISOString(),
  }));

  return {
    id: room.code,
    name: room.name,
    createdAt: room.createdAt.toISOString(),
    players,
    currentStory,
    stories,
  };
}
