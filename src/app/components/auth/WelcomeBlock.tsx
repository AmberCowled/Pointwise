import type { AuthTab } from './types';

type Props = {
  tab: AuthTab;
};

const WELCOME_MESSAGES: Record<AuthTab, { title: string; subtitle: string }> = {
  signin: {
    title: 'Welcome Back',
    subtitle: 'Welcome back, please enter your details.',
  },
  signup: {
    title: 'Create Your Account',
    subtitle: 'Join Pointwise and start your productivity journey today.',
  },
};

export default function WelcomeBlock({ tab }: Props) {
  const { title, subtitle } = WELCOME_MESSAGES[tab];

  return (
    <section className="mb-8">
      <h1 className="text-3xl font-bold mb-1">{title}</h1>
      <p className="text-zinc-400 text-sm">{subtitle}</p>
    </section>
  );
}
