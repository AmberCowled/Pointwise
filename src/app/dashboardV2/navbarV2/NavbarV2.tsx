"use client";

import BrandHeaderV2 from "@pointwise/app/components/general/BrandHeaderV2";
import Container from "@pointwise/app/components/ui/Container";
import FriendRequestsMenu from "./FriendRequestsMenu";
import LVStat from "./LVStat";
import MessagesMenu from "./MessagesMenu";
import NotificationMenu from "./NotificationMenu";
import Search from "./Search";
import UserMenu from "./UserMenu";
import XPBar from "./XPBar";

export default function NavbarV2() {
  return (
    <Container
      direction="vertical"
      gap="sm"
      width="full"
      className="border-b border-white/10 bg-zinc-950 z-1"
    >
      <Container className="pt-2" gap="sm">
        <BrandHeaderV2 size="sm" />
        <Search
          onSearch={(query, filter) =>
            console.log("Searching:", query, "\nFilter:", filter)
          }
        />
        <UserMenu />
      </Container>
      <Container className="justify-between">
        <LVStat />
        <Container width="auto" gap="sm">
          <MessagesMenu />
          <NotificationMenu />
          <FriendRequestsMenu />
        </Container>
      </Container>
      <Container className="pb-2.5">
        <XPBar />
      </Container>
    </Container>
  );
}
