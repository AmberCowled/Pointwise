"use client";

import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { IoCloudOffline } from "react-icons/io5";

export interface StorageBannerProps {
	project: Project;
}

export default function StorageBanner({ project }: StorageBannerProps) {
	const storageInfo = project.storageInfo;
	if (!storageInfo?.exceeded) return null;

	return (
		<div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
			<IoCloudOffline className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
			<div>
				<p className="text-sm font-semibold text-amber-400">
					Storage Limit Reached
				</p>
				<p className={`text-xs ${StyleTheme.Text.Secondary} mt-0.5`}>
					{storageInfo.ownerTier} tier storage is full. File uploads are
					disabled until storage is freed or the plan is upgraded.
				</p>
			</div>
		</div>
	);
}
