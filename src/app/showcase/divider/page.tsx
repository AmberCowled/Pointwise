'use client';

import { Divider } from '@pointwise/app/components/ui/Divider';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';

export default function DividerShowcasePage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Divider Showcase</h1>
          <p className="text-sm text-zinc-400">
            Comprehensive display of all divider variants, orientations, and use
            cases
          </p>
        </div>

        {/* Basic Horizontal Dividers */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Basic Horizontal Dividers
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400 mb-2">Subtle variant</p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <p className="text-sm text-zinc-300 mb-4">
                  Content above the divider
                </p>
                <Divider variant="subtle" />
                <p className="text-sm text-zinc-300 mt-4">
                  Content below the divider
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-2">Prominent variant</p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <p className="text-sm text-zinc-300 mb-4">
                  Content above the divider
                </p>
                <Divider variant="prominent" />
                <p className="text-sm text-zinc-300 mt-4">
                  Content below the divider
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal Dividers with Labels */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Horizontal Dividers with Labels
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Subtle with &quot;or&quot; label
              </p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <p className="text-sm text-zinc-300 mb-4">Sign in with email</p>
                <Divider variant="subtle" label="or" />
                <p className="text-sm text-zinc-300 mt-4">
                  Sign in with social
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Prominent with custom label
              </p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <p className="text-sm text-zinc-300 mb-4">Section A</p>
                <Divider variant="prominent" label="Section Break" />
                <p className="text-sm text-zinc-300 mt-4">Section B</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                With custom label content
              </p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <p className="text-sm text-zinc-300 mb-4">Before</p>
                <Divider
                  variant="subtle"
                  label={
                    <span className="flex items-center gap-2">
                      <span>•</span>
                      <span>Continue</span>
                      <span>•</span>
                    </span>
                  }
                />
                <p className="text-sm text-zinc-300 mt-4">After</p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Spacing Variants
          </h2>
          <div className="space-y-6">
            {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map(
              (spacing) => (
                <div key={spacing}>
                  <p className="text-sm text-zinc-400 mb-2">
                    Spacing: {spacing}
                  </p>
                  <div className="bg-zinc-900/40 p-4 rounded-lg">
                    <p className="text-sm text-zinc-300">Content above</p>
                    <Divider variant="subtle" spacing={spacing} />
                    <p className="text-sm text-zinc-300">Content below</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Vertical Dividers */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Vertical Dividers
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Basic vertical divider
              </p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <div className="flex items-center h-20">
                  <div className="flex-1 text-sm text-zinc-300">
                    Left content
                  </div>
                  <Divider orientation="vertical" variant="subtle" />
                  <div className="flex-1 text-sm text-zinc-300">
                    Right content
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Prominent vertical divider
              </p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <div className="flex items-center h-20">
                  <div className="flex-1 text-sm text-zinc-300">
                    Left content
                  </div>
                  <Divider orientation="vertical" variant="prominent" />
                  <div className="flex-1 text-sm text-zinc-300">
                    Right content
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Vertical divider with label
              </p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <div className="flex items-center h-32">
                  <div className="flex-1 text-sm text-zinc-300">
                    Left section
                  </div>
                  <Divider
                    orientation="vertical"
                    variant="subtle"
                    label="VS"
                    spacing="sm"
                  />
                  <div className="flex-1 text-sm text-zinc-300">
                    Right section
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Use Cases</h2>
          <div className="space-y-6">
            {/* Auth Form Divider */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Auth Form (Current Pattern)
              </h3>
              <div className="bg-zinc-900/40 p-6 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-sm outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3 py-2 text-sm outline-none"
                      placeholder="Enter your password"
                    />
                  </div>
                  <button className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium">
                    Sign In
                  </button>
                  <Divider variant="subtle" label="or" spacing="md" />
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-4 py-2 text-sm">
                      Google
                    </button>
                    <button className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-4 py-2 text-sm">
                      GitHub
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Separator */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Section Separator
              </h3>
              <div className="bg-zinc-900/40 p-6 rounded-lg space-y-4">
                <div>
                  <h4 className="text-base font-semibold mb-2">
                    Profile Settings
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Manage your personal information and preferences
                  </p>
                </div>
                <Divider variant="subtle" spacing="lg" />
                <div>
                  <h4 className="text-base font-semibold mb-2">Security</h4>
                  <p className="text-sm text-zinc-400">
                    Update your password and security settings
                  </p>
                </div>
              </div>
            </div>

            {/* List Item Separator */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                List Item Separator
              </h3>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <div className="space-y-0">
                  <div className="py-3">
                    <p className="text-sm font-medium">Task 1</p>
                    <p className="text-xs text-zinc-400">Description</p>
                  </div>
                  <Divider variant="subtle" spacing="none" />
                  <div className="py-3">
                    <p className="text-sm font-medium">Task 2</p>
                    <p className="text-xs text-zinc-400">Description</p>
                  </div>
                  <Divider variant="subtle" spacing="none" />
                  <div className="py-3">
                    <p className="text-sm font-medium">Task 3</p>
                    <p className="text-xs text-zinc-400">Description</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Layout */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Sidebar Layout (Vertical)
              </h3>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <div className="flex h-40">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Navigation</p>
                    <ul className="text-xs text-zinc-400 space-y-1">
                      <li>Home</li>
                      <li>Dashboard</li>
                      <li>Settings</li>
                    </ul>
                  </div>
                  <Divider
                    orientation="vertical"
                    variant="subtle"
                    spacing="md"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Main Content</p>
                    <p className="text-xs text-zinc-400">
                      This is the main content area separated by a vertical
                      divider.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison View */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Comparison View
              </h3>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <div className="flex h-48">
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2">Plan A</p>
                    <ul className="text-xs text-zinc-400 space-y-1">
                      <li>Feature 1</li>
                      <li>Feature 2</li>
                      <li>Feature 3</li>
                    </ul>
                  </div>
                  <Divider
                    orientation="vertical"
                    variant="prominent"
                    label="VS"
                    spacing="lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2">Plan B</p>
                    <ul className="text-xs text-zinc-400 space-y-1">
                      <li>Feature 1</li>
                      <li>Feature 2</li>
                      <li>Feature 3</li>
                      <li>Feature 4</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Width vs Inline */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Full Width vs Inline
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400 mb-2">Full width (default)</p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <p className="text-sm text-zinc-300 mb-4">Content</p>
                <Divider variant="subtle" />
                <p className="text-sm text-zinc-300 mt-4">Content</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Inline (not full width)
              </p>
              <div className="bg-zinc-900/40 p-4 rounded-lg">
                <p className="text-sm text-zinc-300 mb-4">Content</p>
                <div className="flex justify-center">
                  <Divider
                    variant="subtle"
                    fullWidth={false}
                    className="w-32"
                  />
                </div>
                <p className="text-sm text-zinc-300 mt-4">Content</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
