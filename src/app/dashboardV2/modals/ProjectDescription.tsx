import InputAreaV2 from "@pointwise/app/components/ui/InputAreaV2";

export interface ProjectDescriptionProps {
	defaultValue?: string;
	onChange?: (value: string) => void;
}

export default function ProjectDescription({ defaultValue, onChange }: ProjectDescriptionProps) {
	return (
		<InputAreaV2
			label="Description"
			placeholder="What is this project about?"
			rows={3}
			flex="grow"
			defaultValue={defaultValue !== undefined ? defaultValue : ""}
			onChange={onChange !== undefined ? (value) => onChange(value) : undefined}
		/>
	);
}
