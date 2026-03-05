"use client";

import AnalyticsOverview from "@pointwise/app/analytics/analyticsOverview/AnalyticsOverview";
import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";

export default function AnalyticsPage() {
	return (
		<Page>
			<Navbar />
			<AnalyticsOverview />
		</Page>
	);
}
