"use client";

import BrandHeaderV2 from "@pointwise/app/components/general/BrandHeaderV2";
import Container from "@pointwise/app/components/general/Container";
import InputSelectV2 from "@pointwise/app/components/ui/InputSelectV2";
import InputV2 from "@pointwise/app/components/ui/InputV2";

export interface NavbarProps {
  initials: string;
}

export default function NavbarV2({ initials: _initials }: NavbarProps) {
  return (
    <div className="w-full border-b border-white/10 bg-zinc-950 z-1">
      <Container direction="vertical">
        <Container className="py-2">
          <BrandHeaderV2 size="sm"/>
          <InputV2 size="sm" placeholder="Search..." flex="grow" />
          <InputSelectV2 size="sm" options={["Projects", "Tasks", "People"]} flex="shrink" onSelect={(value) => console.log("Selected:", value)}/>
        </Container>
      </Container>
    </div>
  );
}