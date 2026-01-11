import Container from "@pointwise/app/components/ui/Container";
import { serializeXP } from "@pointwise/lib/api/xp";
import type { User } from "@pointwise/lib/validation/users-schema";
import Image from "next/image";
import {
	IoChatbubble,
	IoEye,
	IoFolder,
	IoPersonAdd,
	IoPersonCircle,
	IoStar,
} from "react-icons/io5";
import ProfilePicture from "./ProfilePicture";
import UserCardButton from "./UserCardButton";

export default function UserCard({ user }: { user: User }) {
	const profilePicture = user.image ?? "";
	const displayName = user.name ?? "";
	const xp = serializeXP(user.xp ?? 0);

	return (
		<Container
			direction="vertical"
			width="full"
			gap="none"
			className="bg-zinc-800/50 border border-zinc-700/50 rounded-sm p-2 pb-0"
		>
			<Container width="full" className="border-b border-zinc-700/50 pb-2">
				<ProfilePicture
					profilePicture={profilePicture}
					displayName={displayName}
				/>
				<Container
					direction="vertical"
					width="full"
					gap="xs"
					className="items-start"
				>
					<Container width="auto">
						<span className="text-zinc-300 text-sm font-semibold">
							{displayName}
						</span>
					</Container>
					<Container
						width="full"
						gap="xs"
						className="text-yellow-500 bg-black/25 rounded-xl p-1"
					>
						<IoStar className="size-3" />
						<span className="text-xs font-light pr-1">{xp.lv}</span>
						<span className="text-xs text-zinc-300/80 font-light">
							{xp.value - xp.lvStartXP} / {xp.nextLvAt - xp.lvStartXP} XP
						</span>
						<div className="flex-1 h-1 bg-zinc-700/50 rounded-full mx-1">
							<div
								className="h-full rounded-full bg-linear-to-r from-indigo-500 via-fuchsia-500 to-rose-500"
								style={{ width: `${xp.progress}%` }}
							/>
						</div>
					</Container>
				</Container>
			</Container>

			<Container width="full" className="rounded-xs my-2">
				<UserCardButton
					icon={<IoEye className="size-4" />}
					label="View Profile"
					color="#9d00ff"
				/>
			</Container>

			<Container width="full" gap="sm">
				<UserCardButton
					icon={<IoChatbubble className="size-4" />}
					label="Message"
					color="#1271ff"
				/>
				<UserCardButton
					icon={<IoPersonAdd className="size-4" />}
					label="Add Friend"
					color="#189d4d"
					onClick={() => {
						console.log("Add Friend");
					}}
				/>
			</Container>

			<Container width="full" className="bg-black/25 rounded-xs my-2">
				<UserCardButton
					icon={<IoFolder className="size-4" />}
					label="Invite to Project"
					color="#fda438"
				/>
			</Container>
		</Container>
	);
}
