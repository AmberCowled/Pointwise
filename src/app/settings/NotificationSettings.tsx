"use client";

import Container from "@pointwise/app/components/ui/Container";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { ToggleSwitch } from "@pointwise/app/components/ui/ToggleSwitch";
import {
	useGetNotificationSettingsQuery,
	useUpdateNotificationSettingsMutation,
} from "@pointwise/generated/api";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { IoSave } from "react-icons/io5";
import { Button } from "../components/ui/Button";

export default function NotificationSettings() {
	const { data: session } = useSession();
	const { data, isLoading } = useGetNotificationSettingsQuery(undefined, {
		skip: !session?.user?.id,
	});
	const [updateSettings, { isLoading: isSaving }] =
		useUpdateNotificationSettingsMutation();
	const { showNotification } = useNotifications();

	const [pushEnabled, setPushEnabled] = useState(true);
	const [pushMessages, setPushMessages] = useState(true);
	const [pushFriendRequests, setPushFriendRequests] = useState(true);
	const [pushProjectActivity, setPushProjectActivity] = useState(true);
	const [pushTaskAssignments, setPushTaskAssignments] = useState(true);
	const [pushComments, setPushComments] = useState(true);
	const [pushTaskStatusChanges, setPushTaskStatusChanges] = useState(true);
	const [pushLikes, setPushLikes] = useState(true);

	useEffect(() => {
		if (data?.settings) {
			const s = data.settings;
			setPushEnabled(s.pushEnabled);
			setPushMessages(s.pushMessages);
			setPushFriendRequests(s.pushFriendRequests);
			setPushProjectActivity(s.pushProjectActivity);
			setPushTaskAssignments(s.pushTaskAssignments);
			setPushComments(s.pushComments);
			setPushTaskStatusChanges(s.pushTaskStatusChanges);
			setPushLikes(s.pushLikes);
		}
	}, [data]);

	const hasChanges = (() => {
		if (!data?.settings) return false;
		const s = data.settings;
		return (
			pushEnabled !== s.pushEnabled ||
			pushMessages !== s.pushMessages ||
			pushFriendRequests !== s.pushFriendRequests ||
			pushProjectActivity !== s.pushProjectActivity ||
			pushTaskAssignments !== s.pushTaskAssignments ||
			pushComments !== s.pushComments ||
			pushTaskStatusChanges !== s.pushTaskStatusChanges ||
			pushLikes !== s.pushLikes
		);
	})();

	const handleSave = async () => {
		try {
			await updateSettings({
				pushEnabled,
				pushMessages,
				pushFriendRequests,
				pushProjectActivity,
				pushTaskAssignments,
				pushComments,
				pushTaskStatusChanges,
				pushLikes,
			}).unwrap();
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

	if (isLoading) {
		return (
			<Container direction="vertical" width="full" className="py-4">
				<div>Loading...</div>
			</Container>
		);
	}

	const toggles = [
		{
			label: "Messages",
			description: "New direct messages",
			checked: pushMessages,
			onChange: setPushMessages,
		},
		{
			label: "Friend Requests",
			description: "Incoming friend requests and acceptances",
			checked: pushFriendRequests,
			onChange: setPushFriendRequests,
		},
		{
			label: "Project Activity",
			description: "Invites, join requests, role changes, and removals",
			checked: pushProjectActivity,
			onChange: setPushProjectActivity,
		},
		{
			label: "Task Assignments",
			description: "When you are assigned to a task",
			checked: pushTaskAssignments,
			onChange: setPushTaskAssignments,
		},
		{
			label: "Task Completions",
			description:
				"When a task you're assigned to or administrate is completed",
			checked: pushTaskStatusChanges,
			onChange: setPushTaskStatusChanges,
		},
		{
			label: "Comments",
			description: "Comments on your tasks and posts",
			checked: pushComments,
			onChange: setPushComments,
		},
		{
			label: "Likes",
			description: "When someone likes your task or post",
			checked: pushLikes,
			onChange: setPushLikes,
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
				<ToggleSwitch checked={pushEnabled} onChange={setPushEnabled} />
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
						checked={toggle.checked}
						onChange={toggle.onChange}
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
