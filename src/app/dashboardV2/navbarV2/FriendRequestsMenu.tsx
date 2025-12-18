import { Button } from "@pointwise/app/components/ui/Button";
import MenuV2 from "@pointwise/app/components/ui/menuV2";
import { IoPersonAdd } from "react-icons/io5";

export default function FriendRequestsMenu() {
	return (
		<MenuV2
			trigger={
				<Button
					icon={IoPersonAdd}
					badgeCount={0}
					title="Friend requests coming soon"
					aria-label="Friend requests (coming soon)"
				/>
			}
		>
			<MenuV2.Option
				label="No friend requests yet"
				disabled
				description="Friend requests coming soon"
			/>
		</MenuV2>
	);
}
