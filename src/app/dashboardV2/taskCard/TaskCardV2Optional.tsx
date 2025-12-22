"use client";

export default function TaskCardV2Optional({
  optional,
}: {
  optional: boolean;
}) {
  return (
    <span
      className={
        "text-xs text-zinc-300 bg-zinc-900/40 border-zinc-700 border rounded-xl px-2 py-0.5 min-w-25 text-center uppercase"
      }
    >
      {optional ? "Optional" : "Required"}
    </span>
  );
}
