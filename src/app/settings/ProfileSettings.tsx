"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import Input from "@pointwise/app/components/ui/Input";
import InputArea from "@pointwise/app/components/ui/InputArea";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import ProfilePicture from "@pointwise/app/dashboard/userCard/ProfilePicture";
import {
	useGetUserQuery,
	useUpdateUserMutation,
} from "@pointwise/lib/redux/services/usersApi";
import { useEffect, useState } from "react";
import { IoCloudUpload, IoSave, IoTrashBin } from "react-icons/io5";

export default function ProfileSettings() {
	const { data: userData, isLoading: isUserLoading } = useGetUserQuery();
	const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
	const { showNotification } = useNotifications();

	const user = userData?.user;

	// Form state - initialize with safe defaults
	const [displayName, setDisplayName] = useState("");
	const [bio, setBio] = useState("");
	const [location, setLocation] = useState("");
	const [website, setWebsite] = useState("");
	const [profileVisibility, setProfileVisibility] = useState<
		"PRIVATE" | "PUBLIC"
	>("PRIVATE");
	const [displayNameError, setDisplayNameError] = useState("");

	// Update form state when user data loads
	useEffect(() => {
		if (user) {
			setDisplayName(user.displayName || "");
			setBio(user.bio || "");
			setLocation(user.location || "");
			setWebsite(user.website || "");
			setProfileVisibility(
				(user.profileVisibility as "PRIVATE" | "PUBLIC") || "PRIVATE",
			);
		}
	}, [user]);

	const handleSave = async () => {
		const trimmedDisplayName = displayName.trim();

		// Client-side validation
		if (!trimmedDisplayName) {
			setDisplayNameError("Display name is required");
			showNotification({
				message: "Display name is required",
				variant: "error",
			});
			return;
		}

		// Clear any previous errors
		setDisplayNameError("");

		try {
			await updateUser({
				displayName: trimmedDisplayName,
				bio: bio.trim() || null,
				location: location.trim() || null,
				website: website.trim() || null,
				profileVisibility,
			}).unwrap();

			showNotification({
				message: "Profile updated successfully",
				variant: "success",
			});
		} catch (_error) {
			showNotification({
				message: "Failed to update profile",
				variant: "error",
			});
		}
	};

	if (isUserLoading) {
		return (
			<Container direction="vertical" width="full" className="py-4">
				<div>Loading...</div>
			</Container>
		);
	}

	if (!user) {
		return (
			<Container direction="vertical" width="full" className="py-4">
				<div>Failed to load user data</div>
			</Container>
		);
	}
	return (
		<Container direction="vertical" width="full" className="py-4">
			<Grid columns={{ default: 1, sm: 2 }}>
				<Container width="full">
					<Container>
						<ProfilePicture
							profilePicture={user?.image ?? ""}
							displayName={user?.displayName ?? ""}
							size="xl"
						/>
						<Container direction="vertical" width="full" gap="sm">
							<Button className="w-full rounded-none">
								<IoCloudUpload />
								Upload New
							</Button>
							<Button variant="secondary" className="w-full rounded-none">
								<IoTrashBin />
								Remove
							</Button>
						</Container>
					</Container>
				</Container>
			</Grid>

			<Container direction="vertical">
				<Grid columns={{ default: 1, sm: 3 }}>
					<Container width="full">
						<Input
							label="Full Name"
							flex="grow"
							defaultValue={user.name ?? ""}
							disabled
							className="rounded-none"
						/>
					</Container>
					<Container width="full">
						<Input
							label="Display Name"
							flex="grow"
							defaultValue={user.displayName}
							onChange={(value) => {
								setDisplayName(value);
								// Clear error when user starts typing
								if (displayNameError) setDisplayNameError("");
							}}
							className="rounded-none"
							error={displayNameError}
							required
						/>
					</Container>
					<Container width="full">
						<Input
							label="Email"
							flex="grow"
							defaultValue={user.email ?? ""}
							disabled
							className="rounded-none"
						/>
					</Container>
				</Grid>

				<Container width="full">
					<InputArea
						flex="grow"
						label="Bio"
						defaultValue={user.bio ?? ""}
						onChange={setBio}
						className="rounded-none"
						rows={5}
						maxLength={500}
					/>
				</Container>

				<Grid columns={{ default: 1, sm: 3 }}>
					<Container width="full">
						<Input
							label="Location"
							flex="grow"
							defaultValue={user.location ?? ""}
							onChange={setLocation}
							className="rounded-none"
							maxLength={100}
						/>
					</Container>
					<Container width="full">
						<Input
							label="Website"
							flex="grow"
							defaultValue={user.website ?? ""}
							onChange={setWebsite}
							className="rounded-none"
							type="url"
							placeholder="https://example.com"
						/>
					</Container>
				</Grid>

				<Container width="full" className="pb-3 border-b border-zinc-800">
					<span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
						Public Profile
					</span>
					<label className="relative inline-flex cursor-pointer">
						<input
							type="checkbox"
							className="sr-only peer"
							checked={profileVisibility === "PUBLIC"}
							onChange={(e) =>
								setProfileVisibility(e.target.checked ? "PUBLIC" : "PRIVATE")
							}
						/>
						<div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-500/75 transition-colors" />
						<div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
					</label>
				</Container>

				<Container width="full" className="justify-center">
					<Grid columns={{ default: 1, sm: 3 }}>
						<Button
							className="w-full rounded-none"
							onClick={handleSave}
							disabled={isUpdating}
							loading={isUpdating}
						>
							<IoSave />
							Save Changes
						</Button>
					</Grid>
				</Container>
			</Container>
		</Container>
	);
}
