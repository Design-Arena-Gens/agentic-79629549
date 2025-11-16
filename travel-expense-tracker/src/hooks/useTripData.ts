import { startTransition, useEffect, useState } from "react";
import { Timestamp, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Trip, Expense, TripSnapshot } from "@/lib/types";
import {
  calculateCategoryTotals,
  calculateDailyTotals,
  gradientFromSeed,
} from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/constants";

type FirestoreTrip = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  gradientSeed?: string;
  reminderIntervalMinutes?: number | null;
  createdAt?: Timestamp | null;
};

type FirestoreExpense = {
  amount: number;
  category: ExpenseCategory;
  timestamp: Timestamp;
  location?: { lat?: number; lng?: number; label?: string } | null;
  notes?: string;
  imageUrl?: string | null;
  createdAt?: Timestamp | null;
};

const normalizeTrip = (id: string, data: FirestoreTrip): Trip => ({
  id,
  name: data.name,
  destination: data.destination,
  startDate: data.startDate,
  endDate: data.endDate,
  budget: data.budget,
  currency: data.currency,
  gradientSeed: data.gradientSeed ?? data.destination ?? id,
  reminderIntervalMinutes: data.reminderIntervalMinutes ?? undefined,
  createdAt:
    data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
});

const normalizeExpense = (
  id: string,
  data: FirestoreExpense,
): Expense => ({
  id,
  amount: data.amount,
  category: data.category,
  timestamp: data.timestamp.toDate().toISOString(),
  location: data.location ?? undefined,
  notes: data.notes ?? "",
  imageUrl: data.imageUrl ?? undefined,
  createdAt:
    data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
});

export const useTrips = (userId?: string | null) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      startTransition(() => {
        setTrips([]);
        setLoading(false);
      });
      return;
    }

    startTransition(() => {
      setLoading(true);
      setError(null);
    });

    const database = getDb();
    const tripsQuery = query(
      collection(database, "users", userId, "trips"),
      orderBy("startDate", "asc"),
    );

    const unsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const nextTrips = snapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreTrip;
          return normalizeTrip(doc.id, data);
        });
        setTrips(nextTrips);
        setLoading(false);
      },
      (firestoreError) => {
        setError(firestoreError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return { trips, loading, error };
};

export const useTripExpenses = (userId?: string | null, tripId?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !tripId) {
      startTransition(() => {
        setExpenses([]);
        setLoading(false);
      });
      return;
    }

    startTransition(() => {
      setLoading(true);
      setError(null);
    });

    const database = getDb();
    const expensesQuery = query(
      collection(database, "users", userId, "trips", tripId, "expenses"),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const nextExpenses = snapshot.docs.map((doc) =>
          normalizeExpense(doc.id, doc.data() as FirestoreExpense),
        );
        setExpenses(nextExpenses);
        setLoading(false);
      },
      (firestoreError) => {
        setLoading(false);
        setError(firestoreError);
      },
    );

    return () => unsubscribe();
  }, [tripId, userId]);

  return { expenses, loading, error };
};

export const enrichTrip = (trip: Trip, expenses: Expense[]): TripSnapshot => {
  const totalSpend = expenses.reduce((total, expense) => total + expense.amount, 0);
  const dailyTotals = calculateDailyTotals(expenses);
  const categoryTotals = calculateCategoryTotals(expenses);
  const budgetUtilization = trip.budget
    ? Number(((totalSpend / trip.budget) * 100).toFixed(2))
    : 0;

  return {
    ...trip,
    totalSpend,
    dailyTotals,
    categoryTotals,
    budgetUtilization,
  };
};

export const tripGradient = (trip: Trip) => gradientFromSeed(trip.gradientSeed);
