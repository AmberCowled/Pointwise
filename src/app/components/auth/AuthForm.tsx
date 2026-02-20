"use client";

import { useSignin } from "@pointwise/hooks/useSignin";
import { useSignup } from "@pointwise/hooks/useSignup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import Grid from "../ui/Grid";
import { Input } from "../ui/Input";
import { useNotifications } from "../ui/NotificationProvider";
import { StyleTheme } from "../ui/StyleTheme";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import type { AuthTab } from "./types";
import {
	calculatePasswordStrength,
	PASSWORD_STRENGTH_LABELS,
	validateEmail,
	validatePassword,
} from "./utils/validation";

type Props = {
	tab: AuthTab;
	onLoadingChange?: (isLoading: boolean) => void;
};

export default function AuthForm({ tab, onLoadingChange }: Props) {
	const { signup, loading: signupLoading, error: signupError } = useSignup();
	const { signin, loading: signinLoading, error: signinError } = useSignin();
	const { showNotification } = useNotifications();

	// Form state management
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);

	// Validation state
	const [emailError, setEmailError] = useState<string | undefined>();
	const [passwordError, setPasswordError] = useState<string | undefined>();

	const isLoading = tab === "signup" ? signupLoading : signinLoading;

	// Notify parent of loading state changes
	useEffect(() => {
		onLoadingChange?.(isLoading);
	}, [isLoading, onLoadingChange]);

	// Calculate password strength for signup
	const passwordStrength = useMemo(() => {
		if (tab === "signup" && password) {
			return calculatePasswordStrength(password);
		}
		return 0;
	}, [password, tab]);

	// Password strength description
	const passwordStrengthText = useMemo(() => {
		if (tab !== "signup" || !password) return undefined;
		return PASSWORD_STRENGTH_LABELS[passwordStrength];
	}, [password, passwordStrength, tab]);

	// Show error notifications (prevent duplicate notifications)
	useEffect(() => {
		const error = tab === "signup" ? signupError : signinError;
		if (error) {
			showNotification({
				message: error,
				variant: "error",
			});
		}
	}, [signinError, signupError, tab, showNotification]);

	const onSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			// Validate before submission
			const emailErr = validateEmail(email);
			const passwordErr = validatePassword(password, tab === "signup");

			setEmailError(emailErr);
			setPasswordError(passwordErr);

			if (emailErr || passwordErr) {
				return;
			}

			if (tab === "signup") {
				signup({
					name: `${firstName} ${lastName}`.trim() || undefined,
					email,
					password,
				});
			} else {
				signin(email, password, remember);
			}
		},
		[email, password, firstName, lastName, remember, tab, signup, signin],
	);

	return (
		<form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
			{tab === "signup" && (
				<Grid columns={{ default: 2 }} gap="md">
					<Input
						id={"firstName"}
						name="firstName"
						type="text"
						label="First name"
						placeholder="John"
						variant="secondary"
						size="md"
						flex="grow"
						onChange={setFirstName}
						disabled={isLoading}
						className={`${StyleTheme.Container.BackgroundSubtle}`}
					/>
					<Input
						id={"lastName"}
						name="lastName"
						type="text"
						label="Last name"
						placeholder="Smith"
						variant="secondary"
						size="md"
						flex="grow"
						onChange={setLastName}
						disabled={isLoading}
						className={`${StyleTheme.Container.BackgroundSubtle}`}
					/>
				</Grid>
			)}

			<Input
				id={"email"}
				name="email"
				type="email"
				label="Email"
				placeholder="you@example.com"
				variant="secondary"
				size="md"
				flex="grow"
				onChange={setEmail}
				autoComplete="email"
				error={emailError}
				required
				disabled={isLoading}
				className={`${StyleTheme.Container.BackgroundSubtle}`}
			/>

			<div className="space-y-2">
				<Input
					id={"password"}
					name="password"
					type="password"
					label="Password"
					placeholder={tab === "signin" ? "••••••••" : "At least 8 characters"}
					variant="secondary"
					size="md"
					flex="grow"
					onChange={setPassword}
					autoComplete={tab === "signin" ? "current-password" : "new-password"}
					showPasswordToggle
					error={passwordError}
					className={`${StyleTheme.Container.BackgroundSubtle}`}
					description={
						tab === "signup"
							? passwordStrengthText
								? `Strength: ${passwordStrengthText}`
								: "At least 8 characters"
							: undefined
					}
					required
					disabled={isLoading}
				/>
				{tab === "signup" && <PasswordStrengthIndicator password={password} />}
			</div>

			{tab === "signin" && (
				<div className="flex items-center justify-between">
					<Checkbox
						name="remember"
						label="Remember me"
						variant="secondary"
						size="sm"
						onChange={setRemember}
						disabled={isLoading}
						className={`${StyleTheme.Container.BackgroundSubtle}`}
					/>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							// TODO: Implement forgot password functionality
						}}
						className={`text-xs ${StyleTheme.Text.Secondary} ${StyleTheme.Hover.TextBrighten} transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 rounded px-1`}
						aria-label="Reset your password"
					>
						Forgot password?
					</button>
				</div>
			)}

			<Button
				type="submit"
				variant="primary"
				size="md"
				fullWidth
				loading={isLoading}
				disabled={isLoading}
			>
				{tab === "signin" ? "Continue" : "Create account"}
			</Button>
		</form>
	);
}
