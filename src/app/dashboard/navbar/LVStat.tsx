"use client";

import { Stat } from "@pointwise/app/components/ui/Stat";
import { useGetXPQuery } from "@pointwise/lib/redux/services/xpApi";
import { IoStar } from "react-icons/io5";

/**
 * LVStat - Displays the user's current level (LV) from XP data
 *
 * This component fetches XP data using RTK Query and displays the level (LV) value.
 * It handles loading and error states internally, showing appropriate indicators.
 *
 * **Features:**
 * - Automatically fetches XP data via `useGetXPQuery()`
 * - Shows loading spinner while data is being fetched
 * - Shows error indicator (—) if data fetch fails
 * - Displays "?" if level is 0 (user has no XP yet)
 * - Uses indigo color scheme to match level/XP theme
 *
 * @example
 * ```tsx
 * <LVStat />
 * ```
 *
 * @returns {JSX.Element | null} The rendered LVStat component, or null if level is 0 and not loading/error
 */
export default function LVStat() {
  const { data: xp, isLoading, isFetching, isError } = useGetXPQuery();

  const level = xp?.xp.lv ?? 0;
  const isCurrentlyLoading = isLoading || (isFetching && !xp);

  return (
    <Stat
      icon={IoStar}
      label="Level"
      value={level}
      colorClass="text-indigo-400"
      isLoading={isCurrentlyLoading}
      isError={isError}
    />
  );
}
