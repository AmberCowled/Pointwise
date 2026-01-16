"use client";

import Container from "@pointwise/app/components/ui/Container";
import CosmicBackground from "@pointwise/app/components/ui/CosmicBackground";

export default function TestPage() {
	return (
		<div className="min-h-screen w-full text-zinc-100 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
			<CosmicBackground />
			<Container
				direction="vertical"
				gap="sm"
				width="auto"
				cosmicBorder
				className=" bg-zinc-900/60 px-8 py-6 text-center backdrop-blur"
			>
				<h1 className="text-2xl font-semibold">Cosmic Container</h1>
				<p className="text-sm text-zinc-300">Animated cosmic border effect.</p>
			</Container>
		</div>
	);
}
