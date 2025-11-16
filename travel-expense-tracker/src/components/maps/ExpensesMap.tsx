"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Expense } from "@/lib/types";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/40 dark:bg-slate-900/40">
      <p className="text-sm text-slate-500 dark:text-slate-300">
        Loading interactive map&hellip;
      </p>
    </div>
  ),
});

type ExpensesMapProps = {
  expenses: Expense[];
  currency: string;
};

const hasCoordinates = (
  expense: Expense,
): expense is Expense & {
  location: { lat: number; lng: number; label?: string };
} => {
  const { location } = expense;
  return Boolean(
    location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number" &&
      !Number.isNaN(location.lat) &&
      !Number.isNaN(location.lng),
  );
};

export const ExpensesMap = ({ expenses, currency }: ExpensesMapProps) => {
  const points = useMemo(
    () =>
      expenses
        .filter(hasCoordinates)
        .map((expense) => ({
          id: expense.id,
          lat: expense.location.lat,
          lng: expense.location.lng,
          label: expense.location?.label ?? "Captured location",
          amount: expense.amount,
          category: expense.category,
          timestamp: expense.timestamp,
        })),
    [expenses],
  );

  if (!points.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-500/30 bg-emerald-50/30 text-center dark:border-emerald-400/40 dark:bg-emerald-950/10">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
          No geopinned expenses yet
        </p>
        <p className="mt-1 text-xs text-emerald-500 dark:text-emerald-200/80">
          Tap &ldquo;Use current location&rdquo; while adding expenses to build your map.
        </p>
      </div>
    );
  }

  return <LeafletMap points={points} currency={currency} />;
};
