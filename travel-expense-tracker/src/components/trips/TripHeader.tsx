"use client";

import { formatDate, formatCurrency } from "@/lib/utils";
import type { TripSnapshot } from "@/lib/types";
import { tripGradient } from "@/hooks/useTripData";
import classNames from "clsx";

type TripHeaderProps = {
  trip: TripSnapshot;
};

const budgetLevel = (utilization: number) => {
  if (utilization >= 100) return "bg-red-500";
  if (utilization >= 90) return "bg-amber-500";
  if (utilization >= 75) return "bg-emerald-500/80";
  return "bg-emerald-400";
};

export const TripHeader = ({ trip }: TripHeaderProps) => {
  const gradient = tripGradient(trip);
  const start = formatDate(trip.startDate);
  const end = formatDate(trip.endDate);

  return (
    <div
      className={classNames(
        "relative overflow-hidden rounded-3xl p-8 text-white shadow-xl",
        `bg-gradient-to-br ${gradient}`,
      )}
    >
      <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/80">
            {trip.destination.toUpperCase()}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {trip.name}
          </h1>
          <p className="mt-2 text-sm font-medium text-white/80">
            {start} &mdash; {end}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-right text-sm font-medium md:text-base">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/70">
              Total Spend
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {formatCurrency(trip.totalSpend, trip.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/70">
              Trip Budget
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {formatCurrency(trip.budget, trip.currency)}
            </p>
          </div>
          <div className="col-span-2">
            <div className="flex items-center justify-between text-xs uppercase text-white/70">
              <span>Budget used</span>
              <span>{trip.budget ? Math.min(trip.budgetUtilization, 999).toFixed(0) : 0}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white/20">
              <div
                className={classNames(
                  "h-3 rounded-full transition-all duration-500",
                  budgetLevel(trip.budgetUtilization),
                )}
                style={{ width: `${Math.min(trip.budgetUtilization, 100)}%` }}
              />
            </div>
            {trip.budgetUtilization >= 80 && (
              <p className="mt-2 text-xs font-medium">
                Heads-up! You have consumed {trip.budgetUtilization.toFixed(0)}% of your travel
                budget.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
