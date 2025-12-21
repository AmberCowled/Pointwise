"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

type AutoRedirectNoticeProps = {
  target: string;
  label: string;
  description: string;
  delayMs?: number;
};

export function AutoRedirectNotice({
  target,
  label,
  description,
  delayMs = 5000,
}: AutoRedirectNoticeProps) {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push(target);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [router, target, delayMs]);

  return (
    <div className="mt-2 flex flex-col items-center gap-4">
      <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-300">
        <Spinner
          size="sm"
          variant="primary"
          type="dots"
          aria-label="Redirecting"
        />
        <span>{description}</span>
      </div>

      <div className="text-[11px] text-zinc-500">
        Not redirected? Use the button below.
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href={target} className="w-full sm:w-48">
          <Button variant="primary" fullWidth>
            {label}
          </Button>
        </Link>
      </div>
    </div>
  );
}
