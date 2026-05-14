"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 36000, bookings: 420 },
  { month: "Feb", revenue: 41000, bookings: 478 },
  { month: "Mar", revenue: 52000, bookings: 536 },
  { month: "Apr", revenue: 71800, bookings: 684 },
  { month: "May", revenue: 82450, bookings: 742 },
];

const categoryData = [
  { category: "Cameras", count: 42 },
  { category: "Tools", count: 36 },
  { category: "Audio", count: 28 },
  { category: "Events", count: 22 },
];

export function RevenueOverviewChart() {
  return (
    <ResponsiveContainer height={280} width="100%">
      <AreaChart data={revenueData} margin={{ left: 0, right: 12, top: 8 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.26} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} />
        <YAxis tickLine={false} width={48} />
        <Tooltip
          contentStyle={{
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Area
          dataKey="revenue"
          fill="url(#revenueFill)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryActivityChart() {
  return (
    <ResponsiveContainer height={280} width="100%">
      <BarChart data={categoryData} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis dataKey="category" tickLine={false} />
        <YAxis tickLine={false} width={36} />
        <Tooltip
          contentStyle={{
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar
          dataKey="count"
          fill="hsl(var(--primary) / 0.78)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
