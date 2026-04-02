import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusher from '@/lib/pusher';
import { getRoomState } from '@/lib/room-helpers';

export async function POST(req: NextRequest) {
  const { roomCode, playerId, value } = await req.json();

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { room: true },
  });

  if (!player || player.room.code !== roomCode) {
    return NextResponse.json({ error: 'Player not found in room.' }, { status: 403 });
  }

  const currentStory = await prisma.story.findFirst({
    where: { roomId: player.roomId, isCurrent: true },
  });

  if (!currentStory?.name || currentStory.revealed) {
    return NextResponse.json({ error: 'Voting is not currently active.' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.player.update({ where: { id: playerId }, data: { vote: value } }),
    prisma.vote.upsert({
      where: { playerId_storyId: { playerId, storyId: currentStory.id } },
      create: { value, playerId, storyId: currentStory.id },
      update: { value },
    }),
  ]);

  const roomState = await getRoomState(roomCode);
  await pusher.trigger(`room-${roomCode}`, 'room-updated', roomState);

  return NextResponse.json({ ok: true });
}
