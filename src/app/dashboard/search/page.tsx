"use client";

import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SearchOverview from "./SearchOverview";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  return <SearchOverview query={query} />;
}

export default function SearchPage() {
  return (
    <Page>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <SearchContent />
      </Suspense>
    </Page>
  );
}
