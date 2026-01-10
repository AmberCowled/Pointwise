import Container from "@pointwise/app/components/ui/Container";
import { useState } from "react";
import ProjectsSearchResults from "./ProjectsSearchResults";
import SearchTabs from "./SearchTabs";
import UsersSearchResults from "./UsersSearchResults";

export default function SearchOverview({ query }: { query: string }) {
	const [activeTab, setActiveTab] = useState<"projects" | "users">("projects");

	return (
		<Container direction="vertical" gap="sm" className="pt-3">
			<Container width="full" gap="none">
				<SearchTabs onChange={setActiveTab} />
			</Container>
			<Container
				width="full"
				direction="vertical"
				gap="sm"
				className="pt-1 rounded-sm"
			>
				{activeTab === "projects" && <ProjectsSearchResults query={query} />}
				{activeTab === "users" && <UsersSearchResults query={query} />}
			</Container>
		</Container>
	);
}
