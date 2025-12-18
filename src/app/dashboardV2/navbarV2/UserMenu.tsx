import { Button } from "@pointwise/app/components/ui/Button";
import MenuV2 from "@pointwise/app/components/ui/menuV2";
import { signOut } from "next-auth/react";
import { IoFolder, IoLogOut, IoMenu, IoPerson, IoSettings } from "react-icons/io5";

export default function UserMenu() {
	return (
		<MenuV2 trigger={<Button icon={IoMenu}></Button>}>
			<MenuV2.Section title="Navigation">
				<MenuV2.Option
					icon={<IoFolder />}
					label="Projects"
					description="View all projects"
					href="/dashboard"
				/>
			</MenuV2.Section>
			<MenuV2.Section title="Account">
				<MenuV2.Option
					icon={<IoPerson />}
					label="Profile"
					description="View and edit your profile"
					href="/profile"
				/>
				<MenuV2.Option
					icon={<IoSettings />}
					label="Settings"
					description="Manage preferences"
					href="/settings"
				/>
			</MenuV2.Section>
			<MenuV2.Section>
				<MenuV2.Option
					icon={<IoLogOut />}
					label="Logout"
					description="Logout of your account"
					danger
					onClick={() => signOut({ callbackUrl: "/" })}
				/>
			</MenuV2.Section>
		</MenuV2>
	);
}
