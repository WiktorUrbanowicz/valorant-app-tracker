// src/components/SummaryCard.tsx

import { forwardRef } from "react";
import type { AgentStats, MapStats } from "../utils/stats";

interface SummaryCardProps {
  playerName: string;
  playerTag: string;
  agentStats: AgentStats[];
  mapStats: MapStats[];
  totalGames: number;
  totalWins: number;
}

// forwardRef so the parent can grab the actual DOM node for html-to-image export.
export const SummaryCard = forwardRef<HTMLDivElement, SummaryCardProps>(function SummaryCard({ playerName, playerTag, agentStats, mapStats, totalGames, totalWins }, ref) {
  const topAgent = agentStats[0];
  const bestMap = [...mapStats].sort((a, b) => b.winRate - a.winRate)[0];
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return (
    <div
      ref={ref}
      style={{
        width: 400,
        padding: 32,
        background: "linear-gradient(135deg, var(--bg), var(--code-bg))",
        border: "1px solid var(--border)",
        borderRadius: 16,
        color: "var(--text-h)",
        fontFamily: "system-ui, sans-serif",
        textAlign: "left",
      }}
    >
      <p style={{ fontSize: 13, color: "var(--accent)", margin: 0, fontWeight: 600, letterSpacing: 1 }}>VALORANT MATCH SUMMARY</p>
      <h2 style={{ fontSize: 28, margin: "4px 0 24px", color: "var(--text-h)" }}>
        {playerName}
        <span style={{ color: "var(--text)", fontWeight: 400 }}>#{playerTag}</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <StatBlock label="Win Rate" value={`${overallWinRate}%`} />
        <StatBlock label="Games Played" value={String(totalGames)} />
        <StatBlock label="Top Agent" value={topAgent?.agent ?? "—"} />
        <StatBlock label="Best Map" value={bestMap?.map ?? "—"} />
      </div>

      <p style={{ fontSize: 12, color: "var(--text)", margin: 0, textAlign: "right" }}>Last {totalGames} games</p>
    </div>
  );
});

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        height: 80,
        background: "var(--accent-bg)",
        border: "1px solid var(--accent-border)",
        borderRadius: 10,
        padding: "12px 16px",
      }}
    >
      <p style={{ fontSize: 11, color: "var(--text)", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600, margin: "2px 0 0", color: "var(--text-h)" }}>{value}</p>
    </div>
  );
}
