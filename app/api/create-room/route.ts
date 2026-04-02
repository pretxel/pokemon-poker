import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCode, getRoomState } from '@/lib/room-helpers';

export async function POST(req: NextRequest) {
  const { roomName, playerName } = await req.json();

  if (!roomName?.trim() || !playerName?.trim()) {
    return NextResponse.json({ error: 'Room name and player name are required.' }, { status: 400 });
  }

  const code = await generateCode();

  const room = await prisma.room.create({
    data: {
      code,
      name: roomName.trim(),
      players: { create: { name: playerName.trim(), isAdmin: true } },
      stories: { create: { name: '', isCurrent: true } },
    },
    select: { players: { select: { id: true } } },
  });

  const playerId = room.players[0].id;
  const roomState = await getRoomState(code);

  return NextResponse.json({ roomId: code, playerId, room: roomState });
}
