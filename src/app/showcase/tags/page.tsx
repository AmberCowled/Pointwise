"use client";

import BackgroundGlow from "@pointwise/app/components/general/BackgroundGlow";
import { Tag } from "@pointwise/app/components/ui/Tag";

export default function TagShowcasePage() {
	return (
		<div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
			<BackgroundGlow />
			<div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
				<div>
					<h1 className="text-3xl font-bold mb-2">Tag Showcase</h1>
					<p className="text-sm text-zinc-400">
						Comprehensive display of all tag variants, sizes, and use cases
					</p>
				</div>

				{/* Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
					<div className="flex flex-wrap items-center gap-3">
						<Tag variant="primary">Primary</Tag>
						<Tag variant="secondary">Secondary</Tag>
						<Tag variant="danger">Danger</Tag>
						<Tag variant="success">Success</Tag>
						<Tag variant="warning">Warning</Tag>
						<Tag variant="info">Info</Tag>
					</div>
				</section>

				{/* Sizes */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
					<div className="flex flex-wrap items-center gap-3">
						<Tag variant="primary" size="xs">
							Extra Small
						</Tag>
						<Tag variant="primary" size="sm">
							Small
						</Tag>
						<Tag variant="primary" size="md">
							Medium
						</Tag>
						<Tag variant="primary" size="lg">
							Large
						</Tag>
						<Tag variant="primary" size="xl">
							Extra Large
						</Tag>
					</div>
				</section>

				{/* Variant × Size Matrix */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Variant × Size Matrix</h2>
					<div className="space-y-6">
						{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
							<div key={size} className="space-y-2">
								<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
									Size: {size}
								</h3>
								<div className="flex flex-wrap gap-3">
									<Tag variant="primary" size={size}>
										Primary
									</Tag>
									<Tag variant="secondary" size={size}>
										Secondary
									</Tag>
									<Tag variant="danger" size={size}>
										Danger
									</Tag>
									<Tag variant="success" size={size}>
										Success
									</Tag>
									<Tag variant="warning" size={size}>
										Warning
									</Tag>
									<Tag variant="info" size={size}>
										Info
									</Tag>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Use Cases */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Use Cases</h2>
					<div className="space-y-6">
						{/* Status Indicators */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Status Indicators
							</h3>
							<div className="flex flex-wrap gap-3">
								<Tag variant="success" size="sm">
									Completed
								</Tag>
								<Tag variant="warning" size="sm">
									In Progress
								</Tag>
								<Tag variant="danger" size="sm">
									Overdue
								</Tag>
								<Tag variant="info" size="sm">
									Scheduled
								</Tag>
							</div>
						</div>

						{/* Category Labels */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Category Labels
							</h3>
							<div className="flex flex-wrap gap-3">
								<Tag variant="primary" size="sm">
									Work
								</Tag>
								<Tag variant="secondary" size="sm">
									Personal
								</Tag>
								<Tag variant="info" size="sm">
									Health
								</Tag>
								<Tag variant="success" size="sm">
									Fitness
								</Tag>
							</div>
						</div>

						{/* Priority Badges */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Priority Badges
							</h3>
							<div className="flex flex-wrap gap-3">
								<Tag variant="danger" size="sm">
									High
								</Tag>
								<Tag variant="warning" size="sm">
									Medium
								</Tag>
								<Tag variant="info" size="sm">
									Low
								</Tag>
							</div>
						</div>

						{/* Required Badge (as used in InputHeader) */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Form Field Badge (InputHeader)
							</h3>
							<div className="flex flex-wrap gap-3 items-center">
								<span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
									Email Address
								</span>
								<Tag variant="danger" size="xs">
									Required
								</Tag>
							</div>
						</div>

						{/* XP Rewards */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								XP Rewards
							</h3>
							<div className="flex flex-wrap gap-3">
								<Tag variant="success" size="sm">
									+50 XP
								</Tag>
								<Tag variant="success" size="sm">
									+100 XP
								</Tag>
								<Tag variant="success" size="sm">
									+250 XP
								</Tag>
							</div>
						</div>
					</div>
				</section>

				{/* Inline Usage Examples */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Inline Usage Examples</h2>
					<div className="space-y-4 text-sm text-zinc-300">
						<p>
							This task is marked as{" "}
							<Tag variant="danger" size="xs">
								High Priority
							</Tag>{" "}
							and belongs to the{" "}
							<Tag variant="primary" size="xs">
								Work
							</Tag>{" "}
							category.
						</p>
						<p>
							Status:{" "}
							<Tag variant="warning" size="xs">
								In Progress
							</Tag>{" "}
							• Due in 2 days •{" "}
							<Tag variant="success" size="xs">
								+75 XP
							</Tag>
						</p>
						<p>
							Your profile shows{" "}
							<Tag variant="info" size="xs">
								Level 5
							</Tag>{" "}
							with a{" "}
							<Tag variant="success" size="xs">
								7-day streak
							</Tag>
							!
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
