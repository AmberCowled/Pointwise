"use client";

interface ToggleSwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}

export function ToggleSwitch({
	checked,
	onChange,
	disabled,
}: ToggleSwitchProps) {
	return (
		<label
			className={`relative inline-flex ${disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
		>
			<input
				type="checkbox"
				className="sr-only peer"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				disabled={disabled}
			/>
			<div className="w-11 h-6 bg-zinc-900 peer-focus:outline-none rounded-full peer peer-checked:bg-brand-secondary transition-colors" />
			<div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
		</label>
	);
}
