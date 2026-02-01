import { Button } from "@pointwise/app/components/ui/Button";
import { IoChatbubbleOutline } from "react-icons/io5";

export default function TaskCardCommentButton() {
	return (
		<Button
			variant="ghost"
			size="sm"
			icon={IoChatbubbleOutline}
			disabled
			title="Comment (Coming Soon)"
		>
			<span className="text-xs ml-1 font-medium text-zinc-400">0</span>
		</Button>
	);
}
