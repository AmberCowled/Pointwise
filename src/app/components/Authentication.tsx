'use client';
import { FcGoogle } from 'react-icons/fc';
import { BsApple } from 'react-icons/bs';
import React, { useState } from 'react';

export default function PointwiseAuth() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      {/* Background gradient flourishes */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-500/30 via-fuchsia-500/20 to-rose-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-bl from-indigo-500/30 via-fuchsia-500/20 to-rose-500/20 blur-3xl" />

      {/* Central card container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        {/* Header / Brand */}
        <header className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 shadow-lg shadow-fuchsia-700/20 grid place-items-center text-xl font-bold">
            PW
          </div>
          <span className="text-2xl font-semibold tracking-tight">
            Pointwise
          </span>
        </header>

        {/* Welcome Section */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Welcome Back</h1>
          <p className="text-zinc-400 text-sm">
            Welcome back, please enter your details.
          </p>
        </section>

        {/* Auth Card */}
        <main className="w-full">
          <div className="bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/40">
            {/* Tabs */}
            <div className="flex rounded-xl bg-zinc-800/60 p-1 w-full">
              <button
                onClick={() => setTab('signin')}
                className={`w-1/2 py-2 text-sm rounded-lg transition ${
                  tab === 'signin'
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                aria-pressed={tab === 'signin'}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('signup')}
                className={`w-1/2 py-2 text-sm rounded-lg transition ${
                  tab === 'signup'
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                aria-pressed={tab === 'signup'}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form className="mt-6 space-y-4 text-left">
              {tab === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs text-zinc-400 mb-1"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Amber"
                      className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs text-zinc-400 mb-1"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Smith"
                      className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs text-zinc-400 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs text-zinc-400 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={
                    tab === 'signin' ? '••••••••' : 'At least 8 characters'
                  }
                  className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
                />
              </div>

              {tab === 'signin' && (
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="accent-fuchsia-500/90" />
                    Remember me
                  </label>
                  <a href="#" className="hover:text-zinc-200">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 py-2.5 text-sm font-medium shadow-lg shadow-fuchsia-700/20 hover:opacity-95 transition"
              >
                {tab === 'signin' ? 'Continue' : 'Create account'}
              </button>

              {/* Social auth */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-zinc-900/60 px-2 text-xs text-zinc-400">
                    or
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex flex-col items-center justify-center rounded-lg bg-zinc-900 border border-white/10 py-2 text-sm hover:bg-zinc-800"
                >
                  <FcGoogle className="text-2xl mb-1" />
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="flex flex-col items-center justify-center rounded-lg bg-zinc-900 border border-white/10 py-2 text-sm hover:bg-zinc-800"
                >
                  <BsApple className="text-2xl mb-1 text-white" />
                  Continue with Apple
                </button>
              </div>
            </form>
          </div>

          {/* Footer blurb */}
          <p className="mt-6 text-sm text-zinc-400 leading-relaxed">
            Join the millions of productive users who benefit from our Pointwise
            gamified productivity app. Log in to access your personalised
            dashboard, track your tasks and have fun being productive.
          </p>

          {/* Footer */}
          <footer className="mt-10 text-xs text-zinc-500">
            © {new Date().getFullYear()} Amber Cowled. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
}
