"use client";

import BrandHeader from "@pointwise/app/components/general/BrandHeader";
import { Button } from "@pointwise/app/components/ui/Button";
import { Input } from "@pointwise/app/components/ui/Input";
import { InputSelect } from "@pointwise/app/components/ui/InputSelect";
import {
  Menu,
  MenuDivider,
  MenuItem,
  MenuSection,
} from "@pointwise/app/components/ui/menus";
import { ProgressBar } from "@pointwise/app/components/ui/ProgressBar";
import { useGetXPQuery } from "@pointwise/lib/redux/services/xpApi";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  IoFlame,
  IoFolder,
  IoLogOut,
  IoMail,
  IoNotifications,
  IoPerson,
  IoPersonAdd,
  IoRefresh,
  IoSettings,
  IoStar,
  IoWarning,
} from "react-icons/io5";
import ProgressTooltip from "./ProgressTooltip";
import StatIndicator from "./StatIndicator";

// CSS override class for Input/InputSelect wrappers to remove default spacing
const INPUT_WRAPPER_CLASS = "[&>div]:space-y-0! [&>div>div]:mt-0!";

// Search filter options
const SEARCH_FILTER_OPTIONS = [
  {
    value: "tasks" as const,
    label: "Tasks",
    description: "Search task names, categories, and notes",
  },
  {
    value: "people" as const,
    label: "People",
    description: "Coming soon",
    disabled: true,
  },
];

export interface NavbarProps {
  initials: string;
  streak?: number;
  locale?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  xpError?: unknown;
  onRetryXP?: () => void;
}

export default function Navbar({
  initials,
  streak,
  locale,
  searchQuery = "",
  onSearchChange,
  xpError,
  onRetryXP,
}: NavbarProps) {
  // Get XP data from RTK Query cache
  const { data: xpData, isLoading } = useGetXPQuery();
  const xp = xpData?.xp;

  // Calculate XP values
  const level = xp?.lv ?? 1;
  const xpIntoLevel = xp ? xp.value - xp.lvStartXP : 0;
  const xpToNext = xp?.toNextLv ?? 1000;
  const xpRemaining = xp ? xp.toNextLv - xpIntoLevel : 1000;
  const progress = xp?.progress ?? 0;
  const hasError = Boolean(xpError);
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale ?? "en-US"),
    [locale],
  );

  const progressPercent = Math.min(100, Math.round(progress));
  // const [showTooltip, setShowTooltip] = useState(false);
  const [searchFilter, setSearchFilter] = useState<"tasks" | "people">("tasks");

  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/5 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-6">
          <BrandHeader asLink size="small" align="left" showEyebrow={true} />
          <form className="flex flex-1 items-center gap-2 min-w-[140px]">
            <div className={`flex-1 min-w-0 ${INPUT_WRAPPER_CLASS}`}>
              <Input
                type="search"
                name="dashboard-search"
                placeholder="Search..."
                variant="primary"
                size="sm"
                className="rounded-full"
                fullWidth
                value={searchQuery ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
            <div className={`shrink-0 ${INPUT_WRAPPER_CLASS}`}>
              <InputSelect
                variant="primary"
                size="sm"
                value={searchFilter}
                onChange={(value) => setSearchFilter(value)}
                options={SEARCH_FILTER_OPTIONS}
                className="w-[100px] rounded-full"
              />
            </div>
          </form>
          <div className="ml-auto flex shrink-0">
            <Menu
              placement="bottom end"
              width="w-64"
              trigger={
                <button
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  aria-label="User menu"
                  type="button"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                    {initials}
                  </span>
                </button>
              }
            >
              <MenuSection title="Navigation">
                <MenuItem
                  label="Projects"
                  icon={<IoFolder />}
                  href="/dashboard"
                  description="View all projects"
                />
              </MenuSection>

              <MenuDivider />

              <MenuSection title="Account">
                <MenuItem
                  label="Profile"
                  icon={<IoPerson />}
                  href="/profile"
                  description="View and edit your profile"
                />
                <MenuItem
                  label="Settings"
                  icon={<IoSettings />}
                  href="/settings"
                  description="Manage preferences"
                />
              </MenuSection>

              <MenuDivider />

              <MenuSection>
                <MenuItem
                  label="Sign out"
                  icon={<IoLogOut />}
                  onClick={() => signOut({ callbackUrl: "/" })}
                  danger
                />
              </MenuSection>
            </Menu>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasError ? (
                <button
                  onClick={onRetryXP}
                  className="flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 transition hover:border-rose-400/50 hover:bg-rose-500/20"
                  title="Failed to load XP. Click to retry."
                  type="button"
                >
                  <IoWarning className="h-4 w-4 text-rose-400" />
                  <span className="text-xs uppercase tracking-wider text-rose-400">
                    Level
                  </span>
                  <IoRefresh className="h-3.5 w-3.5 text-rose-400" />
                </button>
              ) : isLoading ? (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <IoStar className="h-4 w-4 text-indigo-400/50" />
                  <span className="text-xs uppercase tracking-wider text-zinc-400">
                    Level
                  </span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400/20 border-t-indigo-400"></div>
                </div>
              ) : level > 0 ? (
                <StatIndicator
                  icon={IoStar}
                  label="Level"
                  value={level}
                  colorClass="text-indigo-400"
                />
              ) : null}
              {streak !== undefined && streak > 0 && (
                <StatIndicator
                  icon={IoFlame}
                  label="Streak"
                  value={streak}
                  colorClass="text-rose-400"
                  title={`${streak} day task completion streak`}
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Menu
                placement="bottom end"
                trigger={
                  <Button
                    icon={IoMail}
                    badgeCount={0}
                    title="Messages coming soon"
                    aria-label="Messages (coming soon)"
                  />
                }
              >
                <MenuItem
                  label="No messages yet"
                  disabled
                  description="Messaging coming soon"
                />
              </Menu>
              <Menu
                placement="bottom end"
                trigger={
                  <Button
                    icon={IoNotifications}
                    badgeCount={0}
                    title="Notifications coming soon"
                    aria-label="Notifications (coming soon)"
                  />
                }
              >
                <MenuItem
                  label="No notifications yet"
                  disabled
                  description="Notifications coming soon"
                />
              </Menu>
              <Menu
                placement="bottom end"
                trigger={
                  <Button
                    icon={IoPersonAdd}
                    badgeCount={0}
                    title="Friend requests coming soon"
                    aria-label="Friend requests (coming soon)"
                  />
                }
              >
                <MenuItem
                  label="No friend requests yet"
                  disabled
                  description="Friend requests coming soon"
                />
              </Menu>
            </div>
          </div>
          {hasError ? (
            <div className="h-2 overflow-hidden rounded-full bg-rose-500/10 border border-rose-400/20"></div>
          ) : isLoading ? (
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-1/3 animate-pulse bg-linear-to-r from-indigo-500/30 via-fuchsia-500/30 to-rose-500/30"></div>
            </div>
          ) : progress > 0 ? (
            <div
              className="relative"
              // TODO: Add tooltip functionality
              //onMouseEnter={() => setShowTooltip(true)}
              //onMouseLeave={() => setShowTooltip(false)}
            >
              <ProgressBar
                value={progressPercent}
                maxValue={100}
                heightClass="h-2"
                overwriteColorClass={() =>
                  "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500"
                }
              />
              <ProgressTooltip
                xpIntoLevel={xpIntoLevel}
                xpToNext={xpToNext}
                xpRemaining={xpRemaining}
                nextLevel={level + 1}
                formatter={numberFormatter}
                // show={showTooltip}
                show={false}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
