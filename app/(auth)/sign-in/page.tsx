"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-slate-200 text-center space-y-6">
        {session ? (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#111827]">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 break-all">
                {session.user?.email}
              </p>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full rounded-xl bg-[#2E3192] py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#111827]">
                Not signed in
              </h2>
              <p className="text-sm text-slate-500">
                Please sign in to continue
              </p>
            </div>

            <button
              onClick={() => signIn()}
              className="w-full rounded-xl bg-[#2E3192] py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
