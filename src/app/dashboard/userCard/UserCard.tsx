import type { User } from "@pointwise/lib/validation/users-schema";
import Image from "next/image";
import { IoPersonOutline } from "react-icons/io5";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export default function UserCard({ user }: { user: User }) {
	return (
		<Card flex="grow">
			<Image
				src={user.image ?? ""}
				alt={user.name ?? ""}
				width={100}
				height={100}
				className="rounded-full"
			/>
			<p className="text-lg font-bold text-zinc-300">{user.name}</p>
			<p className="text-zinc-300 text-sm font-medium">{user.xp} XP</p>
			<Button className="bg-linear-to-r from-indigo-500 via-fuchsia-500 to-rose-500 text-white">
				<IoPersonOutline className="size-4" />
				View Profile
			</Button>
		</Card>
	);
}
