"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import clsx from "clsx";
import { useState } from "react";
import {
	IoColorPaletteOutline,
	IoLockClosedOutline,
	IoNotificationsOutline,
	IoPersonOutline,
	IoSettings,
} from "react-icons/io5";
import ProfileSettings from "./ProfileSettings";

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
			<Grid
				columns={{ default: 1, sm: 4 }}
				gap="none"
				className="mt-3 bg-zinc-900/50 border border-b-2 border-zinc-800"
			>
				<Button
					variant="ghost"
					className={clsx(
						"min-h-14 rounded-none",
						activeTab === Tab.PROFILE && "border-b-2 border-blue-500",
					)}
					onClick={() => setActiveTab(Tab.PROFILE)}
				>
					<IoPersonOutline className="text-zinc-200 size-5 shrink-0" />
					<span className="text-sm font-medium text-zinc-200">Profile</span>
				</Button>
				<Button
					variant="ghost"
					className={clsx(
						"min-h-14 rounded-none",
						activeTab === Tab.ACCOUNT && "border-b-2 border-blue-500",
					)}
					onClick={() => setActiveTab(Tab.ACCOUNT)}
				>
					<IoLockClosedOutline className="text-zinc-200 size-5 shrink-0" />
					<span className="text-sm font-medium text-zinc-200">Account</span>
				</Button>
				<Button
					variant="ghost"
					className={clsx(
						"min-h-14 rounded-none",
						activeTab === Tab.NOTIFICATIONS && "border-b-2 border-blue-500",
					)}
					onClick={() => setActiveTab(Tab.NOTIFICATIONS)}
				>
					<IoNotificationsOutline className="text-zinc-200 size-5 shrink-0" />
					<span className="text-sm font-medium text-zinc-200">
						Notifications
					</span>
				</Button>
				<Button
					variant="ghost"
					className={clsx(
						"min-h-14 rounded-none",
						activeTab === Tab.APPEARANCE && "border-b-2 border-blue-500",
					)}
					onClick={() => setActiveTab(Tab.APPEARANCE)}
				>
					<IoColorPaletteOutline className="text-zinc-200 size-5 shrink-0" />
					<span className="text-sm font-medium text-zinc-200">Appearance</span>
				</Button>
			</Grid>

			<Container
				width="full"
				gap="none"
				className="bg-zinc-900/50 border border-zinc-800 mt-2 p-3 px-4"
			>
				<IoSettings className="text-zinc-400 size-6 shrink-0 mr-3" />
				<h2 className="text-xl font-semibold text-zinc-300">
					{activeTab === Tab.PROFILE && "Profile Settings"}
					{activeTab === Tab.ACCOUNT && "Account Settings"}
					{activeTab === Tab.NOTIFICATIONS && "Notifications Settings"}
					{activeTab === Tab.APPEARANCE && "Appearance Settings"}
				</h2>
			</Container>
			<Container
				width="full"
				className="bg-zinc-900/50 border border-t-0 border-zinc-800"
				gap="none"
			>
				{activeTab === Tab.PROFILE && <ProfileSettings />}
			</Container>
		</Container>
	);
}
