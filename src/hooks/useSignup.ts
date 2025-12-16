"use client";
import { useApi } from "@pointwise/lib/api";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function useSignup() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const api = useApi();

	const signup = async (values: { name?: string; email: string; password: string }) => {
		setLoading(true);
		setError(null);
		try {
			// API client handles error notifications automatically
			// We still set local error state for form display
			await api.auth.signup(values);

			// auto-login after signup
			const result = await signIn("credentials", {
				email: values.email,
				password: values.password,
				redirect: true,
				callbackUrl: "/dashboard",
			});
			// result will redirect on success
			return result;
		} catch (e: unknown) {
			// Set error for form display (API client already shows notification)
			setError(e instanceof Error ? e.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return { signup, loading, error };
}
