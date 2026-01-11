import Image from "next/image";
import { IoPersonCircle } from "react-icons/io5";

interface ProfilePictureProps {
	profilePicture: string;
	displayName: string;
	href: string;
}

export default function ProfilePicture({
	profilePicture,
	displayName,
	href,
}: ProfilePictureProps) {
	return (
		<a
			href={href}
			className="w-[54px] h-[54px] flex items-center justify-center"
		>
			{profilePicture ? (
				<Image
					src={profilePicture}
					alt={displayName}
					width={54}
					height={54}
					className="rounded-full"
				/>
			) : (
				<IoPersonCircle className="w-full h-full text-zinc-400 scale-120" />
			)}
		</a>
	);
}
