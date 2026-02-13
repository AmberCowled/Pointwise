import clsx from "clsx";
import Image from "next/image";
import { IoPersonCircle } from "react-icons/io5";

// Size mappings for different profile picture sizes
const sizeMappings = {
	xs: { dimension: 32, className: "w-8 h-8" },
	sm: { dimension: 40, className: "w-10 h-10" },
	md: { dimension: 54, className: "w-[54px] h-[54px]" },
	lg: { dimension: 64, className: "w-16 h-16" },
	xl: { dimension: 80, className: "w-20 h-20" },
	full: { dimension: 0, className: "w-full h-full" },
};

interface ProfilePictureProps {
	profilePicture: string;
	displayName: string;
	href?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
	disabled?: boolean;
	className?: string;
}

export default function ProfilePicture({
	profilePicture,
	displayName,
	href,
	size = "md",
	disabled = false,
	className: customClassName,
}: ProfilePictureProps) {
	const { dimension, className } = sizeMappings[size];

	const content = (
		<>
			{profilePicture ? (
				<Image
					src={profilePicture}
					alt={displayName}
					width={dimension || 500}
					height={dimension || 500}
					className="rounded-full w-full h-full object-cover"
					unoptimized
				/>
			) : (
				<IoPersonCircle className="w-full h-full text-zinc-400 scale-120" />
			)}
		</>
	);

	const containerClasses = clsx(
		className,
		"flex items-center justify-center overflow-hidden rounded-full",
		customClassName,
	);

	if (disabled || !href) {
		return <div className={containerClasses}>{content}</div>;
	}

	return (
		<a href={href} className={containerClasses}>
			{content}
		</a>
	);
}
