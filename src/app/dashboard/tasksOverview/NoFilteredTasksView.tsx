import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { IoClipboard } from "react-icons/io5";

export default function NoFilteredTasksView() {
	return (
		<div className="text-center py-12">
			<div
				className={`w-16 h-16 mx-auto mb-4 rounded-full ${StyleTheme.Container.BackgroundEmpty} flex items-center justify-center`}
			>
				<IoClipboard className="w-8 h-8 text-zinc-600" aria-hidden="true" />
			</div>
			<h3 className={`text-lg font-semibold ${StyleTheme.Text.Primary} mb-2`}>
				No filtered tasks
			</h3>
			<p className={`text-sm ${StyleTheme.Text.Secondary} max-w-md mx-auto`}>
				Try changing your filters to see your tasks.
			</p>
		</div>
	);
}
