"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import toast from "react-hot-toast";
import { DEFAULT_CURRENCY } from "@/lib/constants";

type TripFormProps = {
  onCreate: (data: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    currency: string;
  }) => Promise<void>;
};

const today = format(new Date(), "yyyy-MM-dd");
const nextWeek = format(addDays(new Date(), 7), "yyyy-MM-dd");

export const TripForm = ({ onCreate }: TripFormProps) => {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [budget, setBudget] = useState(25000);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate({
        name,
        destination,
        startDate,
        endDate,
        budget,
        currency,
      });
      toast.success(`${name} is ready for tracking.`);
      setName("");
      setDestination("");
      setBudget(25000);
      setStartDate(today);
      setEndDate(nextWeek);
    } catch (error) {
      console.error(error);
      toast.error("Unable to create trip. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-glass rounded-3xl p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Plan a new trip
        </h2>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
          Optimised for Bharat travels
        </span>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Trip title
          </label>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Monsoon in Kerala"
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Destination
          </label>
          <input
            required
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="City / state"
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            End date
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Budget ({currency})
          </label>
          <input
            type="number"
            required
            min={0}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Currency
          </label>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="AED">UAE Dirham (د.إ)</option>
            <option value="SGD">Singapore Dollar (S$)</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isSubmitting ? "Creating..." : "Create trip"}
        </button>
      </div>
    </form>
  );
};
