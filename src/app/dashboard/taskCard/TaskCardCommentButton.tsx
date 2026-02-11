import { Button } from "@pointwise/app/components/ui/Button";
import { IoChatbubbleOutline } from "react-icons/io5";

const commentCount = 0;

export default function TaskCardCommentButton() {
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled
			title="Comments (Coming Soon)"
		>
			<IoChatbubbleOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
			<span className="text-xs font-medium text-zinc-400">{commentCount}</span>
		</Button>
	);
}
