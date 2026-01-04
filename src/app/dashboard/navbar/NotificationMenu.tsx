import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { IoNotifications } from "react-icons/io5";

export default function NotificationMenu() {
	return (
		<Menu
			trigger={
				<Button
					icon={IoNotifications}
					badgeCount={0}
					title="Notifications coming soon"
					aria-label="Notifications (coming soon)"
				/>
			}
		>
			<Menu.Option
				label="No notifications yet"
				disabled
				description="Notifications coming soon"
			/>
		</Menu>
	);
}
