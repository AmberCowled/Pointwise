"use client";

import { useState } from "react";
import BorderGlow from "@pointwise/app/components/ui/BorderGlow";
import Container from "@pointwise/app/components/ui/Container";
import Page from "@pointwise/app/components/ui/Page";
import { Button } from '@headlessui/react';

export default function TestPage() {
	const [rotationsPerSecond, setRotationsPerSecond] = useState(0.2);
	const [edgeThickness, setEdgeThickness] = useState(2.0);
	const [blurStdDeviation, setBlurStdDeviation] = useState(2.0);
	const [blurBrightness, setBlurBrightness] = useState(3.0);

	return ( <Page width="full">
		<Container direction="vertical" width="full" gap="none" className="items-center justify-center min-h-screen relative">

			<BorderGlow>
				<Container
				direction="vertical"
				width="full"
				gap="none"
				className="absolute top-4 left-4 bg-black/50 p-4 rounded-lg space-y-4"
				>
					<h1 className="text-4xl font-bold">Test</h1>
					<p className="text-lg">This is a test</p>
					<Button>Test</Button>
				</Container>
			</BorderGlow>

			{/* Controls */}
			<div className="absolute top-4 left-4 bg-black/50 p-4 rounded-lg space-y-4">
				<div>
					<label className="text-white text-sm block mb-2">
						Rotations per second: {rotationsPerSecond}
					</label>
					<input
						type="range"
						min="0"
						max="5"
						step="0.1"
						value={rotationsPerSecond}
						onChange={(e) => setRotationsPerSecond(parseFloat(e.target.value))}
						className="w-full"
					/>
				</div>

				<div>
					<label className="text-white text-sm block mb-2">
						Edge thickness: {edgeThickness}px
					</label>
					<input
						type="range"
						min="0.5"
						max="12"
						step="0.5"
						value={edgeThickness}
						onChange={(e) => setEdgeThickness(parseFloat(e.target.value))}
						className="w-full"
					/>
				</div>
				<div>
					<label className="text-white text-sm block mb-2">
						Blur strength: {blurStdDeviation}
					</label>
					<input
						type="range"
						min="0"
						max="8"
						step="0.1"
						value={blurStdDeviation}
						onChange={(e) => setBlurStdDeviation(parseFloat(e.target.value))}
						className="w-full"
					/>
				</div>
				<div>
					<label className="text-white text-sm block mb-2">
						Blur brightness: {blurBrightness}
					</label>
					<input
						type="range"
						min="0.5"
						max="8"
						step="0.1"
						value={blurBrightness}
						onChange={(e) => setBlurBrightness(parseFloat(e.target.value))}
						className="w-full"
					/>
				</div>
			</div>
		</Container>
	</Page>);
}