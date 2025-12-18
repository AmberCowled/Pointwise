"use client";

import BrandHeaderV2 from "@pointwise/app/components/general/BrandHeaderV2";
import Container from "@pointwise/app/components/general/Container";
import Search from "./Search";
import UserMenu from "./UserMenu";

export default function NavbarV2() {
	return (
		<div className="w-full border-b border-white/10 bg-zinc-950 z-1">
			<Container direction="vertical">
				<Container className="py-2" gap="sm">
					<BrandHeaderV2 size="sm" />
					<Search
						onSearch={(query, filter) => console.log("Searching:", query, "\nFilter:", filter)}
					/>
					<UserMenu />
				</Container>
			</Container>
		</div>
	);
}
