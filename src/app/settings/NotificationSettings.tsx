"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import ToggleSwitch from "@pointwise/app/components/ui/ToggleSwitch";
import {
	useGetNotificationSettingsQuery,
	useUpdateNotificationSettingsMutation,
} from "@pointwise/generated/api";
import { useEffect, useState } from "react";
import { IoSave } from "react-icons/io5";

const CATEGORY_TOGGLES = [
	{ key: "pushMessages", label: "Messages" },
	{ key: "pushFriendRequests", label: "Friend Requests" },
	{ key: "pushProjectActivity", label: "Project Activity" },
	{ key: "pushTaskAssignments", label: "Task Assignments" },
] as const;

export default function NotificationSettings() {
	const { data, isLoading } = useGetNotificationSettingsQuery();
	const [updateSettings, { isLoading: isSaving }] =
		useUpdateNotificationSettingsMutation();
	const { showNotification } = useNotifications();

	const [pushEnabled, setPushEnabled] = useState(false);
	const [pushMessages, setPushMessages] = useState(true);
	const [pushFriendRequests, setPushFriendRequests] = useState(true);
	const [pushProjectActivity, setPushProjectActivity] = useState(true);
	const [pushTaskAssignments, setPushTaskAssignments] = useState(true);

	// Sync from server
	useEffect(() => {
		if (data?.settings) {
			setPushEnabled(data.settings.pushEnabled);
			setPushMessages(data.settings.pushMessages);
			setPushFriendRequests(data.settings.pushFriendRequests);
			setPushProjectActivity(data.settings.pushProjectActivity);
			setPushTaskAssignments(data.settings.pushTaskAssignments);
		}
	}, [data]);

	const localState: Record<string, boolean> = {
		pushEnabled,
		pushMessages,
		pushFriendRequests,
		pushProjectActivity,
		pushTaskAssignments,
	};

	const setters: Record<string, (v: boolean) => void> = {
		pushMessages: setPushMessages,
		pushFriendRequests: setPushFriendRequests,
		pushProjectActivity: setPushProjectActivity,
		pushTaskAssignments: setPushTaskAssignments,
	};

	const hasChanges = (() => {
		if (!data?.settings) return false;
		const s = data.settings;
		if (pushEnabled !== s.pushEnabled) return true;
		if (pushMessages !== s.pushMessages) return true;
		if (pushFriendRequests !== s.pushFriendRequests) return true;
		if (pushProjectActivity !== s.pushProjectActivity) return true;
		if (pushTaskAssignments !== s.pushTaskAssignments) return true;
		return false;
	})();

	const handleSave = async () => {
		try {
			await updateSettings({
				pushEnabled,
				pushMessages,
				pushFriendRequests,
				pushProjectActivity,
				pushTaskAssignments,
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

	return (
		<Container direction="vertical" width="full" className="pt-3">
			{/* Master toggle */}
			<Container
				width="full"
				className={`items-center border-b ${StyleTheme.Container.Border.Dark} pb-2`}
			>
				<span
					className={`text-xs font-semibold uppercase tracking-[0.3em] ${StyleTheme.Text.Secondary}`}
				>
					Enable Push Notifications
				</span>
				<ToggleSwitch checked={pushEnabled} onChange={setPushEnabled} />
			</Container>

			{/* Category toggles */}
			<Container direction="vertical" width="full" gap="sm" className="pt-2">
				{CATEGORY_TOGGLES.map(({ key, label }) => (
					<Container
						key={key}
						width="full"
						className={`items-center border-b ${StyleTheme.Container.Border.Dark} pb-2`}
					>
						<span
							className={`text-sm ${pushEnabled ? StyleTheme.Text.Primary : StyleTheme.Text.Secondary}`}
						>
							{label}
						</span>
						<ToggleSwitch
							checked={localState[key]}
							onChange={setters[key]}
							disabled={!pushEnabled}
						/>
					</Container>
				))}
			</Container>

			<Grid columns={{ default: 1, sm: 3 }}>
				<Button
					fullWidth
					onClick={handleSave}
					disabled={isSaving || !hasChanges}
					loading={isSaving}
				>
					<IoSave className="text-lg" />
					Save Changes
				</Button>
			</Grid>
		</Container>
	);
}
