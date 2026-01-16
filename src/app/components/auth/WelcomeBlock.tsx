import Container from "../ui/Container";
import type { AuthTab } from "./types";

type Props = {
	tab: AuthTab;
};

const WELCOME_MESSAGES: Record<AuthTab, { title: string; subtitle: string }> = {
	signin: {
		title: "Welcome Back",
		subtitle: "Level up your productivity with your gamified dashboard",
	},
	signup: {
		title: "Create Your Account",
		subtitle: "Join Pointwise & start your productivity journey today",
	},
};

export default function WelcomeBlock({ tab }: Props) {
	const { title, subtitle } = WELCOME_MESSAGES[tab];

	return (
		<Container direction="vertical" gap="none">
			<h1 className="text-3xl text-zinc-100 font-bold mb-1">{title}</h1>
			<p className="text-zinc-200 text-sm">{subtitle}</p>
		</Container>
	);
}
