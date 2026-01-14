"use client";

import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";
import SettingsOverview from "./SettingsOverview";

export default function SettingsPage() {
	return (
		<Page>
			<Navbar />
			<SettingsOverview />
		</Page>
	);
}
