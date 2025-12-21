"use client";

import { useSignin } from "@pointwise/hooks/useSignin";
import { useSignup } from "@pointwise/hooks/useSignup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { useNotifications } from "../ui/NotificationProvider";
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
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

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

  // Real-time email validation (only show error if touched or submit attempted)
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);
      if (emailTouched || submitAttempted) {
        setEmailError(validateEmail(value));
      }
    },
    [emailTouched, submitAttempted],
  );

  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  }, [email]);

  // Real-time password validation (only show error if touched or submit attempted)
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPassword(value);
      if (passwordTouched || submitAttempted) {
        setPasswordError(validatePassword(value, tab === "signup"));
      }
    },
    [passwordTouched, submitAttempted, tab],
  );

  const handlePasswordBlur = useCallback(() => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password, tab === "signup"));
  }, [password, tab]);

  // Handlers for name fields
  const handleFirstNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFirstName(e.target.value);
    },
    [],
  );

  const handleLastNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLastName(e.target.value);
    },
    [],
  );

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
      setSubmitAttempted(true);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="firstName"
            name="firstName"
            type="text"
            label="First name"
            placeholder="John"
            variant="secondary"
            size="md"
            fullWidth
            value={firstName}
            onChange={handleFirstNameChange}
            disabled={isLoading}
          />
          <Input
            id="lastName"
            name="lastName"
            type="text"
            label="Last name"
            placeholder="Smith"
            variant="secondary"
            size="md"
            fullWidth
            value={lastName}
            onChange={handleLastNameChange}
            disabled={isLoading}
          />
        </div>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        variant="secondary"
        size="md"
        fullWidth
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        autoComplete="email"
        error={emailError}
        required
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder={tab === "signin" ? "••••••••" : "At least 8 characters"}
          variant="secondary"
          size="md"
          fullWidth
          value={password}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          autoComplete={tab === "signin" ? "current-password" : "new-password"}
          showPasswordToggle
          error={passwordError}
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
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement forgot password functionality
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 rounded px-1"
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
