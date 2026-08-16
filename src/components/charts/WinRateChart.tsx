// src/components/charts/WinRateChart.tsx

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { AgentStats } from "../../utils/stats";

interface WinRateChartProps {
  data: AgentStats[];
}

// Reads your CSS variables at render time so the chart follows light/dark mode
// automatically without hardcoding hex values here.
function useThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue("--accent").trim() || "#aa3bff",
    text: styles.getPropertyValue("--text").trim() || "#6b6375",
    textH: styles.getPropertyValue("--text-h").trim() || "#08060d",
    border: styles.getPropertyValue("--border").trim() || "#e5e4e7",
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: AgentStats }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const stat: AgentStats = payload[0].payload;

  return (
    <div className="px-3 py-2 rounded-lg border text-sm text-left" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-h)" }}>
      <p className="font-semibold">{stat.agent}</p>
      <p style={{ color: "var(--text)" }}>
        {stat.wins}W - {stat.losses}L ({stat.winRate}%)
      </p>
    </div>
  );
}

export function WinRateChart({ data }: WinRateChartProps) {
  const colors = useThemeColors();

  if (data.length === 0) {
    return (
      <p className="text-center py-8" style={{ color: "var(--text)" }}>
        Not enough match data to show agent win rates yet.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: Math.max(200, data.length * 56) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <XAxis type="number" stroke={colors.text} fontSize={12} allowDecimals={false} />
          <YAxis type="category" dataKey="agent" width={90} stroke={colors.text} fontSize={13} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.border, opacity: 0.3 }} />

          <Bar dataKey="wins" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          <Bar dataKey="losses" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
