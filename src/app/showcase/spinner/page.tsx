"use client";

import BackgroundGlow from "@pointwise/app/components/general/BackgroundGlow";
import { Spinner } from "@pointwise/app/components/ui/Spinner";

export default function SpinnerShowcasePage() {
	return (
		<div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
			<BackgroundGlow />
			<div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
				<div>
					<h1 className="text-3xl font-bold mb-2">Spinner Component Showcase</h1>
					<p className="text-sm text-zinc-400">
						Comprehensive display of Spinner component variants, sizes, and types
					</p>
				</div>

				{/* Spinner - Types */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Spinner Types</h2>
					<p className="text-xs text-zinc-500">Different animation styles for loading indicators</p>
					<div className="flex flex-wrap items-center gap-6">
						<div className="flex flex-col items-center gap-2">
							<Spinner type="circular" size="md" />
							<span className="text-xs text-zinc-500">Circular</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<Spinner type="dots" size="md" />
							<span className="text-xs text-zinc-500">Dots</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<Spinner type="bars" size="md" />
							<span className="text-xs text-zinc-500">Bars</span>
						</div>
					</div>
				</section>

				{/* Spinner - Sizes */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Spinner Sizes</h2>
					<p className="text-xs text-zinc-500">Size variants matching other component system</p>
					<div className="flex flex-wrap items-center gap-6">
						{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
							<div key={size} className="flex flex-col items-center gap-2">
								<Spinner type="circular" size={size} />
								<span className="text-xs text-zinc-500 uppercase">{size}</span>
							</div>
						))}
					</div>
				</section>

				{/* Spinner - Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Spinner Variants</h2>
					<p className="text-xs text-zinc-500">Color variants for different contexts</p>
					<div className="flex flex-wrap items-center gap-6">
						<div className="flex flex-col items-center gap-2">
							<Spinner variant="primary" size="lg" />
							<span className="text-xs text-zinc-500">Primary</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<Spinner variant="secondary" size="lg" />
							<span className="text-xs text-zinc-500">Secondary</span>
						</div>
					</div>
				</section>

				{/* Spinner - Custom Speed */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Custom Animation Speed</h2>
					<p className="text-xs text-zinc-500">Control animation speed for different use cases</p>
					<div className="flex flex-wrap items-center gap-6">
						<div className="flex flex-col items-center gap-2">
							<Spinner type="circular" size="md" speed={0.5} />
							<span className="text-xs text-zinc-500">Fast (0.5s)</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<Spinner type="circular" size="md" speed={1} />
							<span className="text-xs text-zinc-500">Normal (1s)</span>
						</div>
						<div className="flex flex-col items-center gap-2">
							<Spinner type="circular" size="md" speed={2} />
							<span className="text-xs text-zinc-500">Slow (2s)</span>
						</div>
					</div>
				</section>

				{/* Spinner - Type × Size Matrix */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Spinner Type × Size Matrix</h2>
					<p className="text-xs text-zinc-500">All combinations of types and sizes</p>
					<div className="space-y-6">
						{(["circular", "dots", "bars"] as const).map((type) => (
							<div key={type} className="space-y-3">
								<h3 className="text-sm font-medium text-zinc-300 capitalize">Type: {type}</h3>
								<div className="flex flex-wrap items-center gap-6">
									{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
										<div key={size} className="flex flex-col items-center gap-2">
											<Spinner type={type} size={size} />
											<span className="text-xs text-zinc-500 uppercase">{size}</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Spinner - Type × Variant Matrix */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Spinner Type × Variant Matrix</h2>
					<p className="text-xs text-zinc-500">All combinations of types and variants</p>
					<div className="space-y-6">
						{(["circular", "dots", "bars"] as const).map((type) => (
							<div key={type} className="space-y-3">
								<h3 className="text-sm font-medium text-zinc-300 capitalize">Type: {type}</h3>
								<div className="flex flex-wrap items-center gap-6">
									{(["primary", "secondary"] as const).map((variant) => (
										<div key={variant} className="flex flex-col items-center gap-2">
											<Spinner type={type} variant={variant} size="lg" />
											<span className="text-xs text-zinc-500 capitalize">{variant}</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Real-World Examples */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Real-World Examples</h2>
					<p className="text-xs text-zinc-500">Common use cases for spinner components</p>
					<div className="space-y-6">
						{/* Button Loading */}
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-zinc-300">Button Loading State</h3>
							<div className="flex items-center gap-4">
								<button
									className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white flex items-center gap-2"
									disabled
								>
									<Spinner size="sm" variant="primary" />
									Loading...
								</button>
								<button
									className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 flex items-center gap-2"
									disabled
								>
									<Spinner size="sm" variant="secondary" />
									Processing...
								</button>
							</div>
						</div>

						{/* Inline Loading */}
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-zinc-300">Inline Loading Indicator</h3>
							<div className="flex items-center gap-2 text-zinc-300">
								<Spinner size="sm" />
								<span>Loading tasks...</span>
							</div>
						</div>

						{/* Center Loading */}
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-zinc-300">Centered Loading Overlay</h3>
							<div className="relative h-32 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
								<Spinner size="lg" />
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
