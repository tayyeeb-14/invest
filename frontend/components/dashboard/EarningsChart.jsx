"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const sample = [
  { day: "Mon", income: 120 },
  { day: "Tue", income: 180 },
  { day: "Wed", income: 210 },
  { day: "Thu", income: 140 },
  { day: "Fri", income: 260 },
  { day: "Sat", income: 220 },
  { day: "Sun", income: 300 }
];

export default function EarningsChart() {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-4 text-sm font-semibold">Weekly earnings trend</p>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <AreaChart data={sample}>
            <defs>
              <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3F55" />
            <XAxis dataKey="day" stroke="#8ca2b8" />
            <YAxis stroke="#8ca2b8" />
            <Tooltip contentStyle={{ background: "#0e1722", border: "1px solid #29435e" }} />
            <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#earn)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
