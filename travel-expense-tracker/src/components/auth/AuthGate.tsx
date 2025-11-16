/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase";
import { Toaster } from "react-hot-toast";

type AuthGateProps = {
  children: (user: User) => React.ReactNode;
};

export const AuthGate = ({ children }: AuthGateProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthClient();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const auth = getAuthClient();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    const auth = getAuthClient();
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-200">
        <div className="animate-pulse space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full border-4 border-slate-700 border-t-emerald-400" />
          <p className="text-sm tracking-wide text-slate-400">
            Syncing with Firebase&hellip;
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1f2937,_#020617)]" />
        <div className="absolute inset-y-0 w-[65vw] -rotate-12 bg-gradient-to-br from-emerald-500/70 via-sky-500/60 to-blue-600/50 blur-3xl" />
        <div className="relative z-10 w-full max-w-md rounded-3xl p-10 text-center card-glass">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-500 text-white shadow-lg shadow-emerald-500/40">
            <span className="text-2xl font-semibold">₹</span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-100">
            Welcome to Yatra Ledger
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Track every rupee from your India adventures. Sign in to sync trips,
            expenses, and reminders securely with Firebase.
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <img
              src="/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Continue with Google
          </button>
          <p className="mt-4 text-xs text-slate-400">
            Personal-use only. Your travel data stays private within your Firebase project.
          </p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-white/70 px-4 py-1.5 shadow-md backdrop-blur-md dark:border-white/5 dark:bg-slate-900/60">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? "Traveller"}
            className="h-9 w-9 rounded-full border border-white/20 object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-sm font-semibold text-white">
            {(user.displayName ?? "You").slice(0, 1)}
          </div>
        )}
        <div className="hidden text-left md:block">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Logged in as
          </p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {user.displayName ?? user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-transparent bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700 dark:bg-white/10 dark:text-slate-50 dark:hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
      <Toaster position="top-right" />
      {children(user)}
    </>
  );
};
