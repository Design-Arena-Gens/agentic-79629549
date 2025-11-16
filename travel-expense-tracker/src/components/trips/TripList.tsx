"use client";

import type { Trip } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { tripGradient } from "@/hooks/useTripData";
import classNames from "clsx";

type TripListProps = {
  trips: Trip[];
  selectedTripId?: string;
  onSelect: (tripId: string) => void;
};

export const TripList = ({
  trips,
  selectedTripId,
  onSelect,
}: TripListProps) => {
  if (!trips.length) {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-500/40 bg-white/60 p-6 text-center text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
        Plan your first itinerary to begin tracking expenses.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {trips.map((trip) => {
        const gradient = tripGradient(trip);
        const isSelected = trip.id === selectedTripId;
        return (
          <button
            key={trip.id}
            type="button"
            onClick={() => onSelect(trip.id)}
            className={classNames(
              "relative min-w-[220px] flex-1 overflow-hidden rounded-3xl p-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
              isSelected ? `bg-gradient-to-br ${gradient} text-white` : "bg-white/80 dark:bg-slate-900/60",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className={classNames(
                  "text-xs uppercase tracking-[0.25em]",
                  isSelected ? "text-white/70" : "text-slate-400",
                )}
              >
                {trip.destination.toUpperCase()}
              </p>
              <span
                className={classNames(
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200",
                )}
              >
                {trip.currency}
              </span>
            </div>
            <h3
              className={classNames(
                "mt-3 text-lg font-semibold leading-tight",
                isSelected ? "text-white" : "text-slate-700 dark:text-slate-200",
              )}
            >
              {trip.name}
            </h3>
            <p
              className={classNames(
                "mt-2 text-xs",
                isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400",
              )}
            >
              {formatDate(trip.startDate)} &mdash; {formatDate(trip.endDate)}
            </p>
          </button>
        );
      })}
    </div>
  );
};
