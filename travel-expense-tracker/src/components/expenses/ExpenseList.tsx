"use client";

import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/constants";
import classNames from "clsx";

type ExpenseListProps = {
  expenses: Expense[];
  currency: string;
  onDelete: (expenseId: string, imageUrl?: string) => Promise<void>;
};

export const ExpenseList = ({
  expenses,
  currency,
  onDelete,
}: ExpenseListProps) => {
  if (!expenses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
        No expenses logged yet. Add your first spend above.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {expenses.map((expense) => {
        const category = CATEGORY_STYLES[expense.category];
        return (
          <div
            key={expense.id}
            className="card-glass flex flex-col gap-4 rounded-3xl p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-4">
              <div
                className={classNames(
                  "mt-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow",
                  `bg-gradient-to-r ${category.gradient}`,
                )}
              >
                {category.label}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(expense.amount, currency)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(expense.timestamp)}
                </p>
                {expense.notes && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {expense.notes}
                  </p>
                )}
                {expense.location?.label && (
                  <p className="mt-1 text-xs text-emerald-500 dark:text-emerald-300">
                    📍 {expense.location.label}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {expense.imageUrl && (
                <a
                  href={expense.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:text-emerald-500 dark:text-slate-200"
                >
                  View receipt
                </a>
              )}
              <button
                type="button"
                onClick={() => onDelete(expense.id, expense.imageUrl)}
                className="text-xs font-semibold uppercase tracking-wide text-rose-500 hover:text-rose-400"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
