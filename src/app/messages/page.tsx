"use client";

import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";
import MessagesOverview from "./MessagesOverview";

export default function MessagesPage() {
	return (
		<Page>
			<Navbar />
			<MessagesOverview />
		</Page>
	);
}
