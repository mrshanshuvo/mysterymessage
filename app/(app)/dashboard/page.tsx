"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome {session?.user?.email}
        </h1>

        <Button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="w-full rounded-2xl"
          variant="destructive"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
