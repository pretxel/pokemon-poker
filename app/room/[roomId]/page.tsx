import type { Metadata } from 'next';
import App from '@/components/App';

interface Props {
  params: Promise<{ roomId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roomId } = await params;
  const code = roomId.toUpperCase();
  return {
    title: `Room ${code}`,
    description: `Join Pokemon Poker room ${code} to vote on stories with your team.`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: `Pokemon Poker — Room ${code}`,
      description: 'Join the planning poker session.',
      url: `/room/${code}`,
      type: 'website',
    },
  };
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  return <App initialRoomId={roomId.toUpperCase()} />;
}
