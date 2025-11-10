type Props = {
  tab: 'signin' | 'signup';
  onChange: (t: 'signin' | 'signup') => void;
};

export default function AuthTabs({ tab, onChange }: Props) {
  return (
    <div className="flex rounded-xl bg-zinc-800/60 p-1 w-full">
      <button
        type="button"
        onClick={() => onChange('signin')}
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
        type="button"
        onClick={() => onChange('signup')}
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
  );
}
