"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Grid from "@pointwise/app/components/ui/Grid";
import Input from "@pointwise/app/components/ui/Input";
import InputArea from "@pointwise/app/components/ui/InputArea";
import ProfilePicture from "@pointwise/app/dashboard/userCard/ProfilePicture";
import clsx from "clsx";
import { useState } from "react";
import {
	IoCloudUpload,
	IoColorPaletteOutline,
	IoLockClosedOutline,
	IoNotificationsOutline,
	IoPersonOutline,
	IoSave,
	IoSettings,
	IoTrashBin,
} from "react-icons/io5";

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
				{activeTab === Tab.PROFILE && (
					<Container direction="vertical" width="full" className="py-4">
						<Grid columns={{ default: 1, sm: 2 }}>
							<Container width="full">
								<Container>
									<ProfilePicture
										profilePicture=""
										displayName="Amber"
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
										label="Username"
										flex="grow"
										className="rounded-none"
									/>
								</Container>
								<Container width="full">
									<Input label="Email" flex="grow" className="rounded-none" />
								</Container>
								<Container width="full">
									<Input
										label="Full Name"
										flex="grow"
										className="rounded-none"
									/>
								</Container>
							</Grid>

							<Container width="full">
								<InputArea
									flex="grow"
									label="Bio"
									className="rounded-none"
									rows={5}
								/>
							</Container>

							<Grid columns={{ default: 1, sm: 3 }}>
								<Container width="full">
									<Input
										label="Location"
										flex="grow"
										className="rounded-none"
									/>
								</Container>
								<Container width="full">
									<Input label="Website" flex="grow" className="rounded-none" />
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
										defaultChecked
									/>
									<div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-500/75 transition-colors" />
									<div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
								</label>
							</Container>

							<Container width="full" className="justify-center">
								<Grid columns={{ default: 1, sm: 3 }}>
									<Button className="w-full rounded-none">
										<IoSave />
										Save Changes
									</Button>
								</Grid>
							</Container>
						</Container>
					</Container>
				)}
			</Container>
		</Container>
	);
}
