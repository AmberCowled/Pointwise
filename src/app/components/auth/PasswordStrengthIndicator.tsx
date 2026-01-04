"use client";

import { ProgressBar } from "../ui/ProgressBar";
import { calculatePasswordStrength } from "./utils/validation";

interface PasswordStrengthIndicatorProps {
	password: string;
}

const MAX_STRENGTH = 4;

/**
 * Password strength indicator component
 * Displays a visual progress bar showing password strength (0-4 scale)
 */
export function PasswordStrengthIndicator({
	password,
}: PasswordStrengthIndicatorProps) {
	if (!password) return null;

	const strength = calculatePasswordStrength(password);

	return (
		<ProgressBar
			value={strength}
			maxValue={MAX_STRENGTH}
			heightClass="h-1.5"
			overwriteColorClass={(normalisedUsage) => {
				// Map normalized usage (0-1) to strength-based colors
				if (normalisedUsage <= 0.25) return "bg-rose-400"; // 0-1: Very weak/Weak
				if (normalisedUsage <= 0.5) return "bg-amber-400"; // 1-2: Fair
				if (normalisedUsage <= 0.75) return "bg-blue-400"; // 2-3: Good
				return "bg-emerald-400"; // 3-4: Strong
			}}
		/>
	);
}
