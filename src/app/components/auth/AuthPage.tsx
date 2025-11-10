'use client';
import React, { useState } from 'react';
import BackgroundGlow from '../general/BackgroundGlow';
import BrandHeader from '../general/BrandHeader';
import WelcomeBlock from './WelcomeBlock';
import AuthCard from './AuthCard';
import AuthTabs from './AuthTabs';
import AuthForm from './AuthForm';
import SocialAuthButtons from './SocialAuthButtons';

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <BrandHeader />
        <WelcomeBlock />
        <main className="w-full">
          <AuthCard>
            <AuthTabs tab={tab} onChange={setTab} />
            <AuthForm tab={tab} />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-zinc-900/60 px-2 text-xs text-zinc-400">
                  or
                </span>
              </div>
            </div>
            <SocialAuthButtons />
          </AuthCard>

          <p className="mt-6 text-sm text-zinc-400 leading-relaxed">
            Join the millions of productive users who benefit from our Pointwise
            gamified productivity app. Log in to access your personalised
            dashboard, track your tasks and have fun being productive.
          </p>

          <footer className="mt-10 text-xs text-zinc-500">
            © {new Date().getFullYear()} Amber Cowled. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
}
