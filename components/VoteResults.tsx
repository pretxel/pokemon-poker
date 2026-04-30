'use client';

import type { Player, CurrentStory } from '@/types';
import { POKEMON_CARDS, getSpriteUrl, getCardByValue } from './PokemonCard';

function getClosestCard(avg: number) {
  const numeric = POKEMON_CARDS.filter((c) => !isNaN(parseFloat(c.value)));
  return numeric.reduce((closest, card) => {
    const diff = Math.abs(parseFloat(card.value) - avg);
    const bestDiff = Math.abs(parseFloat(closest.value) - avg);
    return diff < bestDiff ? card : closest;
  }, numeric[0]);
}

const BAR_COLORS = [
  '#CC0000', '#3B4CCA', '#2ECC71', '#F8D030',
  '#9B59B6', '#E67E22', '#1ABC9C', '#E74C3C',
];

interface VoteResultsProps {
  players: Player[];
  currentStory: CurrentStory | null;
}

export default function VoteResults({ players, currentStory }: VoteResultsProps) {
  if (!currentStory?.revealed) return null;

  const voteEntries = Object.entries(currentStory.votes ?? {});

  if (voteEntries.length === 0) {
    return (
      <div className="results-panel fade-in">
        <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No votes were cast.</p>
      </div>
    );
  }

  const numericVotes = voteEntries
    .map(([, v]) => parseFloat(v))
    .filter((n) => !isNaN(n));

  const average = numericVotes.length > 0
    ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
    : null;
  const min = numericVotes.length > 0 ? Math.min(...numericVotes) : null;
  const max = numericVotes.length > 0 ? Math.max(...numericVotes) : null;
  const allSame = voteEntries.length > 1 && voteEntries.every(([, v]) => v === voteEntries[0][1]);

  const distribution: Record<string, { count: number; voters: string[] }> = {};
  for (const [playerId, value] of voteEntries) {
    if (!distribution[value]) distribution[value] = { count: 0, voters: [] };
    distribution[value].count++;
    const player = players.find((p) => p.id === playerId);
    if (player) distribution[value].voters.push(player.name);
  }

  const sortedValues = Object.keys(distribution).sort((a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return 0;
  });

  const maxCount = Math.max(...Object.values(distribution).map((d) => d.count));
  const closestCard = average !== null ? getClosestCard(average) : null;

  return (
    <div className="results-panel fade-in">
      {allSame && (
        <div className="consensus-banner">
          🎉 Consensus! Everyone voted <strong>{voteEntries[0][1]}</strong>
        </div>
      )}

      {average !== null && (
        <div className="results-stats">
          <div className="stat-card">
            <div className="stat-label">Average</div>
            <div className="stat-value">{average.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Min</div>
            <div className="stat-value">{min}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Max</div>
            <div className="stat-value">{max}</div>
          </div>
        </div>
      )}

      {closestCard && !allSame && (
        <div className="average-pokemon">
          <img src={getSpriteUrl(closestCard.id)} alt={closestCard.name} />
          <div className="average-pokemon-info">
            <div className="average-label">Closest estimate</div>
            <div className="average-name">
              {closestCard.name} ({closestCard.label} pts)
            </div>
          </div>
        </div>
      )}

      <div className="vote-distribution">
        {sortedValues.map((value, i) => {
          const { count, voters } = distribution[value];
          const pct = (count / maxCount) * 100;
          const card = getCardByValue(value);
          const color = card ? card.color : BAR_COLORS[i % BAR_COLORS.length];
          return (
            <div key={value}>
              <div className="vote-bar-row">
                <span className="vote-bar-label">{value}</span>
                <div className="vote-bar-track">
                  <div
                    className="vote-bar-fill"
                    style={{ width: `${pct}%`, background: color }}
                  >
                    {count > 1 && `×${count}`}
                  </div>
                </div>
                <span className="vote-bar-count">{count}</span>
              </div>
              <div className="voter-names" style={{ paddingLeft: 50 }}>
                {voters.join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
