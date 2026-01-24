import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import clsx from "clsx";

interface UserCardButtonProps {
	icon: React.ReactNode;
	label: string;
	color: string;
	tooltip?: string;
	disabled?: boolean;
	onClick?: () => void;
	className?: string;
}

export default function UserCardButton({
	icon,
	label,
	color,
	tooltip,
	disabled = false,
	onClick,
	className,
}: UserCardButtonProps) {
	return (
		<Button
			variant="secondary"
			size="xs"
			disabled={disabled}
			title={tooltip}
			className={clsx(
				"rounded-xs w-full bg-linear-100 shadow-md hover:brightness-125 hover:cursor-pointer disabled:cursor-not-allowed",
				className,
			)}
			style={{
				backgroundImage: `linear-gradient(100deg, ${color}50, ${color}, ${color}50)`,
				borderColor: color,
			}}
			onClick={onClick}
		>
			<Container direction="vertical" width="full" gap="xs">
				{icon}
				<span className="text-xs text-zinc-100 font-bold text-shadow-md">
					{label}
				</span>
			</Container>
		</Button>
	);
}
