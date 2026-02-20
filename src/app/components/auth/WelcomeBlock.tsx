import Container from "../ui/Container";
import { StyleTheme } from "../ui/StyleTheme";
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
			<h1 className="text-3xl text-zinc-100 font-bold">{title}</h1>
			<p className={`${StyleTheme.Text.Body} text-sm`}>{subtitle}</p>
		</Container>
	);
}
