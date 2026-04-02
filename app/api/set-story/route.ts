import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusher from '@/lib/pusher';
import { getRoomState } from '@/lib/room-helpers';

export async function POST(req: NextRequest) {
  const { roomCode, playerId, storyName } = await req.json();

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { room: true },
  });

  if (!player || player.room.code !== roomCode) {
    return NextResponse.json({ error: 'Player not found in room.' }, { status: 403 });
  }
  if (!player.isAdmin) {
    return NextResponse.json({ error: 'Only admins can set the story.' }, { status: 403 });
  }

  const currentStory = await prisma.story.findFirst({
    where: { roomId: player.roomId, isCurrent: true },
  });

  if (currentStory) {
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { storyId: currentStory.id } }),
      prisma.story.update({
        where: { id: currentStory.id },
        data: { name: storyName.trim(), revealed: false },
      }),
      prisma.player.updateMany({ where: { roomId: player.roomId }, data: { vote: null } }),
    ]);
  }

  const roomState = await getRoomState(roomCode);
  await pusher.trigger(`room-${roomCode}`, 'room-updated', roomState);

  return NextResponse.json({ ok: true });
}
