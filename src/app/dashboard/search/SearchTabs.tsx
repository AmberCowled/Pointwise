import { Card } from "@pointwise/app/components/ui/Card";
import clsx from "clsx";
import { useState } from "react";
import { IoFolder, IoPeopleCircle } from "react-icons/io5";

interface SearchTabsProps {
	onChange: (tab: "projects" | "users") => void;
}

export default function SearchTabs({ onChange }: SearchTabsProps) {
	const [activeTab, setActiveTab] = useState<"projects" | "users">("projects");

	return (
		<>
			<Card
				flex="grow"
				className={clsx(
					"py-5 rounded-none border-2 text-sm font-bold text-zinc-300 hover:text-zinc-200 hover:bg-zinc-800/50 hover:border-zinc-700/80 hover:cursor-pointer hover:border-l-2",
					activeTab === "projects" &&
						"border-b-blue-500 hover:border-b-blue-500",
				)}
				onClick={() => {
					setActiveTab("projects");
					onChange("projects");
				}}
			>
				<IoFolder className="size-10" />
				<p className="text-lg font-bold pt-1">{"Projects"}</p>
			</Card>

			<Card
				flex="grow"
				className={clsx(
					"py-5 rounded-none border-2 text-sm font-bold text-zinc-300 hover:text-zinc-200 hover:bg-zinc-800/50 hover:border-zinc-700/80 hover:cursor-pointer hover:border-l-2",
					activeTab === "users" && "border-b-blue-500 hover:border-b-blue-500",
				)}
				onClick={() => {
					setActiveTab("users");
					onChange("users");
				}}
			>
				<IoPeopleCircle className="size-10" />
				<p className="text-lg font-bold pt-1">{"Users"}</p>
			</Card>
		</>
	);
}
