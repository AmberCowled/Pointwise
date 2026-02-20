import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";

interface DisplayNameProps {
	displayName: string;
	href: string;
}

export default function DisplayName({ displayName, href }: DisplayNameProps) {
	return (
		<a
			href={href}
			className={`${StyleTheme.Text.Tertiary} text-sm font-semibold hover:underline cursor-pointer`}
		>
			{displayName}
		</a>
	);
}
