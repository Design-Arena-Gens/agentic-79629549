"use client";

import { startTransition, useEffect, useState } from "react";
import toast from "react-hot-toast";

type ReminderPanelProps = {
  tripId: string;
  tripName: string;
  defaultInterval?: number;
  onIntervalChange: (minutes: number | null) => Promise<void>;
};

const REMINDER_KEY = "yatra-ledger-reminders";

type ReminderState = Record<
  string,
  { interval: number; lastNotified: number }
>;

const readLocalReminder = (): ReminderState => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReminderState;
  } catch {
    return {};
  }
};

const writeLocalReminder = (state: ReminderState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMINDER_KEY, JSON.stringify(state));
};

const requestPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "denied") return false;
  if (Notification.permission === "granted") return true;
  const status = await Notification.requestPermission();
  return status === "granted";
};

export const ReminderPanel = ({
  tripId,
  tripName,
  defaultInterval,
  onIntervalChange,
}: ReminderPanelProps) => {
  const [intervalMinutes, setIntervalMinutes] = useState<number | null>(
    defaultInterval ?? null,
  );

  useEffect(() => {
    startTransition(() => {
      setIntervalMinutes(defaultInterval ?? null);
    });
  }, [defaultInterval]);

  useEffect(() => {
    if (typeof window === "undefined" || intervalMinutes === null) return;

    const scheduleReminder = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const reminders = readLocalReminder();
      const tripReminder = reminders[tripId];
      const now = Date.now();

      if (
        !tripReminder ||
        now - tripReminder.lastNotified >= intervalMinutes * 60 * 1000
      ) {
        new Notification("Log your expenses", {
          body: `It has been a while since you updated expenses for ${tripName}.`,
          icon: "/vercel.svg",
          tag: `yatra-ledger-${tripId}`,
        });
        reminders[tripId] = {
          interval: intervalMinutes,
          lastNotified: now,
        };
        writeLocalReminder(reminders);
      }
    };

    const intervalId = window.setInterval(scheduleReminder, 60 * 1000);
    scheduleReminder().catch(() => {});

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMinutes, tripId, tripName]);

  const handleApply = async () => {
    if (!intervalMinutes) {
      await onIntervalChange(null);
      const reminders = readLocalReminder();
      delete reminders[tripId];
      writeLocalReminder(reminders);
      toast.success("Expense reminders disabled for this trip.");
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      toast.error("Enable notifications in your browser to receive reminders.");
      return;
    }

    await onIntervalChange(intervalMinutes);
    const reminders = readLocalReminder();
    reminders[tripId] = {
      interval: intervalMinutes,
      lastNotified: Date.now(),
    };
    writeLocalReminder(reminders);
    toast.success(`Reminder set for every ${intervalMinutes} minutes.`);
  };

  return (
    <div className="card-glass rounded-3xl p-6">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
        Smart Reminders
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Stay consistent with auto reminders while you move between cities.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={intervalMinutes ?? ""}
          onChange={(event) =>
            setIntervalMinutes(
              event.target.value ? Number(event.target.value) : null,
            )
          }
          className="w-full rounded-full border border-white/10 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
        >
          <option value="">Off</option>
          <option value={30}>Every 30 minutes</option>
          <option value={60}>Every 1 hour</option>
          <option value={120}>Every 2 hours</option>
          <option value={240}>Every 4 hours</option>
          <option value={720}>Every 12 hours</option>
        </select>
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Save reminder
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Reminders stay local to your device and sync to Firestore for consistency.
      </p>
    </div>
  );
};
