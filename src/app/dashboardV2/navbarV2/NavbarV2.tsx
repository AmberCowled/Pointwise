"use client";

import BrandHeaderV2 from "@pointwise/app/components/general/BrandHeaderV2";
import Container from "@pointwise/app/components/general/Container";
import { Button } from "@pointwise/app/components/ui/Button";
import { FaUserPlus } from "react-icons/fa";
import { IoMail, IoNotifications } from "react-icons/io5";
import Search from "./Search";
import UserMenu from "./UserMenu";

export default function NavbarV2() {
	return (
		<div className="w-full border-b border-white/10 bg-zinc-950 z-1">
			<Container direction="vertical" gap="sm">
				<Container className="pt-2" gap="sm">
					<BrandHeaderV2 size="sm" />
					<Search
						onSearch={(query, filter) => console.log("Searching:", query, "\nFilter:", filter)}
					/>
					<UserMenu />
				</Container>
				<Container className="">
					<div className="flex shrink-0">Level: 4</div>
					<div className="flex shrink-0">Streak: 6</div>
					<Container className="justify-end">
						<Button icon={IoMail} />
						<Button icon={IoNotifications} />
						<Button icon={FaUserPlus} />
					</Container>
				</Container>
			</Container>
		</div>
	);
}
