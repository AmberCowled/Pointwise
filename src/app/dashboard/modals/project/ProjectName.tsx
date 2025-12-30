import Input from "@pointwise/app/components/ui/Input";

export interface ProjectNameProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function ProjectName({
  defaultValue,
  onChange,
}: ProjectNameProps) {
  return (
    <Input
      label="Project Name"
      placeholder="My Project"
      required
      flex="grow"
      defaultValue={defaultValue !== undefined ? defaultValue : ""}
      onChange={onChange !== undefined ? (value) => onChange(value) : undefined}
    />
  );
}
