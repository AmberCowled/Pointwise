"use client";

import clsx from "clsx";

export default function TaskCardStatus({ status }: { status: string }) {
  const baseClasses =
    "text-xs border rounded-xl px-2 py-0.5 min-w-25 text-center";
  const completedClasses =
    "bg-emerald-900/40 border-emerald-500 text-emerald-500";
  const overdueClasses = "bg-red-950/60 border-red-500/80 text-red-400";
  const pendingClasses = "bg-zinc-900/40 border-zinc-700 text-zinc-300";

  return (
    <span
      className={clsx(
        baseClasses,
        status === "COMPLETED"
          ? completedClasses
          : status === "OVERDUE"
            ? overdueClasses
            : pendingClasses,
      )}
    >
      {status}
    </span>
  );
}
