// src/components/charts/RoleBreakdownChart.tsx

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { RoleBreakdown } from "../../utils/stats";

interface RoleBreakdownChartProps {
  data: RoleBreakdown[];
}

// One distinct color per role, pulled loosely from your accent palette
// plus a few complementary hues so the four slices stay visually distinct
// even in a small pie.
const ROLE_COLORS: Record<string, string> = {
  Duelist: "#ef4444",
  Controller: "#a855f7",
  Initiator: "#22c55e",
  Sentinel: "#3b82f6",
  Unknown: "#6b7280",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RoleBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const stat = payload[0].payload;

  return (
    <div className="px-3 py-2 rounded-lg border text-sm text-left" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-h)" }}>
      <p className="font-semibold">{stat.role}</p>
      <p style={{ color: "var(--text)" }}>
        {stat.gamesPlayed} games ({stat.percentage}%)
      </p>
    </div>
  );
}

export function RoleBreakdownChart({ data }: RoleBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-center py-8" style={{ color: "var(--text)" }}>
        Not enough match data to show role breakdown yet.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="gamesPlayed" nameKey="role" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.role} fill={ROLE_COLORS[entry.role] ?? ROLE_COLORS.Unknown} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
