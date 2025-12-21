"use client";

import { DateTimeDefaults, toDateKey } from "@pointwise/lib/datetime";
import { useRef } from "react";
import { Checkbox } from "../../../ui/Checkbox";
import { Input } from "../../../ui/Input";

type DateFieldsProps = {
  form: {
    startDate?: string | null;
    startTime?: string | null;
    dueDate?: string | null;
    dueTime?: string | null;
  };
  hasStart: boolean;
  hasDue: boolean;
  startFieldId: string;
  dueFieldId: string;
  defaultDate?: Date;
  activeTimeZone?: string;
  errors: Record<string, string>;
  onStartChange: (checked: boolean) => void;
  onDueChange: (checked: boolean) => void;
  onStartDateUpdate: (value?: string) => void;
  onDueDateUpdate: (value?: string) => void;
  onStartTimeUpdate?: (value?: string) => void;
  onDueTimeUpdate?: (value?: string) => void;
  onClearDateOrderError: () => void;
};

export function DateFields({
  form,
  hasStart,
  hasDue,
  startFieldId,
  dueFieldId,
  defaultDate,
  activeTimeZone = DateTimeDefaults.timeZone,
  errors,
  onStartChange,
  onDueChange,
  onStartDateUpdate,
  onDueDateUpdate,
  onStartTimeUpdate,
  onDueTimeUpdate,
  onClearDateOrderError,
}: DateFieldsProps) {
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const dueTimeInputRef = useRef<HTMLInputElement>(null);

  // Convert defaultDate to user's timezone for date input (YYYY-MM-DD format)
  const defaultDateString = defaultDate
    ? toDateKey(defaultDate, activeTimeZone)
    : toDateKey(new Date(), activeTimeZone);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <div className="mb-2">
          <Checkbox
            name="setStartDate"
            label="Set start date"
            defaultChecked={hasStart}
            onChange={(value) => {
              const next = value;
              onStartChange(value);
              if (next && !form.startDate) {
                onStartDateUpdate(form.dueDate ?? defaultDateString);
              }
              if (!next) {
                onStartDateUpdate(undefined);
                onClearDateOrderError();
              }
            }}
            size="sm"
          />
        </div>
        {hasStart ? (
          <div className="space-y-2">
            <Input
              id={startFieldId}
              name="startDate"
              type="date"
              label="Start date"
              value={form.startDate ?? ""}
              max={hasDue && form.dueDate ? form.dueDate : undefined}
              onChange={(event) =>
                onStartDateUpdate(event.target.value || undefined)
              }
              fullWidth
            />
            <div>
              <label
                htmlFor="startTime"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Start time (optional)
              </label>
              <div
                className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    startTimeInputRef.current &&
                    "showPicker" in startTimeInputRef.current
                  ) {
                    startTimeInputRef.current.showPicker();
                  }
                }}
              >
                <input
                  ref={startTimeInputRef}
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={form.startTime ?? ""}
                  onChange={(event) => {
                    const value = event.target.value || undefined;
                    onStartTimeUpdate?.(value);
                  }}
                  onKeyDown={(e) => {
                    // Prevent typing - only allow picker selection
                    if (
                      e.key !== "Enter" &&
                      e.key !== " " &&
                      e.key !== "Tab" &&
                      e.key !== "ArrowUp" &&
                      e.key !== "ArrowDown" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight"
                    ) {
                      e.preventDefault();
                    }
                    // Open picker on Enter or Space
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      startTimeInputRef.current &&
                      "showPicker" in startTimeInputRef.current
                    ) {
                      e.preventDefault();
                      startTimeInputRef.current.showPicker();
                    }
                  }}
                  className="sr-only"
                  aria-label="Select start time"
                />
                <span className="text-sm">
                  {form.startTime || "Select time"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <div className="mb-2">
          <Checkbox
            name="setDueDate"
            label="Set due date"
            defaultChecked={hasDue}
            onChange={(value) => {
              const next = value;
              onDueChange(next);
              if (next && !form.dueDate) {
                onDueDateUpdate(form.startDate ?? defaultDateString);
              }
              if (!next) {
                onDueDateUpdate(undefined);
                onClearDateOrderError();
              }
            }}
            size="sm"
          />
        </div>
        {hasDue ? (
          <div className="space-y-2">
            <Input
              id={dueFieldId}
              name="dueDate"
              type="date"
              label="Due date"
              value={form.dueDate ?? ""}
              min={hasStart && form.startDate ? form.startDate : undefined}
              onChange={(event) =>
                onDueDateUpdate(event.target.value || undefined)
              }
              fullWidth
            />
            <div>
              <label
                htmlFor="dueTime"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Due time (optional)
              </label>
              <div
                className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    dueTimeInputRef.current &&
                    "showPicker" in dueTimeInputRef.current
                  ) {
                    dueTimeInputRef.current.showPicker();
                  }
                }}
              >
                <input
                  ref={dueTimeInputRef}
                  id="dueTime"
                  name="dueTime"
                  type="time"
                  value={form.dueTime ?? ""}
                  onChange={(event) => {
                    const value = event.target.value || undefined;
                    onDueTimeUpdate?.(value);
                  }}
                  onKeyDown={(e) => {
                    // Prevent typing - only allow picker selection
                    if (
                      e.key !== "Enter" &&
                      e.key !== " " &&
                      e.key !== "Tab" &&
                      e.key !== "ArrowUp" &&
                      e.key !== "ArrowDown" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight"
                    ) {
                      e.preventDefault();
                    }
                    // Open picker on Enter or Space
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      dueTimeInputRef.current &&
                      "showPicker" in dueTimeInputRef.current
                    ) {
                      e.preventDefault();
                      dueTimeInputRef.current.showPicker();
                    }
                  }}
                  className="sr-only"
                  aria-label="Select due time"
                />
                <span className="text-sm">{form.dueTime || "Select time"}</span>
              </div>
              {errors.dateOrder ? (
                <p className="mt-1 text-xs text-rose-400">{errors.dateOrder}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
