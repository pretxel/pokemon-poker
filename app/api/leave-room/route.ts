import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusher from '@/lib/pusher';
import { getRoomState } from '@/lib/room-helpers';

export async function POST(req: NextRequest) {
  const { roomCode, playerId } = await req.json();

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { room: { include: { players: true } } },
  });

  if (!player || player.room.code !== roomCode) {
    return NextResponse.json({ ok: true }); // idempotent
  }

  const wasAdmin = player.isAdmin;
  const remainingPlayers = player.room.players.filter((p) => p.id !== playerId);

  if (remainingPlayers.length === 0) {
    await prisma.room.delete({ where: { id: player.roomId } });
    return NextResponse.json({ ok: true });
  }

  const ops: Parameters<typeof prisma.$transaction>[0] = [
    prisma.player.delete({ where: { id: playerId } }),
  ];

  if (wasAdmin) {
    ops.push(
      prisma.player.update({
        where: { id: remainingPlayers[0].id },
        data: { isAdmin: true },
      })
    );
  }

  await prisma.$transaction(ops);

  const roomState = await getRoomState(roomCode);
  await pusher.trigger(`room-${roomCode}`, 'room-updated', roomState);

  return NextResponse.json({ ok: true });
}
