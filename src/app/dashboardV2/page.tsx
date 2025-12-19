"use client";

import Page from "@pointwise/app/components/general/Page";
import NavbarV2 from "@pointwise/app/dashboardV2/navbarV2/NavbarV2";
import ProjectsOverviewV2 from "@pointwise/app/dashboardV2/projectsOverview/ProjectsOverviewV2";

export default function DashboardPage() {
	return (
		<Page>
			<NavbarV2 />
			<ProjectsOverviewV2 />
		</Page>
	);
}
