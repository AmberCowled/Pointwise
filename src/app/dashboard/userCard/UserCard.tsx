import { Button } from "@pointwise/app/components/ui/Button";
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

export default function UserCard({ user }: { user: User }) {
	const profilePicture = user.image ?? "";
	const displayName = user.name ?? "";
	const xp = serializeXP(user.xp ?? 0);

	return (
		<Container
			direction="vertical"
			width="full"
			gap="none"
			className="bg-zinc-800/50 border border-zinc-700/50 rounded-sm p-2"
		>
			<Container width="full" className="border-b border-zinc-700/50 pb-2">
				<div className="w-[54px] h-[54px] flex items-center justify-center">
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
				</div>
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
				<Button
					variant="secondary"
					size="xs"
					className="rounded-xs w-full min-h-12 border-[#9d00ff] bg-linear-100 from-[#9d00ff]/50 via-[#a413ff] to-[#9d00ff]/50
                hover:from-[#a413ff]/50 hover:via-[#ad28ff] hover:to-[#a413ff]/50"
				>
					<IoEye className="size-5" />
					<span className="text-sm text-zinc-100 font-semibold text-shadow-md">
						View Profile
					</span>
				</Button>
			</Container>

			<Container width="full" gap="sm">
				<Button
					variant="secondary"
					size="xs"
					className="rounded-xs w-full min-h-12 border-[#3685fc] bg-linear-100 from-[#0033ff]/50 via-[#1271ff] to-[#0033ff]/50
                    hover:from-[#1271ff]/50 hover:via-[#2380ff] hover:to-[#1271ff]/50"
				>
					<IoChatbubble className="size-4" />
					<span className="text-sm text-zinc-100 font-semibold text-shadow-md">
						Message
					</span>
				</Button>
				<Button
					variant="secondary"
					size="xs"
					className="rounded-xs w-full min-h-12 border-[#189d4d] bg-linear-100 from-[#018636]/50 via-[#06913e] to-[#018636]/50
                    hover:from-[#06913e]/50 hover:via-[#139848] hover:to-[#06913e]/50"
				>
					<IoPersonAdd className="size-4" />
					<span className="text-sm text-zinc-100 font-semibold text-shadow-md">
						Add Friend
					</span>
				</Button>
			</Container>

			<Container width="full" className="bg-black/25 rounded-xs my-2">
				<Button
					variant="secondary"
					size="xs"
					className="rounded-xs w-full min-h-12 border-[#fda438] bg-linear-100 from-[#ff8c00]/50 via-[#fc9210]  to-[#ff8c00]/50
                    hover:from-[#fc9210]/50 hover:via-[#ffae4a] hover:to-[#fc9210]/50"
				>
					<IoFolder className="size-4" />
					<span className="text-sm text-zinc-100 font-semibold text-shadow-md">
						Invite to Project
					</span>
				</Button>
			</Container>
		</Container>
	);
}
