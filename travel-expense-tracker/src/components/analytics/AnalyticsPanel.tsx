"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Expense } from "@/lib/types";
import type { ExpenseCategory } from "@/lib/constants";
import { CATEGORY_STYLES, CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

type AnalyticsPanelProps = {
  expenses: Expense[];
  currency: string;
};

const COLORS: Record<ExpenseCategory, string> = {
  food: "#fb923c",
  drinks: "#38bdf8",
  shopping: "#c084fc",
  experience: "#34d399",
  counter: "#84cc16",
  travel: "#f87171",
  "local commute": "#6366f1",
};

const formatDateKey = (value: string) => format(new Date(value), "dd MMM");

export const AnalyticsPanel = ({ expenses, currency }: AnalyticsPanelProps) => {
  const categoryData = CATEGORIES.map((category) => {
    const total = expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { name: CATEGORY_STYLES[category].label, value: total, category };
  }).filter((entry) => entry.value > 0);

  const byDay = expenses
    .reduce<Record<string, number>>((acc, expense) => {
      const dateKey = format(new Date(expense.timestamp), "yyyy-MM-dd");
      acc[dateKey] = (acc[dateKey] ?? 0) + expense.amount;
      return acc;
    }, {});

  const timeline = Object.entries(byDay)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([dateKey, value]) => ({
      dateKey,
      label: formatDateKey(dateKey),
      value,
    }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card-glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Category Breakdown
          </h3>
          <span className="text-xs text-slate-400">Live Sync</span>
        </div>
        <div className="mt-4 flex h-64 w-full items-center justify-center">
          {categoryData.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  innerRadius="50%"
                  paddingAngle={4}
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={COLORS[entry.category]}
                      className="drop-shadow"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, currency),
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    background: "rgba(15,23,42,0.85)",
                    color: "#e2e8f0",
                    boxShadow: "0 15px 45px rgba(15, 23, 42, 0.35)",
                    backdropFilter: "blur(18px)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">
              Add expenses to unlock category analytics.
            </p>
          )}
        </div>
      </div>
      <div className="card-glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Daily Spend Trend
          </h3>
          <span className="text-xs text-slate-400">Across the trip</span>
        </div>
        <div className="mt-4 h-64">
          {timeline.length ? (
            <ResponsiveContainer>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="dailySpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke="rgba(148, 163, 184, 0.2)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value, currency)}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                  labelFormatter={(label) => `Spend on ${label}`}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    background: "rgba(15,23,42,0.85)",
                    color: "#e2e8f0",
                    boxShadow: "0 15px 45px rgba(15, 23, 42, 0.35)",
                    backdropFilter: "blur(18px)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  fill="url(#dailySpendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">
              Track your first day to view spending momentum.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
