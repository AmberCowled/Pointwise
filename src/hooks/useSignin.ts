"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function useSignin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signin = async (email: string, password: string, remember: boolean) => {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // handle manually
      callbackUrl: "/dashboard",
      remember,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = res?.url ?? "/dashboard";
  };

  return { signin, loading, error };
}
