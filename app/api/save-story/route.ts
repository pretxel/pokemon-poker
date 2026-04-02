import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusher from '@/lib/pusher';
import { getRoomState } from '@/lib/room-helpers';

export async function POST(req: NextRequest) {
  const { roomCode, playerId } = await req.json();

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { room: true },
  });

  if (!player || player.room.code !== roomCode) {
    return NextResponse.json({ error: 'Player not found in room.' }, { status: 403 });
  }
  if (!player.isAdmin) {
    return NextResponse.json({ error: 'Only admins can save the story.' }, { status: 403 });
  }

  const currentStory = await prisma.story.findFirst({
    where: { roomId: player.roomId, isCurrent: true },
    include: { votes: true },
  });

  if (currentStory && !currentStory.revealed) {
    return NextResponse.json({ error: 'Votes must be revealed before saving.' }, { status: 400 });
  }

  if (currentStory?.name) {
    const numericVotes = currentStory.votes
      .map((v) => parseFloat(v.value))
      .filter((n) => !isNaN(n));
    const average =
      numericVotes.length > 0
        ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
        : null;

    await prisma.$transaction([
      prisma.story.update({
        where: { id: currentStory.id },
        data: { isCurrent: false, savedAt: new Date(), average },
      }),
      prisma.story.create({
        data: { name: '', isCurrent: true, roomId: player.roomId },
      }),
      prisma.player.updateMany({ where: { roomId: player.roomId }, data: { vote: null } }),
    ]);
  }

  const roomState = await getRoomState(roomCode);
  await pusher.trigger(`room-${roomCode}`, 'room-updated', roomState);

  return NextResponse.json({ ok: true });
}
