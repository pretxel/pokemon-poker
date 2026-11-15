import type { Player, CurrentStory } from '@/types';
import PokemonCard, { getCardByValue, cardLabel } from './PokemonCard';
import VoteResults from './VoteResults';
import Icon from './Icon';

const AVATAR_COLORS = [
  '#B3261A', '#2F4AB8', '#2E7D3A', '#7A3FA0',
  '#A65300', '#0F7A6B', '#A3245B', '#1F5F99',
];

const COMPACT_ABOVE = 12;
const FLIP_STAGGER_MS = 70;
const FLIP_MAX_DELAY_MS = 380;
const FLIP_DURATION_MS = 320;

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function seatStatus(player: Player, revealed: boolean): string {
  if (player.vote === null) return 'has not voted';
  if (!revealed) return 'has voted';
  const card = getCardByValue(player.vote);
  return `picked ${card ? cardLabel(card) : player.vote}`;
}

interface SeatProps {
  player: Player;
  index: number;
  isYou: boolean;
  revealed: boolean;
  compact: boolean;
}

function Seat({ player, index, isYou, revealed, compact }: SeatProps) {
  const voted = player.vote !== null;
  const card = revealed && player.vote ? getCardByValue(player.vote) : null;

  return (
    <li
      className={`seat${isYou ? ' seat--you' : ''}`}
      style={{ '--i': index } as React.CSSProperties}
    >
      <span className="visually-hidden">
        {player.name}{isYou ? ' (you)' : ''}{player.isAdmin ? ', host,' : ''} {seatStatus(player, revealed)}
      </span>

      {!compact && (
        <div className="seat__slot" aria-hidden="true">
          {voted ? (
            <PokemonCard card={card} size="seat" faceDown={!revealed} />
          ) : (
            <span className="seat__empty"><Icon name="clock" size={18} /></span>
          )}
        </div>
      )}

      <div className="seat__who" aria-hidden="true">
        <span className="avatar" style={{ '--avatar': avatarColor(player.name) } as React.CSSProperties}>
          {player.name.charAt(0).toUpperCase()}
        </span>
        <span className="seat__name">{isYou ? 'You' : player.name}</span>
        {compact && (
          revealed && player.vote
            ? <span className="seat__compact-value">{player.vote}</span>
            : <span className={`seat__dot${voted ? ' seat__dot--voted' : ''}`} />
        )}
      </div>

      {player.isAdmin && (
        <span className="seat__tag" aria-hidden="true">
          <Icon name="crown" size={14} /> Host
        </span>
      )}
    </li>
  );
}

interface TableProps {
  players: Player[];
  playerId: string;
  isHost: boolean;
  currentStory: CurrentStory | null;
  onReveal: () => void;
  onVoteAgain: () => void;
  onNextStory: () => void;
}

export default function Table({
  players,
  playerId,
  isHost,
  currentStory,
  onReveal,
  onVoteAgain,
  onNextStory,
}: TableProps) {
  const revealed = currentStory?.revealed ?? false;
  const hasStory = Boolean(currentStory?.name);
  const compact = players.length > COMPACT_ABOVE;
  const votedCount = players.filter((p) => p.vote !== null).length;
  const everyoneVoted = players.length > 0 && votedCount === players.length;

  const seated = players.map((player, index) => ({ player, index }));
  const top = seated.filter(({ index }) => index % 2 === 0);
  const bottom = seated.filter(({ index }) => index % 2 === 1);

  const resultsDelay =
    Math.min(Math.max(players.length - 1, 0) * FLIP_STAGGER_MS, FLIP_MAX_DELAY_MS) + FLIP_DURATION_MS + 150;

  function renderRow(row: typeof seated, label: string) {
    return (
      <ul className={`seats${compact ? ' seats--compact' : ''}`} aria-label={label}>
        {row.map(({ player, index }) => (
          <Seat
            key={player.id}
            player={player}
            index={index}
            isYou={player.id === playerId}
            revealed={revealed}
            compact={compact}
          />
        ))}
      </ul>
    );
  }

  let center: React.ReactNode;
  if (!hasStory) {
    center = (
      <>
        <p className="placemat__headline">No story on the table</p>
        <p className="placemat__note">
          {isHost ? 'Add a story above to start voting.' : 'Voting starts when the host adds a story.'}
        </p>
      </>
    );
  } else if (!revealed) {
    center = (
      <>
        <p className="placemat__headline" aria-live="polite">
          {everyoneVoted ? 'Everyone voted' : `${votedCount} of ${players.length} voted`}
        </p>
        {isHost ? (
          <div className="placemat__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={onReveal}
              disabled={votedCount === 0}
            >
              Reveal cards
            </button>
          </div>
        ) : (
          <p className="placemat__note">The host reveals everyone&apos;s cards at once.</p>
        )}
      </>
    );
  } else {
    center = (
      <>
        <VoteResults players={players} currentStory={currentStory!} delayMs={resultsDelay} />
        {isHost ? (
          <div className="placemat__actions">
            <button type="button" className="btn" onClick={onVoteAgain}>Vote again</button>
            <button type="button" className="btn btn--primary" onClick={onNextStory}>Next story</button>
          </div>
        ) : (
          <p className="placemat__note">Waiting for the host to start the next round.</p>
        )}
      </>
    );
  }

  return (
    <section className="table" aria-label="Table">
      {renderRow(top, 'Seats, far side')}
      <div className="table__surface">
        <div className="placemat">{center}</div>
      </div>
      {bottom.length > 0 && renderRow(bottom, 'Seats, near side')}
    </section>
  );
}
