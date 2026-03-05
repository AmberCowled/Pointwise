"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type { ReactNode } from "react";

interface ChartCardProps {
	title: string;
	description?: string;
	children: ReactNode;
	isEmpty?: boolean;
	emptyMessage?: string;
	autoHeight?: boolean;
}

export default function ChartCard({
	title,
	description,
	children,
	isEmpty,
	emptyMessage,
	autoHeight,
}: ChartCardProps) {
	return (
		<div
			className={`rounded-lg border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundSubtle} p-4`}
		>
			<Container direction="vertical" gap="xs" width="full">
				<h3 className={`text-sm font-semibold ${StyleTheme.Text.Primary}`}>
					{title}
				</h3>
				{description && (
					<p className={`text-xs ${StyleTheme.Text.Muted}`}>{description}</p>
				)}
				{isEmpty ? (
					<p
						className={`text-sm py-8 text-center ${StyleTheme.Text.Secondary}`}
					>
						{emptyMessage ?? "No data available"}
					</p>
				) : (
					<div
						className={`w-full mt-2 overflow-hidden ${autoHeight ? "" : "h-64"}`}
					>
						{children}
					</div>
				)}
			</Container>
		</div>
	);
}
