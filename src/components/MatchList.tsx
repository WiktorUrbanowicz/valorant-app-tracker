// src/components/MatchList.tsx

import type { Match } from "../api/types";

interface MatchListProps {
  matches: Match[];
  currentPlayerName: string;
  currentPlayerTag: string;
}

function getPlayerResult(match: Match, name: string, tag: string) {
  // Zabezpieczenie ? przed nullami w players i all_players
  const player = match.players?.all_players?.find((p) => p.name.toLowerCase() === name.toLowerCase() && p.tag.toLowerCase() === tag.toLowerCase());
  if (!player) return null;

  const teamKey = player.team.toLowerCase() as "red" | "blue";
  const won = match.teams[teamKey]?.has_won ?? false;

  return { player, won };
}

export function MatchList({ matches, currentPlayerName, currentPlayerTag }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <p className="text-center py-8" style={{ color: "var(--text)" }}>
        No matches found.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {matches.map((match) => {
        const result = getPlayerResult(match, currentPlayerName, currentPlayerTag);
        if (!result) return null;

        const { player, won } = result;
        const kda = `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`;

        return (
          <div
            key={match.metadata.matchid}
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{
              borderColor: "var(--border)",
              borderLeft: `4px solid ${won ? "#22c55e" : "#e11d48"}`,
              background: "var(--code-bg)",
            }}
          >
            <div className="flex items-center gap-4 text-left">
              <span className="font-semibold" style={{ color: "var(--text-h)" }}>
                {won ? "Win" : "Loss"}
              </span>
              <span style={{ color: "var(--text)" }}>{match.metadata.map}</span>
              <span style={{ color: "var(--text)" }}>{player.character}</span>
            </div>

            <div className="flex items-center gap-4 text-right">
              <span style={{ color: "var(--text-h)" }}>{kda}</span>
              <span className="text-sm" style={{ color: "var(--text)" }}>
                {player.currenttier_patched}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
