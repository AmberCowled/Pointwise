import { Button } from "@pointwise/app/components/ui/Button";
import MenuV2 from "@pointwise/app/components/ui/menuV2";
import { IoNotifications } from "react-icons/io5";

export default function NotificationMenu() {
	return (
		<MenuV2
			trigger={
				<Button
					icon={IoNotifications}
					badgeCount={0}
					title="Notifications coming soon"
					aria-label="Notifications (coming soon)"
				/>
			}
		>
			<MenuV2.Option
				label="No notifications yet"
				disabled
				description="Notifications coming soon"
			/>
		</MenuV2>
	);
}
