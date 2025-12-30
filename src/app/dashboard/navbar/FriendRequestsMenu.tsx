import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import { IoPersonAdd } from "react-icons/io5";

export default function FriendRequestsMenu() {
  return (
    <Menu
      trigger={
        <Button
          icon={IoPersonAdd}
          badgeCount={0}
          title="Friend requests coming soon"
          aria-label="Friend requests (coming soon)"
        />
      }
    >
      <Menu.Option
        label="No friend requests yet"
        disabled
        description="Friend requests coming soon"
      />
    </Menu>
  );
}
