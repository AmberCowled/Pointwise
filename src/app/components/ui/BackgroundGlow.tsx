export default function BackgroundGlow() {
	return (
		<>
			<div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-linear-to-tr from-indigo-500/30 via-fuchsia-500/20 to-rose-500/20 blur-3xl" />
			<div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-linear-to-bl from-indigo-500/30 via-fuchsia-500/20 to-rose-500/20 blur-3xl" />
		</>
	);
}
