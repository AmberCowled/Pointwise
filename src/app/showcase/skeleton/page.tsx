"use client";

import BackgroundGlow from "@pointwise/app/components/ui/BackgroundGlow";
import { Skeleton } from "@pointwise/app/components/ui/Skeleton";
import { SkeletonCard } from "@pointwise/app/components/ui/SkeletonCard";
import { SkeletonText } from "@pointwise/app/components/ui/SkeletonText";

export default function SkeletonShowcasePage() {
	return (
		<div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
			<BackgroundGlow />
			<div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
				<div>
					<h1 className="text-3xl font-bold mb-2">Skeleton Component Showcase</h1>
					<p className="text-sm text-zinc-400">
						Comprehensive display of Skeleton components for content placeholders
					</p>
				</div>

				{/* Skeleton - Basic */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Skeleton Basic</h2>
					<p className="text-xs text-zinc-500">
						Basic skeleton placeholders with custom width and height
					</p>
					<div className="space-y-4">
						<div className="flex flex-wrap items-center gap-4">
							<Skeleton width="200px" height="20px" />
							<Skeleton width="150px" height="20px" />
							<Skeleton width="100px" height="20px" />
						</div>
						<div className="flex flex-wrap items-center gap-4">
							<Skeleton width="100px" height="100px" />
							<Skeleton width="80px" height="80px" circular />
						</div>
						<Skeleton width="100%" height="40px" />
					</div>
				</section>

				{/* Skeleton - Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Skeleton Variants</h2>
					<p className="text-xs text-zinc-500">Different visual styles for different contexts</p>
					<div className="space-y-4">
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Primary variant</span>
							<Skeleton width="100%" height="20px" variant="primary" />
						</div>
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Secondary variant</span>
							<Skeleton width="100%" height="20px" variant="secondary" />
						</div>
					</div>
				</section>

				{/* Skeleton - Circular */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Circular Skeleton</h2>
					<p className="text-xs text-zinc-500">Perfect for avatars and profile pictures</p>
					<div className="flex flex-wrap items-center gap-6">
						<Skeleton width="32px" height="32px" circular />
						<Skeleton width="48px" height="48px" circular />
						<Skeleton width="64px" height="64px" circular />
						<Skeleton width="96px" height="96px" circular />
					</div>
				</section>

				{/* SkeletonText - Basic */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">SkeletonText</h2>
					<p className="text-xs text-zinc-500">Text content placeholders with multiple lines</p>
					<div className="space-y-6 max-w-md">
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">3 lines (default)</span>
							<SkeletonText lines={3} />
						</div>
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">5 lines</span>
							<SkeletonText lines={5} />
						</div>
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">2 lines</span>
							<SkeletonText lines={2} />
						</div>
					</div>
				</section>

				{/* SkeletonText - Varying Widths */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">SkeletonText with Varying Widths</h2>
					<p className="text-xs text-zinc-500">
						Realistic text placeholders with different line lengths
					</p>
					<div className="space-y-6 max-w-md">
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Array of widths (more realistic)</span>
							<SkeletonText lines={4} width={["100%", "90%", "75%", "60%"]} />
						</div>
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Fixed width</span>
							<SkeletonText lines={3} width="80%" />
						</div>
					</div>
				</section>

				{/* SkeletonCard - Basic */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">SkeletonCard</h2>
					<p className="text-xs text-zinc-500">Card content placeholders for complex layouts</p>
					<div className="space-y-6 max-w-md">
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Basic card</span>
							<SkeletonCard />
						</div>
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">With header</span>
							<SkeletonCard showHeader lines={2} />
						</div>
					</div>
				</section>

				{/* SkeletonCard - With Image */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">SkeletonCard with Image</h2>
					<p className="text-xs text-zinc-500">Card with avatar/image placeholder</p>
					<div className="space-y-6 max-w-md">
						<SkeletonCard showHeader showImage lines={3} />
					</div>
				</section>

				{/* SkeletonCard - Full Featured */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">SkeletonCard Full Featured</h2>
					<p className="text-xs text-zinc-500">
						Complete card with header, image, body, and footer
					</p>
					<div className="space-y-6 max-w-md">
						<SkeletonCard showHeader showImage lines={4} showFooter />
					</div>
				</section>

				{/* Real-World Examples */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Real-World Examples</h2>
					<p className="text-xs text-zinc-500">Common use cases for skeleton components</p>
					<div className="space-y-6">
						{/* Task List Skeleton */}
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-zinc-300">Task List Loading</h3>
							<div className="space-y-3 max-w-md">
								{[1, 2, 3].map((i) => (
									<div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<div className="flex items-start gap-3">
											<Skeleton width="20px" height="20px" circular />
											<div className="flex-1 space-y-2">
												<Skeleton width="60%" height="1rem" />
												<SkeletonText lines={2} width={["100%", "80%"]} />
												<div className="flex gap-2">
													<Skeleton width="80px" height="1.5rem" />
													<Skeleton width="60px" height="1.5rem" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Profile Card Skeleton */}
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-zinc-300">Profile Card Loading</h3>
							<div className="max-w-sm">
								<div className="rounded-2xl border border-white/10 bg-white/5 p-6">
									<div className="flex flex-col items-center gap-4">
										<Skeleton width="96px" height="96px" circular />
										<div className="w-full space-y-2 text-center">
											<Skeleton width="60%" height="1.5rem" className="mx-auto" />
											<Skeleton width="40%" height="1rem" className="mx-auto" />
										</div>
										<SkeletonText lines={3} width="full" />
										<div className="flex gap-2 w-full">
											<Skeleton width="50%" height="2.5rem" />
											<Skeleton width="50%" height="2.5rem" />
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Dashboard Stats Skeleton */}
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-zinc-300">Dashboard Stats Loading</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<Skeleton width="40%" height="0.75rem" />
										<Skeleton width="80%" height="2rem" className="mt-2" />
										<Skeleton width="60%" height="0.75rem" className="mt-2" />
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Custom Animation Speed */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Custom Animation Speed</h2>
					<p className="text-xs text-zinc-500">Control animation speed for different contexts</p>
					<div className="space-y-6 max-w-md">
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Fast (0.8s)</span>
							<SkeletonText lines={3} speed={0.8} />
						</div>
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Normal (1.5s)</span>
							<SkeletonText lines={3} speed={1.5} />
						</div>
						<div className="space-y-2">
							<span className="text-xs text-zinc-500">Slow (2.5s)</span>
							<SkeletonText lines={3} speed={2.5} />
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
