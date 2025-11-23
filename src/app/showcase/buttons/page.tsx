'use client';

import { useState } from 'react';
import GradientButton from '@pointwise/app/components/ui/GradientButton';
import { Button } from '@pointwise/app/components/ui/Button';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';

// Simple icon components for OAuth examples
function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.08-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleClick = (id: string) => async () => {
    setLoading(id);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(null);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Button Showcase</h1>
          <p className="text-sm text-zinc-400">
            Comprehensive display of all button variants, sizes, and states
          </p>
        </div>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <div className="space-y-3">
            <Button variant="primary" size="md">
              Primary
            </Button>
            <Button variant="secondary" size="md">
              Secondary
            </Button>
            <Button variant="danger" size="md">
              Danger
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="xs">
              Extra Small
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="primary" size="xl">
              Extra Large
            </Button>
          </div>
        </section>

        {/* States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="md"
              loading={loading === 'loading-primary'}
              onClick={handleClick('loading-primary')}
            >
              {loading === 'loading-primary' ? 'Loading...' : 'Click to Load'}
            </Button>
            <Button variant="primary" size="md" disabled>
              Disabled
            </Button>
            <Button variant="secondary" size="md" loading>
              Loading State
            </Button>
            <Button variant="secondary" size="md" disabled>
              Disabled State
            </Button>
          </div>
        </section>

        {/* Loading Types */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Loading Types</h2>
          <p className="text-xs text-zinc-500">
            Different spinner types for loading states
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="primary" size="md" loading loadingType="circular">
              Circular
            </Button>
            <Button variant="primary" size="md" loading loadingType="dots">
              Dots
            </Button>
            <Button variant="primary" size="md" loading loadingType="bars">
              Bars
            </Button>
            <Button variant="secondary" size="md" loading loadingType="circular">
              Circular
            </Button>
            <Button variant="secondary" size="md" loading loadingType="dots">
              Dots
            </Button>
            <Button variant="secondary" size="md" loading loadingType="bars">
              Bars
            </Button>
          </div>
        </section>

        {/* Full Width */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Full Width</h2>
          <Button variant="primary" size="md" fullWidth>
            Full Width Button
          </Button>
          <Button variant="secondary" size="md" fullWidth>
            Secondary Full Width
          </Button>
        </section>

        {/* Variant × Size Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Variant × Size Matrix
          </h2>
          <div className="space-y-6">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                  Size: {size}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size={size}>
                    Primary
                  </Button>
                  <Button variant="secondary" size={size}>
                    Secondary
                  </Button>
                  <Button variant="danger" size={size}>
                    Danger
                  </Button>
                  <Button variant="ghost" size={size}>
                    Ghost
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stacked / OAuth Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Stacked Layout (OAuth Example)
          </h2>
          <p className="text-xs text-zinc-500">
            Using the <code className="text-zinc-400">stack</code> prop to
            display icon above text, perfect for OAuth buttons
          </p>
          <div className="space-y-3 max-w-md">
            <Button variant="secondary" size="lg" fullWidth stack>
              <GoogleIcon />
              Continue with Google
            </Button>
            <Button variant="secondary" size="lg" fullWidth stack>
              <AppleIcon />
              Continue with Apple
            </Button>
            <Button variant="secondary" size="lg" fullWidth stack>
              <GitHubIcon />
              Continue with GitHub
            </Button>
          </div>
        </section>

        {/* Legacy GradientButton */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Legacy Component
          </h2>
          <GradientButton>Old Gradient Button</GradientButton>
        </section>
      </div>
    </div>
  );
}
