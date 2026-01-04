import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { IoMail } from "react-icons/io5";

export default function MessagesMenu() {
	return (
		<Menu
			trigger={
				<Button
					icon={IoMail}
					badgeCount={0}
					title="Messages coming soon"
					aria-label="Messages (coming soon)"
				/>
			}
		>
			<Menu.Option
				label="No messages yet"
				disabled
				description="Messaging coming soon"
			/>
		</Menu>
	);
}
