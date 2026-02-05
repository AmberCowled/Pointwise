import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { signOut } from "next-auth/react";
import {
	IoFolder,
	IoLogOut,
	IoMail,
	IoMenu,
	IoPerson,
	IoSettings,
} from "react-icons/io5";

export default function UserMenu() {
	return (
		<Menu trigger={<Button icon={IoMenu}></Button>}>
			<Menu.Section title="Navigation">
				<Menu.Option
					icon={<IoFolder />}
					label="Projects"
					description="View all projects"
					href="/dashboard"
				/>
				<Menu.Option
					icon={<IoMail />}
					label="Messages"
					description="View conversations"
					href="/messages"
				/>
			</Menu.Section>
			<Menu.Section title="Account">
				<Menu.Option
					icon={<IoPerson />}
					label="Profile"
					description="View and edit your profile"
					href="/profile"
				/>
				<Menu.Option
					icon={<IoSettings />}
					label="Settings"
					description="Manage preferences"
					href="/settings"
				/>
			</Menu.Section>
			<Menu.Section>
				<Menu.Option
					icon={<IoLogOut />}
					label="Logout"
					description="Logout of your account"
					danger
					onClick={() => signOut({ callbackUrl: "/" })}
				/>
			</Menu.Section>
		</Menu>
	);
}
