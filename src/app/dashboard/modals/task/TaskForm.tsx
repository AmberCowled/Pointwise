import { Checkbox } from "@pointwise/app/components/ui/Checkbox";
import Container from "@pointwise/app/components/ui/Container";
import DatePicker from "@pointwise/app/components/ui/DatePicker";
import Grid from "@pointwise/app/components/ui/Grid";
import Input from "@pointwise/app/components/ui/Input";
import InputArea from "@pointwise/app/components/ui/InputArea";
import InputSelect from "@pointwise/app/components/ui/InputSelect";
import TimePicker from "@pointwise/app/components/ui/TimePicker";
import {
	CORE_TASK_CATEGORIES,
	CUSTOM_CATEGORY_LABEL,
	MAX_CUSTOM_CATEGORY_LENGTH,
} from "@pointwise/lib/categories";

export interface TaskFormProps {
	title?: string;
	onTitleChange?: (title: string) => void;
	description?: string;
	onDescriptionChange?: (description: string) => void;
	category?: string;
	onCategoryChange?: (category: string) => void;
	customCategory?: string;
	onCustomCategoryChange?: (customCategory: string) => void;
	xpAward?: number;
	onXpAwardChange?: (xpAward: number) => void;
	startDate?: Date | null;
	onStartDateChange?: (startDate: Date | null) => void;
	startTime?: string | null;
	onStartTimeChange?: (startTime: string | null) => void;
	dueDate?: Date | null;
	onDueDateChange?: (dueDate: Date | null) => void;
	dueTime?: string | null;
	onDueTimeChange?: (dueTime: string | null) => void;
	optional?: boolean;
	onOptionalChange?: (optional: boolean) => void;
}
export default function TaskForm({
	title,
	onTitleChange,
	description,
	onDescriptionChange,
	category,
	onCategoryChange,
	customCategory,
	onCustomCategoryChange,
	xpAward,
	onXpAwardChange,
	startDate,
	onStartDateChange,
	startTime,
	onStartTimeChange,
	dueDate,
	onDueDateChange,
	dueTime,
	onDueTimeChange,
	optional,
	onOptionalChange,
}: TaskFormProps) {
	const categoryOptions = [...CORE_TASK_CATEGORIES, CUSTOM_CATEGORY_LABEL];

	return (
		<Container direction="vertical" gap="md" className="items-stretch">
			<Input
				label="Task Title"
				required
				flex="grow"
				defaultValue={title}
				onChange={onTitleChange}
			/>

			<InputArea
				label="Description"
				rows={3}
				flex="grow"
				maxLength={20000}
				defaultValue={description}
				onChange={onDescriptionChange}
			/>

			<Grid columns={{ default: 1, sm: 2 }} gap="md">
				<Container
					direction="vertical"
					gap="sm"
					className="items-stretch"
					width="full"
				>
					<InputSelect
						label="Category"
						flex="grow"
						options={categoryOptions}
						defaultValue={category}
						onSelect={onCategoryChange}
					/>
					{category === CUSTOM_CATEGORY_LABEL && (
						<Input
							label="Custom Category"
							required
							flex="grow"
							maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
							defaultValue={customCategory}
							onChange={onCustomCategoryChange}
						/>
					)}
				</Container>
				<Input
					label="XP Award"
					type="number"
					flex="grow"
					defaultValue={xpAward?.toString() ?? "50"}
					onChange={(value: string) => onXpAwardChange?.(Number(value))}
				/>
			</Grid>

			<Grid columns={{ default: 1, sm: 2 }} gap="md">
				<Container
					direction="vertical"
					gap="sm"
					className="items-stretch"
					width="full"
				>
					<DatePicker
						label="Start Date"
						flex="grow"
						defaultValue={startDate}
						onChange={(date) => {
							if (date === null) {
								onStartDateChange?.(null);
								onStartTimeChange?.(null);
							} else {
								onStartDateChange?.(date ?? null);
							}
						}}
					/>
					{startDate !== null && (
						<TimePicker
							label="Start Time"
							flex="grow"
							defaultValue={startTime}
							onChange={onStartTimeChange}
						/>
					)}
				</Container>
				<Container
					direction="vertical"
					gap="sm"
					className="items-stretch"
					width="full"
				>
					<DatePicker
						label="Due Date"
						flex="grow"
						defaultValue={dueDate}
						onChange={(date) => {
							if (date === null) {
								onDueDateChange?.(null);
								onDueTimeChange?.(null);
							} else {
								onDueDateChange?.(date ?? null);
							}
						}}
					/>
					{dueDate !== null && (
						<TimePicker
							label="Due Time"
							flex="grow"
							defaultValue={dueTime}
							onChange={onDueTimeChange}
						/>
					)}
				</Container>
			</Grid>

			<Checkbox
				label="Optional task"
				defaultChecked={optional ?? false}
				onChange={onOptionalChange}
			/>
		</Container>
	);
}
