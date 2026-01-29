import { Button } from "@pointwise/app/components/ui/Button";
import { IoHeartOutline } from "react-icons/io5";

export default function TaskCardLikeButton() {
    return (
        <Button
			variant="ghost"
			size="sm"
			icon={IoHeartOutline}
			disabled
			title="Like (Coming Soon)"
		>
			<span className="text-xs ml-1 font-medium text-zinc-400">0</span>
		</Button>
    );
}