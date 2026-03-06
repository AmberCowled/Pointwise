"use client";

import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import { Skeleton } from "@pointwise/app/components/ui/Skeleton";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import ProfilePicture from "@pointwise/app/dashboard/userCard/ProfilePicture";
import UserLevelStats from "@pointwise/app/dashboard/userCard/UserLevelStats";
import { useGetUserProfileQuery } from "@pointwise/generated/api";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import { useParams } from "next/navigation";
import {
	IoCalendar,
	IoEarth,
	IoLocation,
	IoLockClosed,
	IoMale,
} from "react-icons/io5";
import ProfileActions from "./ProfileActions";
import PostList from "./posts/PostList";

export default function ProfileOverview() {
	const params = useParams<{ id: string }>();
	const { data, isLoading, isError, error, refetch } = useGetUserProfileQuery(
		params.id,
	);

	if (isLoading) {
		return (
			<Container
				direction="vertical"
				width="constrained"
				gap="md"
				className="py-8"
			>
				<Container
					direction="vertical"
					width="full"
					gap="md"
					className={`${StyleTheme.Container.Background} border ${StyleTheme.Container.Border.Primary} rounded-lg p-6`}
				>
					<Container width="full" gap="md">
						<Skeleton width={80} height={80} circular />
						<Container direction="vertical" width="full" gap="sm">
							<Skeleton width="60%" height="1.75rem" />
							<Skeleton width="100%" height="1rem" />
						</Container>
					</Container>
				</Container>
				<Container
					direction="vertical"
					width="full"
					gap="sm"
					className={`${StyleTheme.Container.Background} border ${StyleTheme.Container.Border.Primary} rounded-lg p-6`}
				>
					<Skeleton width="80%" height="1rem" />
					<Skeleton width="50%" height="1rem" />
					<Skeleton width="40%" height="1rem" />
				</Container>
			</Container>
		);
	}

	if (isError || !data) {
		return (
			<Container
				direction="vertical"
				width="constrained"
				gap="md"
				className="py-8"
			>
				<ErrorCard
					display
					message={error ? getErrorMessage(error) : "Failed to load profile"}
					onRetry={refetch}
				/>
			</Container>
		);
	}

	const { user, isOwnProfile } = data;
	const isPrivate = user.profileVisibility === "PRIVATE" && !isOwnProfile;
	const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<Container
			direction="vertical"
			width="constrained"
			gap="md"
			className="py-8"
		>
			{/* Header card */}
			<Container
				direction="vertical"
				width="full"
				gap="md"
				className={`${StyleTheme.Container.Background} border ${StyleTheme.Container.Border.Primary} rounded-lg p-6`}
			>
				<Container width="full" gap="md">
					<Container width="auto">
						<ProfilePicture
							profilePicture={user.image ?? ""}
							displayName={user.displayName}
							size="xl"
						/>
					</Container>
					<Container
						direction="vertical"
						width="full"
						gap="sm"
						className="items-start"
					>
						<h1
							className={`text-2xl font-bold ${StyleTheme.Text.PrimaryBright}`}
						>
							{user.displayName}
						</h1>
						{!isPrivate && (
							<Container
								width="full"
								gap="xs"
								className="text-yellow-500 bg-black/25 rounded-xl p-1.5"
							>
								<UserLevelStats xp={user.xp} />
							</Container>
						)}
					</Container>
				</Container>
				<ProfileActions user={user} isOwnProfile={isOwnProfile} />
			</Container>

			{/* Private notice */}
			{isPrivate && (
				<Container
					width="full"
					gap="sm"
					className={`${StyleTheme.Container.Background} border ${StyleTheme.Container.Border.Primary} rounded-lg p-4 justify-center`}
				>
					<IoLockClosed className={`size-4 ${StyleTheme.Text.Secondary}`} />
					<span className={`text-sm ${StyleTheme.Text.Secondary}`}>
						This profile is private
					</span>
				</Container>
			)}

			{/* Info section */}
			{!isPrivate && (
				<div className="flex flex-col sm:flex-row w-full gap-4">
					{/* Sidebar — metadata */}
					<Container
						direction="vertical"
						width="full"
						gap="xs"
						className={`${StyleTheme.Container.Background} border ${StyleTheme.Container.Border.Primary} rounded-lg p-6 sm:w-72 sm:shrink-0 items-start`}
					>
						{user.location && (
							<Container width="auto" gap="xs">
								<IoLocation className={`size-4 ${StyleTheme.Text.Secondary}`} />
								<span className={`text-sm ${StyleTheme.Text.Tertiary}`}>
									{user.location}
								</span>
							</Container>
						)}
						{user.website && (
							<Container width="auto" gap="xs">
								<IoEarth className={`size-4 ${StyleTheme.Text.Secondary}`} />
								<a
									href={user.website}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-400 hover:underline"
								>
									{user.website}
								</a>
							</Container>
						)}
						{user.gender && (
							<Container width="auto" gap="xs">
								<IoMale className={`size-4 ${StyleTheme.Text.Secondary}`} />
								<span className={`text-sm ${StyleTheme.Text.Tertiary}`}>
									{user.gender}
								</span>
							</Container>
						)}
						<Container width="auto" gap="xs">
							<IoCalendar className={`size-4 ${StyleTheme.Text.Secondary}`} />
							<span className={`text-sm ${StyleTheme.Text.Tertiary}`}>
								Member since {memberSince}
							</span>
						</Container>
					</Container>

					{/* Main — bio */}
					{user.bio && (
						<Container
							direction="vertical"
							width="full"
							gap="xs"
							className={`${StyleTheme.Container.Background} border ${StyleTheme.Container.Border.Primary} rounded-lg p-6 items-start`}
						>
							<h2
								className={`text-xs font-semibold uppercase tracking-wide ${StyleTheme.Text.Secondary}`}
							>
								Bio
							</h2>
							<p
								className={`text-sm ${StyleTheme.Text.Body} whitespace-pre-wrap`}
							>
								{user.bio}
							</p>
						</Container>
					)}
				</div>
			)}

			{/* Posts section */}
			{!isPrivate && <PostList userId={user.id} />}
		</Container>
	);
}
