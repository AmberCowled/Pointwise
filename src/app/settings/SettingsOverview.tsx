"use client";

import Container from "@pointwise/app/components/ui/Container";
import { TabsV2 } from "@pointwise/app/components/ui/TabsV2";
import { useState } from "react";
import { IoSettings } from "react-icons/io5";
import ProfileSettings from "./ProfileSettings";
import BorderGlow from "@pointwise/app/components/ui/BorderGlow";

const TABS = [
	{ id: "profile", label: "Profile" },
	{ id: "account", label: "Account" },
	{ id: "notifications", label: "Notifications" },
	{ id: "appearance", label: "Appearance" },
];

export default function SettingsOverview() {
	enum Tab {
		PROFILE = "profile",
		ACCOUNT = "account",
		NOTIFICATIONS = "notifications",
		APPEARANCE = "appearance",
	}
	const [activeTab, setActiveTab] = useState<Tab>(Tab.PROFILE);

	return (
		<Container direction="vertical" gap="none">
			<Container width="full" className="mt-3 bg-zinc-900/50">
				<TabsV2
					items={TABS}
					value={activeTab}
					onChange={(value) => setActiveTab(value as Tab)}
				/>
			</Container>

			<Container
				direction="vertical"
				width="full"
				gap="none"
				className="rounded-xl bg-zinc-900/75 border-zinc-800 my-2 p-5"
			>
				<Container
					width="full"
					gap="none"
					className="border-b border-zinc-600/20 pb-3"
				>
					<IoSettings className="text-zinc-400 size-6 shrink-0 mr-3" />
					<h2 className="text-xl font-semibold text-zinc-300">
						{activeTab === Tab.PROFILE && "Profile Settings"}
						{activeTab === Tab.ACCOUNT && "Account Settings"}
						{activeTab === Tab.NOTIFICATIONS && "Notifications Settings"}
						{activeTab === Tab.APPEARANCE && "Appearance Settings"}
					</h2>
				</Container>
				<Container width="full" gap="none">
					{activeTab === Tab.PROFILE && <ProfileSettings />}
				</Container>
			</Container>
		</Container>
	);
}
