"use client";

import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";
import ProfileOverview from "../ProfileOverview";

export default function ProfilePage() {
	return (
		<Page>
			<Navbar />
			<ProfileOverview />
		</Page>
	);
}
