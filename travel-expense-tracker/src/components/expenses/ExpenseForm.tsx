"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CATEGORIES, CATEGORY_STYLES } from "@/lib/constants";

type ExpenseFormProps = {
  onCreate: (payload: {
    amount: number;
    category: (typeof CATEGORIES)[number];
    timestamp: string;
    location?: {
      lat?: number;
      lng?: number;
      label?: string;
    };
    notes?: string;
    imageFile?: File;
  }) => Promise<void>;
  currency: string;
};

const nowLocal = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export const ExpenseForm = ({ onCreate, currency }: ExpenseFormProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("food");
  const [timestamp, setTimestamp] = useState(nowLocal());
  const [locationLabel, setLocationLabel] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number }>();
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in this browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location captured.");
        setIsLocating(false);
      },
      () => {
        toast.error("Unable to read GPS location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amount) {
      toast.error("Add an amount to log this expense.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate({
        amount,
        category,
        timestamp: new Date(timestamp).toISOString(),
        location: location
          ? { ...location, label: locationLabel || undefined }
          : locationLabel
            ? { label: locationLabel }
            : undefined,
        notes,
        imageFile: image,
      });
      setAmount(0);
      setCategory("food");
      setTimestamp(nowLocal());
      setLocation(undefined);
      setLocationLabel("");
      setNotes("");
      setImage(undefined);
      toast.success("Expense captured.");
    } catch (error) {
      console.error(error);
      toast.error("Couldn't save expense. Try again.");
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
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Add expense
        </h3>
        <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white dark:bg-white/10">
          {currency}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Amount spent
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount || ""}
            onChange={(event) => setAmount(Number(event.target.value))}
            placeholder="₹0.00"
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-3 text-lg font-semibold text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-100"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                className={`rounded-2xl px-3 py-2 text-sm font-semibold capitalize transition ${
                  category === option
                    ? `bg-gradient-to-r ${CATEGORY_STYLES[option].gradient} text-white shadow-lg`
                    : "bg-white/60 text-slate-600 hover:bg-white/80 dark:bg-slate-900/50 dark:text-slate-200"
                }`}
              >
                {CATEGORY_STYLES[option].label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Date &amp; time
          </label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(event) => setTimestamp(event.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </label>
          <div className="flex flex-col gap-2">
            <input
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
              placeholder="Example: Colaba street food"
              className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2.5 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
            />
            <button
              type="button"
              onClick={handleUseLocation}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-100/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-200/60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
            >
              {isLocating ? "Capturing..." : "Use current location"}
            </button>
            {location && (
              <p className="text-xs text-emerald-500">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Add context (who, why, receipts, etc.)"
            className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-3 text-sm text-slate-800 shadow focus:border-emerald-400 focus:outline-none dark:bg-slate-900/60 dark:text-slate-200"
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Upload receipt / photo
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-emerald-400">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && file.size > 8 * 1024 * 1024) {
                    toast.error("File too large (8MB max).");
                    return;
                  }
                  setImage(file ?? undefined);
                }}
                className="hidden"
              />
              Upload image
            </label>
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-20 rounded-2xl object-cover shadow"
              />
            )}
            {image && (
              <button
                type="button"
                onClick={() => setImage(undefined)}
                className="text-xs font-semibold uppercase tracking-wide text-rose-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isSubmitting ? "Saving..." : "Log expense"}
        </button>
      </div>
    </form>
  );
};
