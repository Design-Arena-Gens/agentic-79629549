"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { TripForm } from "@/components/trips/TripForm";
import { TripList } from "@/components/trips/TripList";
import { TripHeader } from "@/components/trips/TripHeader";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { ExpensesMap } from "@/components/maps/ExpensesMap";
import { ReminderPanel } from "@/components/reminders/ReminderPanel";
import { useTrips, useTripExpenses, enrichTrip } from "@/hooks/useTripData";
import {
  addExpense,
  createTrip,
  deleteExpense,
  updateTripReminder,
} from "@/lib/trip-service";
import { formatCurrency } from "@/lib/utils";
import type { TripSnapshot } from "@/lib/types";
import toast from "react-hot-toast";

const SUMMARY_CARDS: {
  id: string;
  label: string;
  helper: string;
  value: (trip: TripSnapshot) => string | number;
}[] = [
  {
    id: "total",
    label: "Total Spend",
    helper: "Across this trip",
    value: (trip) => formatCurrency(trip.totalSpend, trip.currency),
  },
  {
    id: "daily",
    label: "Average Daily Spend",
    helper: "Based on recorded days",
    value: (trip) => {
      const days = Object.keys(trip.dailyTotals).length || 1;
      return formatCurrency(trip.totalSpend / days, trip.currency);
    },
  },
  {
    id: "maxDay",
    label: "Highest Daily Spend",
    helper: "Peak spend day",
    value: (trip) => {
      const max = Math.max(0, ...Object.values(trip.dailyTotals));
      return formatCurrency(max, trip.currency);
    },
  },
  {
    id: "remaining",
    label: "Budget Left",
    helper: "Track the buffer",
    value: (trip) =>
      formatCurrency(Math.max(trip.budget - trip.totalSpend, 0), trip.currency),
  },
];

const Dashboard = ({ userId }: { userId: string }) => {
  const { trips, loading: loadingTrips } = useTrips(userId);
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();

  const selectedTrip = useMemo(() => {
    if (!trips.length) return undefined;
    if (selectedTripId) {
      return trips.find((trip) => trip.id === selectedTripId) ?? trips[0];
    }
    return trips[0];
  }, [selectedTripId, trips]);

  const { expenses, loading: loadingExpenses } = useTripExpenses(
    userId,
    selectedTrip?.id,
  );

  const enrichedTrip = useMemo(() => {
    if (!selectedTrip) return undefined;
    return enrichTrip(selectedTrip, expenses);
  }, [expenses, selectedTrip]);

  useEffect(() => {
    if (!selectedTripId && trips.length) {
      startTransition(() => {
        setSelectedTripId(trips[0]!.id);
      });
    }
  }, [selectedTripId, trips]);

  useEffect(() => {
    if (!enrichedTrip) return;
    if (enrichedTrip.budget && enrichedTrip.budgetUtilization >= 90) {
      toast.error(
        `Alert: ${enrichedTrip.name} has consumed ${enrichedTrip.budgetUtilization.toFixed(0)}% of the budget.`,
        { id: "budget-warning" },
      );
    } else if (enrichedTrip.budget && enrichedTrip.budgetUtilization >= 75) {
      toast(
        `Heads-up: ${enrichedTrip.name} is at ${enrichedTrip.budgetUtilization.toFixed(0)}% budget.`,
        {
          id: "budget-reminder",
          style: {
            background: "#0f172a",
            color: "#e2e8f0",
          },
        },
      );
    }
  }, [enrichedTrip]);

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(34,197,94,0.25),transparent_45%),radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(244,114,182,0.25),transparent_45%)]" />
      <main className="mx-auto max-w-6xl space-y-12 px-4 pt-16 sm:px-6 lg:px-0">
        <section className="space-y-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
              Your Trips
            </h2>
            <TripList
              trips={trips}
              selectedTripId={selectedTrip?.id}
              onSelect={setSelectedTripId}
            />
          </div>
          <TripForm
            onCreate={async (data) => {
              const tripId = await createTrip(userId, {
                ...data,
              });
              setSelectedTripId(tripId);
            }}
          />
        </section>

        {loadingTrips && (
          <div className="rounded-3xl border border-white/10 bg-white/70 p-6 text-sm text-slate-500 shadow-sm dark:bg-slate-900/40 dark:text-slate-300">
            Fetching trip data from Firestore&hellip;
          </div>
        )}

        {selectedTrip && enrichedTrip && (
          <>
            <section className="space-y-6">
              <TripHeader trip={enrichedTrip} />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {SUMMARY_CARDS.map((card) => (
                  <div
                    key={card.id}
                    className="card-glass rounded-3xl p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {card.value(enrichedTrip)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {card.helper}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <ExpenseForm
                currency={enrichedTrip.currency}
                onCreate={async (payload) => {
                  await addExpense(userId, enrichedTrip.id, payload);
                }}
              />
              <ReminderPanel
                tripId={enrichedTrip.id}
                tripName={enrichedTrip.name}
                defaultInterval={selectedTrip.reminderIntervalMinutes ?? undefined}
                onIntervalChange={async (interval) => {
                  await updateTripReminder(userId, enrichedTrip.id, interval);
                }}
              />
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
                  Recent Expenses
                </h2>
                <span className="text-xs text-slate-400">
                  Firestore sync • {expenses.length} entries
                </span>
              </div>
              {loadingExpenses ? (
                <div className="mt-4 h-48 animate-pulse rounded-3xl bg-white/60 dark:bg-slate-900/40" />
              ) : (
                <ExpenseList
                  expenses={expenses}
                  currency={enrichedTrip.currency}
                  onDelete={async (expenseId, imageUrl) => {
                    await deleteExpense(
                      userId,
                      enrichedTrip.id,
                      expenseId,
                      imageUrl,
                    );
                    toast.success("Expense removed.");
                  }}
                />
              )}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card-glass rounded-3xl p-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  Map view
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Visualise where your rupees are going across the journey.
                </p>
                <div className="mt-4">
                  <ExpensesMap
                    expenses={expenses}
                    currency={enrichedTrip.currency}
                  />
                </div>
              </div>
              <AnalyticsPanel
                expenses={expenses}
                currency={enrichedTrip.currency}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

const Home = () => {
  return (
    <AuthGate>
      {(user) => <Dashboard userId={user.uid} />}
    </AuthGate>
  );
};

export default Home;
