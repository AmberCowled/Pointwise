"use client";

import type { ReactNode } from "react";

export type AnalyticsSummaryMetricProps = {
  label: ReactNode;
  value: ReactNode;
  align?: "left" | "center" | "right";
};

export default function AnalyticsSummaryMetric({
  label,
  value,
  align = "left",
}: AnalyticsSummaryMetricProps) {
  const alignmentClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "";
  return (
    <div className={alignmentClass}>
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
