// src/components/charts/MapPerformanceChart.tsx

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MapStats } from "../../utils/stats";

interface MapPerformanceChartProps {
  data: MapStats[];
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
  payload?: Array<{ payload: MapStats }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const stat = payload[0].payload;

  return (
    <div className="px-3 py-2 rounded-lg border text-sm text-left" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-h)" }}>
      <p className="font-semibold">{stat.map}</p>
      <p style={{ color: "var(--text)" }}>
        {stat.wins}W - {stat.losses}L ({stat.winRate}%)
      </p>
      <p style={{ color: "var(--text)" }}>
        Avg KDA: {stat.avgKills}/{stat.avgDeaths}/{stat.avgAssists}
      </p>
    </div>
  );
}

export function MapPerformanceChart({ data }: MapPerformanceChartProps) {
  const colors = useThemeColors();

  if (data.length === 0) {
    return (
      <p className="text-center py-8" style={{ color: "var(--text)" }}>
        Not enough match data to show map performance yet.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <XAxis dataKey="map" stroke={colors.text} fontSize={12} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke={colors.text} fontSize={12} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.border, opacity: 0.3 }} />
          <Legend wrapperStyle={{ fontSize: 13, color: colors.text }} />
          <Bar dataKey="winRate" name="Win rate" fill={colors.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
