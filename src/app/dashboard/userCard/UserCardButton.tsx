import { Button } from "@pointwise/app/components/ui/Button";

interface UserCardButtonProps {
	icon: React.ReactNode;
	label: string;
	color: string;
	disabled?: boolean;
	onClick?: () => void;
}

export default function UserCardButton({
	icon,
	label,
	color,
	disabled = false,
	onClick,
}: UserCardButtonProps) {
	return (
		<Button
			variant="secondary"
			size="xs"
			disabled={disabled}
			className="rounded-xs w-full min-h-12 bg-linear-100 shadow-md hover:brightness-125 hover:cursor-pointer disabled:cursor-not-allowed"
			style={{
				backgroundImage: `linear-gradient(100deg, ${color}50, ${color}, ${color}50)`,
				borderColor: color,
			}}
			onClick={onClick}
		>
			{icon}
			<span className="text-sm text-zinc-100 font-semibold text-shadow-md">
				{label}
			</span>
		</Button>
	);
}
