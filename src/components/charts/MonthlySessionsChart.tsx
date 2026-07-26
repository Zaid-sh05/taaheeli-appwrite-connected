import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface MonthlySessionsChartProps {
  data: { month: string; count: number }[];
}

export function MonthlySessionsChart({ data }: MonthlySessionsChartProps) {
  return (
    <div className="w-full h-64" role="img" aria-label="رسم بياني للجلسات الشهرية">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f6f6e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1f6f6e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee9e2" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "Noto Sans Arabic" }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ fontFamily: "Noto Sans Arabic", fontSize: 14, direction: "rtl" }} />
          <Area type="monotone" dataKey="count" name="الجلسات" stroke="#1f6f6e" strokeWidth={2} fill="url(#sessionsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
