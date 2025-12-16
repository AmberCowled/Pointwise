/**
 * Email validation function
 * @param email - Email address to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateEmail(email: string): string | undefined {
	if (!email) return "Email is required";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return "Please enter a valid email address";
	}
	return undefined;
}

/**
 * Password validation function
 * @param password - Password to validate
 * @param isSignup - Whether this is for signup (stricter requirements)
 * @returns Error message if invalid, undefined if valid
 */
export function validatePassword(password: string, isSignup: boolean): string | undefined {
	if (!password) return "Password is required";
	if (isSignup && password.length < 8) {
		return "Password must be at least 8 characters";
	}
	return undefined;
}

/**
 * Password strength calculation (0-4 scale)
 * @param password - Password to calculate strength for
 * @returns Strength score from 0-4
 */
export function calculatePasswordStrength(password: string): number {
	let strength = 0;
	if (password.length >= 8) strength++;
	if (password.length >= 12) strength++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
	if (/\d/.test(password)) strength++;
	if (/[^a-zA-Z0-9]/.test(password)) strength++;
	return Math.min(4, strength);
}

/**
 * Password strength labels
 */
export const PASSWORD_STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"] as const;
