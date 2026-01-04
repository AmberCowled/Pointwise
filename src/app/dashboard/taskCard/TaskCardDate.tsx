"use client";

import {
	formatDate,
	formatTime,
	utcToLocal,
} from "@pointwise/lib/api/date-time";

export default function TaskCardDate({
	label,
	date,
	hasTime,
}: {
	label: string;
	date: string;
	hasTime: boolean;
}) {
	const localDate = utcToLocal(date)?.date ?? null;
	const formattedDate = formatDate(localDate ?? null);
	const formattedTime = formatTime(localDate ?? null);

	return (
		<span className="text-xs text-blue-300">
			{formattedDate && label ? `${label}: ` : null}
			{formattedDate ?? formattedDate}
			{hasTime && formattedTime ? ` ${formattedTime}` : null}
		</span>
	);
}
