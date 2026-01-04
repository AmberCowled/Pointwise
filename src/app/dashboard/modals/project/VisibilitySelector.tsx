import Selector from "@pointwise/app/components/ui/Selector";
import { IoGlobe, IoLockClosed } from "react-icons/io5";

export interface VisibilitySelectorProps {
	defaultValue?: "PUBLIC" | "PRIVATE";
	onChange?: (value: "PUBLIC" | "PRIVATE") => void;
}

export default function VisibilitySelector({
	defaultValue,
	onChange,
}: VisibilitySelectorProps) {
	return (
		<Selector
			label="Visibility"
			defaultValue={defaultValue !== undefined ? defaultValue : "PRIVATE"}
			gap="md"
			flex="grow"
			onChange={(value) =>
				onChange !== undefined
					? onChange(value as "PUBLIC" | "PRIVATE")
					: undefined
			}
		>
			<Selector.Option
				icon={IoLockClosed}
				description="Only you can access"
				value="PRIVATE"
				label="Private"
			/>
			<Selector.Option
				icon={IoGlobe}
				description="Anyone can access"
				value="PUBLIC"
				label="Public"
			/>
		</Selector>
	);
}
