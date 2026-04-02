import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusher from '@/lib/pusher';
import { getRoomState } from '@/lib/room-helpers';

export async function POST(req: NextRequest) {
  const { roomId, playerName } = await req.json();

  if (!roomId?.trim() || !playerName?.trim()) {
    return NextResponse.json({ error: 'Room code and player name are required.' }, { status: 400 });
  }

  const code = roomId.trim().toUpperCase();
  const room = await prisma.room.findUnique({ where: { code } });

  if (!room) {
    return NextResponse.json({ error: `Room "${code}" not found. Check the code and try again.` }, { status: 404 });
  }

  const player = await prisma.player.create({
    data: { name: playerName.trim(), isAdmin: false, roomId: room.id },
  });

  const roomState = await getRoomState(code);

  await pusher.trigger(`room-${code}`, 'room-updated', roomState);

  return NextResponse.json({ roomId: code, playerId: player.id, room: roomState });
}
