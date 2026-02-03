"use client";

import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";
import Conversation from "../Conversation";

export default function ConversationPage() {
	return (
		<Page height="full">
			<Navbar />
			<Conversation />
		</Page>
	);
}
