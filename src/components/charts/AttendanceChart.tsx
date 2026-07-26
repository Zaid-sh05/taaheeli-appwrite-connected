import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AttendanceChartProps {
  data: { day: string; attended: number; missed: number }[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="w-full h-64" role="img" aria-label="رسم بياني للحضور والغياب">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: "Noto Sans Arabic" }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ fontFamily: "Noto Sans Arabic", fontSize: 14, direction: "rtl" }} />
          <Legend wrapperStyle={{ fontFamily: "Noto Sans Arabic", fontSize: 14 }} />
          <Bar dataKey="attended" name="حضر" fill="#1f7e42" radius={[4, 4, 0, 0]} />
          <Bar dataKey="missed" name="غاب" fill="#b03030" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
