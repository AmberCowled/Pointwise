import { StyleTheme } from "./StyleTheme";

export default function BackgroundGlow() {
	return (
		<>
			<div
				className={`absolute -top-32 -left-32 h-96 w-96 rounded-full bg-linear-to-tr ${StyleTheme.GalaxyGlow} blur-3xl`}
			/>
			<div
				className={`absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-linear-to-bl ${StyleTheme.GalaxyGlow} blur-3xl`}
			/>
		</>
	);
}
