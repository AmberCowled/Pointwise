import InputV2 from "@pointwise/app/components/ui/InputV2";

export interface ProjectNameProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function ProjectName({
  defaultValue,
  onChange,
}: ProjectNameProps) {
  return (
    <InputV2
      label="Project Name"
      placeholder="My Project"
      required
      flex="grow"
      defaultValue={defaultValue !== undefined ? defaultValue : ""}
      onChange={onChange !== undefined ? (value) => onChange(value) : undefined}
    />
  );
}
