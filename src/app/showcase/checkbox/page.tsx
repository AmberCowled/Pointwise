"use client";

import BackgroundGlow from "@pointwise/app/components/ui/BackgroundGlow";
import { Checkbox } from "@pointwise/app/components/ui/Checkbox";
import { useState } from "react";

export default function CheckboxShowcasePage() {
	const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({
		primary: false,
		secondary: false,
		danger: false,
		disabled: false,
		error: false,
	});

	const handleChange = (key: string) => {
		setCheckedStates((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return (
		<div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
			<BackgroundGlow />
			<div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
				<div>
					<h1 className="text-3xl font-bold mb-2">Checkbox Showcase</h1>
					<p className="text-sm text-zinc-400">
						Comprehensive display of all checkbox variants, sizes, and use cases
					</p>
				</div>

				{/* Variants */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
					<div className="space-y-4">
						<Checkbox
							variant="primary"
							label="Primary variant checkbox"
							defaultChecked={checkedStates.primary}
							onChange={() => handleChange("primary")}
						/>
						<Checkbox
							variant="secondary"
							label="Secondary variant checkbox"
							defaultChecked={checkedStates.secondary}
							onChange={() => handleChange("secondary")}
						/>
						<Checkbox
							variant="danger"
							label="Danger variant checkbox"
							defaultChecked={checkedStates.danger}
							onChange={() => handleChange("danger")}
						/>
					</div>
				</section>

				{/* Sizes */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
					<div className="space-y-4">
						<Checkbox variant="primary" size="xs" label="Extra Small checkbox" />
						<Checkbox variant="primary" size="sm" label="Small checkbox" />
						<Checkbox variant="primary" size="md" label="Medium checkbox" />
						<Checkbox variant="primary" size="lg" label="Large checkbox" />
						<Checkbox variant="primary" size="xl" label="Extra Large checkbox" />
					</div>
				</section>

				{/* Variant × Size Matrix */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Variant × Size Matrix</h2>
					<div className="space-y-6">
						{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
							<div key={size} className="space-y-3">
								<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
									Size: {size}
								</h3>
								<div className="space-y-2">
									<Checkbox variant="primary" size={size} label="Primary variant" />
									<Checkbox variant="secondary" size={size} label="Secondary variant" />
									<Checkbox variant="danger" size={size} label="Danger variant" />
								</div>
							</div>
						))}
					</div>
				</section>

				{/* States */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">States</h2>
					<div className="space-y-4">
						<Checkbox variant="primary" label="Checked checkbox" defaultChecked />
						<Checkbox variant="primary" label="Unchecked checkbox" />
						<Checkbox variant="primary" label="Disabled unchecked" disabled />
						<Checkbox variant="primary" label="Disabled checked" disabled defaultChecked />
						<Checkbox
							variant="primary"
							label="Error state checkbox"
							error="This field is required"
						/>
						<Checkbox
							variant="primary"
							label="Error state (checked)"
							error="Please accept the terms"
							defaultChecked
						/>
					</div>
				</section>

				{/* With Labels and Descriptions */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Labels and Descriptions</h2>
					<div className="space-y-4">
						<Checkbox variant="primary" label="Simple checkbox with label" />
						<Checkbox
							variant="primary"
							label="Checkbox with description"
							description="This is a helpful description that explains what this checkbox does."
						/>
						<Checkbox variant="primary" label="Required checkbox" required />
						<Checkbox
							variant="primary"
							label="Required with description"
							description="You must accept this to continue."
							required
						/>
					</div>
				</section>

				{/* Use Cases */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Use Cases</h2>
					<div className="space-y-6">
						{/* Remember Me */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Remember Me (Auth Form)
							</h3>
							<Checkbox
								variant="secondary"
								size="sm"
								label="Remember me"
								description="Keep me signed in for 30 days"
							/>
						</div>

						{/* Task Options */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Task Options (Task Create Modal)
							</h3>
							<div className="space-y-2">
								<Checkbox
									variant="primary"
									size="sm"
									label="Set due date"
									description="Add a deadline for this task"
								/>
								<Checkbox
									variant="primary"
									size="sm"
									label="Set start date"
									description="Schedule when this task should begin"
								/>
							</div>
						</div>

						{/* Terms and Conditions */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Terms and Conditions
							</h3>
							<Checkbox
								variant="primary"
								label="I agree to the terms and conditions"
								description="By checking this box, you agree to our terms of service and privacy policy."
								required
								error={!checkedStates.error ? false : "You must accept the terms to continue"}
								defaultChecked={checkedStates.error}
								onChange={() => handleChange("error")}
							/>
						</div>

						{/* Notification Preferences */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Notification Preferences
							</h3>
							<div className="space-y-2">
								<Checkbox
									variant="secondary"
									size="sm"
									label="Email notifications"
									defaultChecked
								/>
								<Checkbox variant="secondary" size="sm" label="Push notifications" />
								<Checkbox variant="secondary" size="sm" label="SMS notifications" />
							</div>
						</div>

						{/* Filter Options */}
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Filter Options
							</h3>
							<div className="space-y-2">
								<Checkbox variant="primary" size="sm" label="Show completed tasks" />
								<Checkbox variant="primary" size="sm" label="Show overdue tasks only" />
								<Checkbox variant="primary" size="sm" label="Show high priority only" />
							</div>
						</div>
					</div>
				</section>

				{/* Controlled vs Uncontrolled */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-zinc-200">Controlled vs Uncontrolled</h2>
					<div className="space-y-4">
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Controlled (with state)
							</h3>
							<Checkbox
								variant="primary"
								label="Controlled checkbox"
								defaultChecked={checkedStates.primary}
								onChange={() => handleChange("primary")}
							/>
							<p className="text-xs text-zinc-500">
								Current state: {checkedStates.primary ? "checked" : "unchecked"}
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
								Uncontrolled (with defaultChecked)
							</h3>
							<Checkbox variant="primary" label="Uncontrolled checkbox" defaultChecked />
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
