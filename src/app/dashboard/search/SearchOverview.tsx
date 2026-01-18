import Container from "@pointwise/app/components/ui/Container";
import { TabsV2 } from "@pointwise/app/components/ui/TabsV2";
import { useState } from "react";
import ProjectsSearchResults from "./ProjectsSearchResults";
import UsersSearchResults from "./UsersSearchResults";

const TABS = [
	{ id: "projects", label: "Projects" },
	{ id: "users", label: "Users" },
];

export default function SearchOverview({ query }: { query: string }) {
	const [activeTab, setActiveTab] = useState<"projects" | "users">("projects");

	return (
		<Container direction="vertical" gap="sm" className="pt-3">
			<Container width="full" gap="none" className="bg-zinc-900/50">
				<TabsV2
					items={TABS}
					value={activeTab}
					onChange={(value) => setActiveTab(value as "projects" | "users")}
				/>
			</Container>
			<Container width="full" direction="vertical" gap="sm" className="pt-1">
				{activeTab === "projects" && <ProjectsSearchResults query={query} />}
				{activeTab === "users" && <UsersSearchResults query={query} />}
			</Container>
		</Container>
	);
}
