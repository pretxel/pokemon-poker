import App from '@/components/App';

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  return <App initialRoomId={roomId.toUpperCase()} />;
}
