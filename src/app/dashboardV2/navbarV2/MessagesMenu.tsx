import { Button } from "@pointwise/app/components/ui/Button";
import MenuV2 from "@pointwise/app/components/ui/menuV2";
import { IoMail } from "react-icons/io5";

export default function MessagesMenu() {
  return (
    <MenuV2
      trigger={
        <Button
          icon={IoMail}
          badgeCount={0}
          title="Messages coming soon"
          aria-label="Messages (coming soon)"
        />
      }
    >
      <MenuV2.Option
        label="No messages yet"
        disabled
        description="Messaging coming soon"
      />
    </MenuV2>
  );
}
