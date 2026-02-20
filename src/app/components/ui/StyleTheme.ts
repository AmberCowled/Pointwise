/**
 * Centralized style theme for Pointwise.
 *
 * All values are Tailwind CSS class strings designed to be used with clsx().
 * Changing a value here updates every component that references it.
 *
 * Usage:
 *   import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
 *   <div className={clsx(StyleTheme.Container.Background, StyleTheme.Container.Border.Primary)} />
 */

// Raw hex colors for direct use
const brandColors = {
	primary: "#3B0270",
	secondary: "#6F00FF",
	tertiary: "#3A2BFF",
} as const;

// ─── Raw Color Palette ───────────────────────────────────────────────
// Consumed by composite tokens below; not exported directly.

const palette = {
	brandFrom: `from-[${brandColors.primary}]`,
	brandVia: `via-[${brandColors.secondary}]`,
	brandTo: `to-[${brandColors.tertiary}]`,

	disabledFrom: "from-zinc-600",
	disabledVia: "via-zinc-500",
	disabledTo: "to-zinc-600",
} as const;

// ─── Exported Theme Tokens ───────────────────────────────────────────

export const StyleTheme = {
	// ── Galaxy Gradient (primary brand) ──────────────────────────────
	GalaxyGradientStops: `${palette.brandFrom} ${palette.brandVia} ${palette.brandTo}`,
	GalaxyGradient: `bg-gradient-to-r ${palette.brandFrom} ${palette.brandVia} ${palette.brandTo} bg-[length:200%_200%]`,
	GalaxyGradientDisabled: `bg-gradient-to-r ${palette.disabledFrom} ${palette.disabledVia} ${palette.disabledTo}`,

	// Linear variant used by BackgroundGlow (combined with a direction class)
	GalaxyGlow: `${palette.brandFrom}/30 ${palette.brandVia}/20 ${palette.brandTo}/20`,

	// ── Container / Card ─────────────────────────────────────────────
	Container: {
		Background: "bg-zinc-900/60 backdrop-blur",
		BackgroundSolid: "bg-zinc-950",
		BackgroundSubtle: "bg-zinc-900/50",
		BackgroundInput: "bg-white/5",
		BackgroundInputSecondary: "bg-zinc-900",
		BackgroundDanger: "bg-rose-500/25 backdrop-blur",
		BackgroundDangerSubtle: "bg-rose-500/10",
		BackgroundEmpty: "bg-zinc-800/50",
		BackgroundMuted: "bg-zinc-800/50",

		Border: {
			Primary: "border-white/10",
			Secondary: "border-white/5",
			Subtle: "border-zinc-700/50",
			Dark: "border-zinc-800",
			Danger: "border-rose-400/40",
			DangerStrong: "border-rose-400/60",
		},

		Shadow: "shadow-2xl shadow-black/40",
	},

	// ── Divider ──────────────────────────────────────────────────────
	Divider: {
		Subtle: "border-white/10",
		Prominent: "border-white/20",
	},

	// ── Text ─────────────────────────────────────────────────────────
	Text: {
		Primary: "text-zinc-100",
		PrimaryBright: "text-white",
		Body: "text-zinc-200",
		Tertiary: "text-zinc-300",
		Secondary: "text-zinc-400",
		Muted: "text-zinc-500",
		Placeholder: "placeholder:text-zinc-500",
		Error: "text-rose-400",
	},

	// ── Shadows ──────────────────────────────────────────────────────
	Shadow: {
		Card: "shadow-2xl shadow-black/40",
		ButtonPrimary: `shadow-lg shadow-[${brandColors.secondary}]/20`,
		ButtonDisabled: "shadow-zinc-700/20",
		Focus:
			"shadow-[0_0_0_3px_rgba(255,255,255,0.35),0_10px_25px_-10px_rgba(0,0,0,0.6)]",
		Inner: "shadow-inner shadow-white/5",
	},

	// ── Accent / Focus ───────────────────────────────────────────────
	Accent: {
		FocusRingPrimary: "focus:ring-2 focus:ring-indigo-500/40",
		FocusRingSecondary: "focus:ring-2 focus:ring-[#6F00FF]/40",
		FocusRingDanger: "focus:ring-2 focus:ring-rose-500/40",

		FocusBorderPrimary: "focus:border-indigo-400/60",
		FocusBorderSecondary: "focus:border-[#6F00FF]/50",
		FocusBorderDanger: "focus:border-rose-500/80",
	},

	// ── Hover ────────────────────────────────────────────────────────
	Hover: {
		Subtle: "hover:bg-white/5",
		TextBrighten: "hover:text-zinc-200",
		BorderLift: "hover:border-white/20",
		BorderLiftSecondary: "hover:border-white/15",
		DangerBg: "hover:bg-rose-500/20",
		DangerBorder: "hover:border-rose-400/70",
	},

	// ── Semantic / Status ────────────────────────────────────────────
	Status: {
		Success: {
			border: "border-emerald-400/40",
			bg: "bg-emerald-500/10",
			text: "text-emerald-200",
			textContent: "text-emerald-100",
			shadow: "shadow-emerald-500/20",
		},
		Error: {
			border: "border-rose-400/40",
			bg: "bg-rose-500/10",
			text: "text-rose-200",
			textContent: "text-rose-100",
			shadow: "shadow-rose-500/20",
		},
		Warning: {
			border: "border-amber-400/40",
			bg: "bg-amber-500/10",
			text: "text-amber-200",
			textContent: "text-amber-100",
			shadow: "shadow-amber-500/20",
		},
		Info: {
			border: "border-indigo-400/40",
			bg: "bg-indigo-500/10",
			text: "text-indigo-200",
			textContent: "text-indigo-100",
			shadow: "shadow-indigo-500/20",
		},
	},

	// ── Tag (extends Status with primary/secondary/info variants) ───
	Tag: {
		Primary: "bg-indigo-500/10 text-indigo-200",
		Secondary: "bg-white/10 text-zinc-300",
		Info: "bg-cyan-500/10 text-cyan-200",
	},

	// ── Skeleton ─────────────────────────────────────────────────────
	Skeleton: {
		Primary: "bg-white/10",
		Secondary: "bg-white/5",
	},

	// ── Interactive (selected states, pagination) ────────────────────
	Interactive: {
		SelectedPrimary: "bg-indigo-500/20 text-white",
		SelectedSecondary: `bg-[${brandColors.secondary}]/20 text-white`,

		HoverPrimary:
			"hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white",
		HoverSecondary: `hover:border-[${brandColors.secondary}]/50 hover:bg-[${brandColors.secondary}]/10 hover:text-white`,

		ActivePagePrimary:
			"border-indigo-400/60 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20",
		ActivePageSecondary: `border-[${brandColors.secondary}]/60 bg-[${brandColors.secondary}]/20 text-white shadow-lg shadow-[${brandColors.secondary}]/20`,

		// Checkbox checked states
		CheckedPrimary: "checked:bg-indigo-500 checked:border-indigo-500",
		CheckedSecondary: `checked:bg-[${brandColors.secondary}]/20 checked:border-[${brandColors.secondary}]/50`,
		CheckedDanger: "checked:bg-rose-500 checked:border-rose-500",

		// Selector
		Selected: "bg-indigo-500/10 border-indigo-500/50 text-indigo-400",
	},

	// ── Input list/dropdown ──────────────────────────────────────────
	Dropdown: {
		Background: "bg-zinc-900",
		OptionHover: "bg-indigo-500/10 text-white",
		OptionSelected: "bg-indigo-500/20 text-white",
	},

	// ── Error Styles (for input/form error states) ───────────────────
	ErrorBorder: {
		Primary: "border-rose-400/60 focus:border-rose-400/80",
		Secondary: "border-rose-400/60 focus:border-rose-400/80",
		Danger: "border-rose-500/80 focus:border-rose-500/90",
	},

	// ── BorderGlow defaults ──────────────────────────────────────────
	BorderGlow: {
		DefaultColors: [
			brandColors.secondary,
			brandColors.tertiary,
		] as readonly string[],
	},

	// ── Cosmic Background (raw rgba values for inline styles) ────────
	Cosmic: {
		NebulaColors: {
			violet: "rgba(111,0,255,0.25)",
			violetSecondary: "rgba(111,0,255,0.18)",
			blue: "rgba(58,43,255,0.2)",
			pink: "rgba(58,43,255,0.15)",
			deepPurple: "rgba(59,2,112,0.15)",
		},
		CloudColors: {
			lightPurple: "rgba(111,0,255,0.22)",
			lightBlue: "rgba(58,43,255,0.2)",
			lightPink: "rgba(58,43,255,0.18)",
			softPurple: "rgba(111,0,255,0.25)",
			softPink: "rgba(111,0,255,0.2)",
			midPurple: "rgba(58,43,255,0.22)",
			midBlue: "rgba(59,2,112,0.18)",
			deepPurple: "rgba(59,2,112,0.2)",
		},
	},

	// ── Brand Colors (raw hex values for direct use) ─────────────────
	BrandColors: brandColors,
} as const;

export type StyleThemeType = typeof StyleTheme;
