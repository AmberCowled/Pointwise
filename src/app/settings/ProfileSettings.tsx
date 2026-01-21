"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import Input from "@pointwise/app/components/ui/Input";
import InputArea from "@pointwise/app/components/ui/InputArea";
import InputSelect from "@pointwise/app/components/ui/InputSelect";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import ProfilePicture from "@pointwise/app/dashboard/userCard/ProfilePicture";
import {
	useCheckDisplayNameAvailabilityQuery,
	useGetUserQuery,
	useUpdateUserMutation,
} from "@pointwise/lib/redux/services/usersApi";
import { getCroppedImg } from "@pointwise/lib/utils/image";
import { useUploadThing } from "@pointwise/lib/utils/uploadthing";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { IoCloudUpload, IoSave, IoTrashBin } from "react-icons/io5";
import ProfilePictureCropperModal from "./ProfilePictureCropperModal";

export default function ProfileSettings() {
	const { data: userData, isLoading: isUserLoading } = useGetUserQuery();
	const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
	const { showNotification } = useNotifications();
	const { startUpload } = useUploadThing("profilePictureUploader");

	const user = userData?.user;

	// Form state - initialize with safe defaults
	const [displayName, setDisplayName] = useState("");
	const [debouncedDisplayName, setDebouncedDisplayName] = useState("");
	const [bio, setBio] = useState("");
	const [location, setLocation] = useState("");
	const [website, setWebsite] = useState("");
	const [profileVisibility, setProfileVisibility] = useState<
		"PRIVATE" | "PUBLIC"
	>("PRIVATE");
	const [gender, setGender] = useState<string | null>(null);
	const [displayNameError, setDisplayNameError] = useState("");

	// Image state
	const [selectedOriginalImage, setSelectedOriginalImage] = useState<
		string | null
	>(null);
	const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
	const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
	const [isImageRemoved, setIsImageRemoved] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Update form state when user data loads
	useEffect(() => {
		if (user) {
			setDisplayName(user.displayName || "");
			setDebouncedDisplayName(user.displayName || "");
			setBio(user.bio || "");
			setLocation(user.location || "");
			setWebsite(user.website || "");
			setProfileVisibility(
				(user.profileVisibility as "PRIVATE" | "PUBLIC") || "PRIVATE",
			);
			setGender(user.gender || null);
		}
	}, [user]);

	// Cleanup preview URL
	useEffect(() => {
		return () => {
			if (croppedImageUrl) {
				URL.revokeObjectURL(croppedImageUrl);
			}
		};
	}, [croppedImageUrl]);

	// Handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setSelectedOriginalImage(reader.result as string);
				Modal.Manager.open("profile-picture-cropper");
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle crop completion
	const handleCropComplete = useCallback(
		async (croppedAreaPixels: Area) => {
			if (selectedOriginalImage) {
				const croppedBlob = await getCroppedImg(
					selectedOriginalImage,
					croppedAreaPixels,
				);
				if (croppedBlob) {
					const url = URL.createObjectURL(croppedBlob);
					setCroppedImageBlob(croppedBlob);
					setCroppedImageUrl(url);
					setIsImageRemoved(false);
				}
			}
		},
		[selectedOriginalImage],
	);

	const handleRemoveImage = () => {
		setCroppedImageBlob(null);
		setCroppedImageUrl(null);
		setIsImageRemoved(true);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Debounce display name changes
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedDisplayName(displayName);
		}, 500);
		return () => clearTimeout(timer);
	}, [displayName]);

	const isDisplayNameChanged =
		user && displayName.trim() !== (user.displayName || "").trim();

	const { data: availabilityData, isFetching: isCheckingAvailability } =
		useCheckDisplayNameAvailabilityQuery(
			{ name: debouncedDisplayName.trim() },
			{
				skip: !isDisplayNameChanged || !debouncedDisplayName.trim(),
			},
		);

	const isNameTaken =
		isDisplayNameChanged && availabilityData?.available === false;
	const isNameAvailable =
		isDisplayNameChanged &&
		availabilityData?.available === true &&
		displayName === debouncedDisplayName;
	const isChecking =
		isDisplayNameChanged &&
		(isCheckingAvailability || displayName !== debouncedDisplayName);

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
			let imageUrl = user?.image;

			// 1. Upload new image if exists
			if (croppedImageBlob) {
				const file = new File([croppedImageBlob], "profile-picture.jpg", {
					type: "image/jpeg",
				});
				const uploadRes = await startUpload([file]);
				if (uploadRes?.[0]) {
					imageUrl = uploadRes[0].ufsUrl;
				}
			} else if (isImageRemoved) {
				imageUrl = null;
			}

			await updateUser({
				displayName: trimmedDisplayName,
				bio: bio.trim() || null,
				location: location.trim() || null,
				website: website.trim() || null,
				profileVisibility,
				image: imageUrl,
				gender,
			}).unwrap();

			// Reset pending state
			setCroppedImageBlob(null);
			setIsImageRemoved(false);

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
		<Container direction="vertical" width="full" className="pt-3">
			<ProfilePictureCropperModal
				image={selectedOriginalImage}
				onCropComplete={handleCropComplete}
				onCancel={() => {
					if (fileInputRef.current) {
						fileInputRef.current.value = "";
					}
				}}
			/>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileChange}
			/>
			<Grid columns={{ default: 1, sm: 3 }}>
				{/* Profile Picture */}
				<Container direction="vertical" width="full">
					<div className="relative w-32 h-32 md:w-40 md:h-40">
						<ProfilePicture
							profilePicture={
								isImageRemoved ? "" : (croppedImageUrl ?? user?.image ?? "")
							}
							displayName={user?.displayName ?? ""}
							size="full"
						/>
					</div>
					<Container direction="vertical" width="full" gap="sm">
						<Button fullWidth onClick={() => fileInputRef.current?.click()}>
							<IoCloudUpload className="text-lg" />
							Upload
						</Button>
						<Button variant="secondary" fullWidth onClick={handleRemoveImage}>
							<IoTrashBin className="text-lg" />
							Remove
						</Button>
					</Container>
				</Container>

				<Container
					direction="vertical"
					width="full"
					className="justify-between"
				>
					<Container width="full">
						<Input
							label="Full Name"
							flex="grow"
							defaultValue={user.name ?? ""}
							disabled
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
							error={
								isNameTaken
									? "This display name is already taken"
									: displayNameError
							}
							description={
								isChecking ? (
									<span className="text-indigo-400">
										Checking availability...
									</span>
								) : isNameAvailable ? (
									<span className="text-emerald-400">
										Display name is available
									</span>
								) : null
							}
							required
						/>
					</Container>
					<Container width="full" className="items-start">
						<Input
							label="Website"
							flex="grow"
							defaultValue={user.website ?? ""}
							onChange={setWebsite}
							type="url"
							placeholder="https://example.com"
						/>
					</Container>
				</Container>

				<Container
					direction="vertical"
					width="full"
					className="justify-between"
				>
					<Container width="full">
						<Input
							label="Email"
							flex="grow"
							defaultValue={user.email ?? ""}
							disabled
						/>
					</Container>
					<Container width="full">
						<InputSelect
							label="Gender"
							options={[
								"Male",
								"Female",
								"Non-binary",
								"Other",
								"Prefer not to say",
							]}
							defaultValue={user.gender ?? "Prefer not to say"}
							onSelect={setGender}
							flex="grow"
						/>
					</Container>
					<Container width="full" className="items-start">
						<Input
							label="Location"
							flex="grow"
							defaultValue={user.location ?? ""}
							onChange={setLocation}
							maxLength={100}
						/>
					</Container>
				</Container>
			</Grid>

			<Container width="full" className="items-start">
				<InputArea
					flex="grow"
					label="Bio"
					defaultValue={user.bio ?? ""}
					onChange={setBio}
					rows={5}
					maxLength={500}
				/>
			</Container>

			<Container
				width="full"
				className="items-center border-b border-zinc-800 pb-2"
			>
				<span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
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
					<div className="w-11 h-6 bg-zinc-900 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-500 transition-colors" />
					<div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
				</label>
			</Container>

			<Grid columns={{ default: 1, sm: 3 }}>
				<Button
					fullWidth
					onClick={handleSave}
					disabled={isUpdating || isChecking || isNameTaken}
					loading={isUpdating}
				>
					<IoSave className="text-lg" />
					Save Changes
				</Button>
			</Grid>
		</Container>
	);
}
