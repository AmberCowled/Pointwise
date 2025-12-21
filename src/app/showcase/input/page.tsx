"use client";

import BackgroundGlow from "@pointwise/app/components/ui/BackgroundGlow";
import { Input } from "@pointwise/app/components/ui/Input";
import { useState } from "react";

export default function InputShowcasePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState<string | false>(false);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Input Component Showcase</h1>
          <p className="text-sm text-zinc-400">
            Display of Input component variants, sizes, and use cases
          </p>
        </div>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <p className="text-xs text-zinc-500">
            Different visual styles for different contexts
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              variant="primary"
              placeholder="Primary variant (task modal)"
              name="primary-variant"
              defaultValue=""
            />
            <Input
              variant="secondary"
              placeholder="Secondary variant (auth forms)"
              name="secondary-variant"
              defaultValue=""
            />
            <Input
              variant="danger"
              placeholder="Danger variant (error state)"
              name="danger-variant"
              defaultValue=""
            />
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
          <p className="text-xs text-zinc-500">
            Size variants matching Button component system
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              size="xs"
              placeholder="Extra small (xs)"
              name="size-xs"
              defaultValue=""
            />
            <Input
              size="sm"
              placeholder="Small (sm)"
              name="size-sm"
              defaultValue=""
            />
            <Input
              size="md"
              placeholder="Medium (md) - default"
              name="size-md"
              defaultValue=""
            />
            <Input
              size="lg"
              placeholder="Large (lg)"
              name="size-lg"
              defaultValue=""
            />
            <Input
              size="xl"
              placeholder="Extra large (xl)"
              name="size-xl"
              defaultValue=""
            />
          </div>
        </section>

        {/* Input Types */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Input Types</h2>
          <p className="text-xs text-zinc-500">
            Different HTML input types supported
          </p>
          <div className="space-y-4 max-w-md">
            <Input label="Text" placeholder="Enter text" defaultValue="" />
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              defaultValue=""
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              defaultValue=""
            />
            <Input
              type="number"
              label="Number"
              placeholder="0"
              defaultValue="0"
            />
            <Input type="date" label="Date" defaultValue="" />
            <Input type="datetime-local" label="Date & Time" defaultValue="" />
            <Input
              type="search"
              label="Search"
              placeholder="Search..."
              name="search"
              className="rounded-full"
              defaultValue=""
            />
          </div>
        </section>

        {/* With Label & Description */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            With Label & Description
          </h2>
          <p className="text-xs text-zinc-500">
            Input component with built-in label and description support
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              description="We'll never share your email with anyone else"
              defaultValue=""
            />
            <Input
              label="Task title"
              placeholder="What do you need to get done?"
              description="Keep it concise and actionable"
              required
              defaultValue=""
            />
            <Input
              label="XP reward"
              type="number"
              placeholder="0"
              description="Points earned when task is completed"
              min={0}
              defaultValue="0"
            />
          </div>
        </section>

        {/* Error States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Error States</h2>
          <p className="text-xs text-zinc-500">
            Visual error indication with optional error message
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={true}
              defaultValue="invalid-email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error="Password must be at least 8 characters"
              defaultValue=""
            />
            <Input
              label="Task title"
              placeholder="Enter task title"
              error="Title is required"
              variant="primary"
              defaultValue=""
            />
          </div>
        </section>

        {/* Disabled State */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Disabled State
          </h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Disabled input"
              placeholder="Cannot edit this"
              disabled
              defaultValue="Locked value"
            />
            <Input
              variant="secondary"
              label="Disabled secondary"
              placeholder="Disabled"
              disabled
              defaultValue=""
            />
          </div>
        </section>

        {/* Full Width */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Full Width</h2>
          <div className="space-y-4">
            <Input
              fullWidth
              label="Full width input"
              placeholder="Stretches to container width"
              defaultValue=""
            />
          </div>
        </section>

        {/* Interactive Form Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Interactive Form Example
          </h2>
          <p className="text-xs text-zinc-500">
            Controlled inputs with validation
          </p>
          <form
            className="space-y-4 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) {
                setErrorEmail("Please enter a valid email address");
              } else {
                setErrorEmail(false);
                alert("Form submitted!");
              }
            }}
          >
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorEmail(false);
              }}
              error={errorEmail}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              description="At least 8 characters"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Submit
            </button>
          </form>
        </section>

        {/* Auth Form Pattern Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Auth Form Pattern Example
          </h2>
          <p className="text-xs text-zinc-500">
            Using Input component for authentication forms
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              variant="secondary"
              size="sm"
              label="First name"
              placeholder="John"
              name="firstName"
              defaultValue=""
            />
            <Input
              variant="secondary"
              size="sm"
              label="Last name"
              placeholder="Smith"
              name="lastName"
              defaultValue=""
            />
            <Input
              variant="secondary"
              size="sm"
              label="Email"
              type="email"
              placeholder="you@example.com"
              name="email"
              defaultValue=""
              autoComplete="email"
            />
            <Input
              variant="secondary"
              size="sm"
              label="Password"
              type="password"
              placeholder="••••••••"
              name="password"
              showPasswordToggle
              defaultValue=""
            />
          </div>
        </section>

        {/* Task Modal Pattern Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Task Modal Pattern Example
          </h2>
          <p className="text-xs text-zinc-500">
            Using Input component for task forms
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              variant="primary"
              size="md"
              label="Task title"
              name="taskTitle"
              placeholder="What do you need to get done?"
              error="Title is required"
              required
              defaultValue=""
            />
            <Input
              variant="primary"
              size="md"
              label="XP reward"
              type="number"
              placeholder="0"
              name="xpReward"
              min={0}
              defaultValue="0"
            />
          </div>
        </section>

        {/* Search Bar Pattern */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Search Bar Pattern
          </h2>
          <p className="text-xs text-zinc-500">
            Using className override for rounded-full (special case)
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              type="search"
              placeholder="Search tasks, notes, or people"
              name="dashboard-search"
              className="rounded-full"
              defaultValue=""
            />
          </div>
        </section>

        {/* Variant × Size Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Variant × Size Matrix
          </h2>
          <p className="text-xs text-zinc-500">
            All combinations of variants and sizes
          </p>
          <div className="space-y-6">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
              <div key={size} className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-300 capitalize">
                  Size: {size}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    variant="primary"
                    size={size}
                    placeholder={`Primary ${size}`}
                    name={`primary-${size}`}
                    defaultValue=""
                  />
                  <Input
                    variant="secondary"
                    size={size}
                    placeholder={`Secondary ${size}`}
                    name={`secondary-${size}`}
                    defaultValue=""
                  />
                  <Input
                    variant="danger"
                    size={size}
                    placeholder={`Danger ${size}`}
                    name={`danger-${size}`}
                    defaultValue=""
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Password Toggle Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Password Toggle Feature
          </h2>
          <p className="text-xs text-zinc-500">
            Built-in password visibility toggle with show/hide icons
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              variant="secondary"
              size="sm"
              label="Password"
              type="password"
              placeholder="Enter your password"
              showPasswordToggle
              defaultValue=""
            />
            <Input
              variant="secondary"
              size="sm"
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              showPasswordToggle
              description="Passwords must match"
              defaultValue=""
            />
          </div>
        </section>

        {/* Character Count Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Character Count Feature
          </h2>
          <p className="text-xs text-zinc-500">
            Built-in character counting with color thresholds and progress bar
            option
          </p>
          <div className="space-y-4 max-w-md">
            <Input
              variant="primary"
              size="md"
              label="Task title"
              placeholder="What do you need to get done?"
              maxLength={200}
              showCharCount
              description="Keep it concise and actionable"
              defaultValue=""
            />
            <Input
              variant="primary"
              size="md"
              label="Context / notes"
              placeholder="Add extra detail, links, or reminders"
              maxLength={5000}
              showCharCount
              showProgressBar
              description="Optional detailed context"
              defaultValue=""
            />
            <Input
              variant="primary"
              size="md"
              label="Custom thresholds"
              placeholder="Warning at 50%, error at 75%"
              maxLength={100}
              showCharCount
              showProgressBar
              charCountWarningThreshold={50}
              charCountErrorThreshold={75}
              description="Customizable color thresholds"
              defaultValue=""
            />
          </div>
        </section>
      </div>
    </div>
  );
}
