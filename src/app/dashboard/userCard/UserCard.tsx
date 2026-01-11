import Container from "@pointwise/app/components/ui/Container";
import type { User } from "@pointwise/lib/validation/users-schema";
import { IoChatbubble, IoFolder, IoPersonAdd } from "react-icons/io5";
import DisplayName from "./DisplayName";
import ProfilePicture from "./ProfilePicture";
import UserCardButton from "./UserCardButton";
import UserLevelStats from "./UserLevelStats";

export default function UserCard({ user }: { user: User }) {
	const profilePicture = user.image ?? "";
	const displayName = user.name ?? "";

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
					href={`/profile/${user.id}`}
				/>
				<Container
					direction="vertical"
					width="full"
					gap="xs"
					className="items-start"
				>
					<Container width="auto">
						<DisplayName
							displayName={displayName}
							href={`/profile/${user.id}`}
						/>
					</Container>
					<Container
						width="full"
						gap="xs"
						className="text-yellow-500 bg-black/25 rounded-xl p-1"
					>
						<UserLevelStats xp={user.xp ?? 0} />
					</Container>
				</Container>
			</Container>

			<Container width="full" gap="sm" className="rounded-xs my-2">
				<UserCardButton
					icon={<IoPersonAdd className="size-4" />}
					label="Add"
					color="#189d4d"
				/>
				<UserCardButton
					icon={<IoChatbubble className="size-4" />}
					label="Message"
					color="#1271ff"
				/>
				<UserCardButton
					icon={<IoFolder className="size-4" />}
					label="Invite"
					color="#fda438"
				/>
			</Container>
		</Container>
	);
}
