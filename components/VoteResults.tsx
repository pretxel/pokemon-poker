import type { Player, CurrentStory } from '@/types';
import PokemonCard, { POKEMON_CARDS, getCardByValue } from './PokemonCard';

function getClosestCard(avg: number) {
  const numeric = POKEMON_CARDS.filter((c) => !isNaN(parseFloat(c.value)));
  return numeric.reduce((closest, card) => {
    const diff = Math.abs(parseFloat(card.value) - avg);
    const bestDiff = Math.abs(parseFloat(closest.value) - avg);
    return diff < bestDiff ? card : closest;
  }, numeric[0]);
}

function people(n: number) {
  return `${n} ${n === 1 ? 'person' : 'people'}`;
}

interface VoteResultsProps {
  players: Player[];
  currentStory: CurrentStory;
  /** Delay before results fade in, so they land after the last card flip. */
  delayMs: number;
}

export default function VoteResults({ players, currentStory, delayMs }: VoteResultsProps) {
  const voteEntries = Object.entries(currentStory.votes ?? {});
  const style = { '--results-delay': `${delayMs}ms` } as React.CSSProperties;

  if (voteEntries.length === 0) {
    return (
      <div className="results" style={style}>
        <p className="placemat__headline">No one voted</p>
        <p className="placemat__note">Vote again to give everyone another chance.</p>
      </div>
    );
  }

  const numericVotes = voteEntries.map(([, v]) => parseFloat(v)).filter((n) => !isNaN(n));
  const average = numericVotes.length > 0
    ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
    : null;
  const min = numericVotes.length > 0 ? Math.min(...numericVotes) : null;
  const max = numericVotes.length > 0 ? Math.max(...numericVotes) : null;
  const allSame = voteEntries.length > 1 && voteEntries.every(([, v]) => v === voteEntries[0][1]);

  const distribution: Record<string, string[]> = {};
  for (const [playerId, value] of voteEntries) {
    (distribution[value] ??= []).push(players.find((p) => p.id === playerId)?.name ?? 'Someone who left');
  }

  const order = POKEMON_CARDS.map((c) => c.value);
  const sortedValues = Object.keys(distribution).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const maxCount = Math.max(...Object.values(distribution).map((v) => v.length));

  const featured = allSame
    ? getCardByValue(voteEntries[0][1])
    : average !== null ? getClosestCard(average) : null;

  let spread: string;
  if (min !== null && max !== null && min !== max) {
    spread = `Votes ranged from ${min} to ${max} across ${people(voteEntries.length)}.`;
  } else {
    spread = `${people(voteEntries.length)} voted.`;
  }

  return (
    <div className="results" style={style}>
      <div className="results__summary">
        {featured && <PokemonCard card={featured} size="result" />}
        <div>
          {allSame ? (
            <p className="placemat__headline">Everyone picked {voteEntries[0][1]}</p>
          ) : featured ? (
            <>
              <p className="results__label">Suggested estimate</p>
              <p className="placemat__headline">
                {featured.label} points, {featured.name}
              </p>
            </>
          ) : (
            <p className="placemat__headline">No numeric estimate</p>
          )}
          <p className="results__spread">
            {spread}
            {average !== null && !allSame && ` Average ${average.toFixed(1)}.`}
          </p>
        </div>
      </div>

      <ul className="bars" aria-label="Votes by card">
        {sortedValues.map((value) => {
          const voters = distribution[value];
          const card = getCardByValue(value);
          return (
            <li
              key={value}
              className="bar"
              style={card ? ({ '--card-color': card.color } as React.CSSProperties) : undefined}
            >
              <span className="bar__value">{value}</span>
              <span className="bar__track" aria-hidden="true">
                <span
                  className="bar__fill"
                  style={{ '--pct': `${(voters.length / maxCount) * 100}%` } as React.CSSProperties}
                />
              </span>
              <span className="bar__count">
                {voters.length}
                <span className="visually-hidden"> {voters.length === 1 ? 'vote' : 'votes'}</span>
              </span>
              <span className="bar__voters">{voters.join(', ')}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
