import InputArea from "@pointwise/app/components/ui/InputArea";

export interface ProjectGoalProps {
	defaultValue?: string;
	onChange?: (value: string) => void;
}

export default function ProjectGoal({
	defaultValue,
	onChange,
}: ProjectGoalProps) {
	return (
		<InputArea
			label="Goal"
			placeholder="What do you want to achieve with this project?"
			rows={3}
			flex="grow"
			maxLength={500}
			showCharCount
			defaultValue={defaultValue !== undefined ? defaultValue : ""}
			onChange={onChange !== undefined ? (value) => onChange(value) : undefined}
		/>
	);
}
