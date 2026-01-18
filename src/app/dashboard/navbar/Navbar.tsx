"use client";

import BrandHeader from "@pointwise/app/components/general/BrandHeader";
import Container from "@pointwise/app/components/ui/Container";
import { useRouter } from "next/navigation";
import FriendRequestsMenu from "./FriendRequestsMenu";
import LVStat from "./LVStat";
import MessagesMenu from "./MessagesMenu";
import NotificationMenu from "./NotificationMenu";
import Search from "./Search";
import UserMenu from "./UserMenu";
import XPBar from "./XPBar";

export default function Navbar() {
	const router = useRouter();

	return (
		<Container
			direction="vertical"
			gap="sm"
			width="full"
			className="border-b border-white/10 bg-black/75 z-1"
		>
			<Container className="pt-2" gap="sm">
				<BrandHeader size="small" showText={false} showEyebrow={true} />
				<Search
					onSearch={(query) => {
						if (query.trim()) {
							router.push(
								`/dashboard/search?query=${encodeURIComponent(query.trim())}`,
							);
						}
					}}
				/>
				<UserMenu />
			</Container>
			<Container className="justify-between">
				<LVStat />
				<Container width="auto" gap="sm">
					<MessagesMenu />
					<NotificationMenu />
					<FriendRequestsMenu />
				</Container>
			</Container>
			<Container className="pb-2.5">
				<XPBar />
			</Container>
		</Container>
	);
}
