"use client";

import Container from "@pointwise/app/components/ui/Container";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { ToggleSwitch } from "@pointwise/app/components/ui/ToggleSwitch";
import {
	useGetNotificationSettingsQuery,
	useUpdateNotificationSettingsMutation,
} from "@pointwise/generated/api";
import type { NotificationSettingsType } from "@pointwise/lib/validation/notification-settings-schema";
import { useState } from "react";
import { IoSave } from "react-icons/io5";
import { Button } from "../components/ui/Button";

type SettingsKey = keyof NotificationSettingsType;

export default function NotificationSettings() {
	const { data, isLoading } = useGetNotificationSettingsQuery();
	const [updateSettings, { isLoading: isSaving }] =
		useUpdateNotificationSettingsMutation();
	const { showNotification } = useNotifications();

	const [edits, setEdits] = useState<Partial<NotificationSettingsType>>({});

	if (isLoading || !data?.settings) {
		return (
			<Container direction="vertical" width="full" className="py-4">
				<div>Loading...</div>
			</Container>
		);
	}

	const settings = data.settings;

	const get = (key: SettingsKey): boolean => edits[key] ?? settings[key];

	const set = (key: SettingsKey) => (value: boolean) => {
		setEdits((prev) => ({ ...prev, [key]: value }));
	};

	const hasChanges = (Object.keys(edits) as SettingsKey[]).some(
		(key) => edits[key] !== settings[key],
	);

	const pushEnabled = get("pushEnabled");

	const handleSave = async () => {
		const merged: NotificationSettingsType = {
			pushEnabled: get("pushEnabled"),
			pushMessages: get("pushMessages"),
			pushFriendRequests: get("pushFriendRequests"),
			pushProjectActivity: get("pushProjectActivity"),
			pushTaskAssignments: get("pushTaskAssignments"),
			pushComments: get("pushComments"),
			pushTaskStatusChanges: get("pushTaskStatusChanges"),
			pushLikes: get("pushLikes"),
		};

		try {
			await updateSettings(merged).unwrap();
			setEdits({});
			showNotification({
				message: "Notification settings saved",
				variant: "success",
			});
		} catch {
			showNotification({
				message: "Failed to save notification settings",
				variant: "error",
			});
		}
	};

	const toggles = [
		{
			label: "Messages",
			description: "New direct messages",
			key: "pushMessages" as SettingsKey,
		},
		{
			label: "Friend Requests",
			description: "Incoming friend requests and acceptances",
			key: "pushFriendRequests" as SettingsKey,
		},
		{
			label: "Project Activity",
			description: "Invites, join requests, role changes, and removals",
			key: "pushProjectActivity" as SettingsKey,
		},
		{
			label: "Task Assignments",
			description: "When you are assigned to a task",
			key: "pushTaskAssignments" as SettingsKey,
		},
		{
			label: "Task Completions",
			description:
				"When a task you're assigned to or administrate is completed",
			key: "pushTaskStatusChanges" as SettingsKey,
		},
		{
			label: "Comments",
			description: "Comments on your tasks and posts",
			key: "pushComments" as SettingsKey,
		},
		{
			label: "Likes",
			description: "When someone likes your task or post",
			key: "pushLikes" as SettingsKey,
		},
	];

	return (
		<Container direction="vertical" width="full" className="pt-3 gap-4">
			<Container
				width="full"
				className={`items-center justify-between border-b ${StyleTheme.Container.Border.Dark} pb-3`}
			>
				<div>
					<span
						className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Secondary}`}
					>
						Enable Push Notifications
					</span>
					<p className="text-xs text-zinc-500 mt-1">
						Receive browser notifications when you&apos;re not on the site
					</p>
				</div>
				<ToggleSwitch checked={pushEnabled} onChange={set("pushEnabled")} />
			</Container>

			{toggles.map((toggle) => (
				<Container
					key={toggle.label}
					width="full"
					className={`items-center justify-between border-b ${StyleTheme.Container.Border.Dark} pb-3`}
				>
					<div>
						<span
							className={`text-sm font-medium ${pushEnabled ? StyleTheme.Text.Primary : "text-zinc-600"}`}
						>
							{toggle.label}
						</span>
						<p
							className={`text-xs mt-0.5 ${pushEnabled ? "text-zinc-500" : "text-zinc-700"}`}
						>
							{toggle.description}
						</p>
					</div>
					<ToggleSwitch
						checked={get(toggle.key)}
						onChange={set(toggle.key)}
						disabled={!pushEnabled}
					/>
				</Container>
			))}

			<Button
				fullWidth
				onClick={handleSave}
				disabled={isSaving || !hasChanges}
				loading={isSaving}
			>
				<IoSave className="text-lg" />
				Save Changes
			</Button>
		</Container>
	);
}
