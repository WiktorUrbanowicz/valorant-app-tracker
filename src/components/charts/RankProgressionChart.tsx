// src/components/charts/RankProgressionChart.tsx

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { MmrHistoryEntry } from "../../api/types";

interface RankProgressionChartProps {
  data: MmrHistoryEntry[];
}

function useThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue("--accent").trim() || "#aa3bff",
    text: styles.getPropertyValue("--text").trim() || "#6b6375",
    border: styles.getPropertyValue("--border").trim() || "#e5e4e7",
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: MmrHistoryEntry & { index: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  const changeLabel = entry.mmr_change_to_last_game > 0 ? `+${entry.mmr_change_to_last_game}` : `${entry.mmr_change_to_last_game}`;

  return (
    <div className="px-3 py-2 rounded-lg border text-sm text-left" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-h)" }}>
      <p className="font-semibold">{entry.currenttier_patched}</p>
      <p style={{ color: "var(--text)" }}>
        Elo: {entry.elo} ({changeLabel})
      </p>
      <p style={{ color: "var(--text)" }}>{entry.map.name}</p>
    </div>
  );
}

export function RankProgressionChart({ data }: RankProgressionChartProps) {
  const colors = useThemeColors();

  // API returns most recent first — reverse so the chart reads left-to-right
  // chronologically, and tag each point with its original array index so the
  // x-axis has something stable to key off (dates can collide same-day).
  const chartData = [...data].reverse().map((entry, index) => ({ ...entry, index }));

  if (chartData.length === 0) {
    return (
      <p className="text-center py-8" style={{ color: "var(--text)" }}>
        Not enough ranked match data to show rank progression yet.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid stroke={colors.border} strokeDasharray="3 3" />
          <XAxis dataKey="index" tick={false} stroke={colors.text} />
          <YAxis dataKey="elo" domain={["dataMin - 50", "dataMax + 50"]} stroke={colors.text} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="elo" stroke={colors.accent} strokeWidth={2} dot={{ r: 3, fill: colors.accent }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
