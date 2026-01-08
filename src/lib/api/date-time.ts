export const localToUTC = (
	date: Date | null,
	time: string | null,
	isDueDate: boolean = false,
): { date: Date; time: string } | null => {
	if (date === null) {
		return null;
	}

	const defaultTime = isDueDate ? "23:59" : "00:00";
	const timeStr = time ?? defaultTime;
	const [hours, minutes] = timeStr.split(":").map(Number);

	const parsedDate = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		hours,
		minutes,
	);
	const utcDate = parsedDate.toISOString().split("Z")[0];
	const parsedUtcDate = new Date(utcDate);
	const parsedUtcTime = utcDate.split("T")[1].split(":");

	return {
		date: parsedUtcDate,
		time: `${parsedUtcTime[0]}:${parsedUtcTime[1]}`,
	};
};

export const utcToLocal = (
	dateStr: string,
): { date: Date; time: string } | null => {
	if (dateStr === "") {
		return null;
	}

	const date = new Date(dateStr);
	const parsedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00Z`;
	const localDate = new Date(parsedDate);

	return {
		date: new Date(localDate),
		time: `${localDate.getHours()}:${localDate.getMinutes()}`,
	};
};

export const utcNow = () => {
	const localDate = new Date();
	const hours = String(localDate.getHours()).padStart(2, "0");
	const minutes = String(localDate.getMinutes()).padStart(2, "0");
	const timeString = `${hours}:${minutes}`;
	const completedAtUTC = localToUTC(localDate, timeString);
	return completedAtUTC?.date;
};

export const formatDate = (date: Date | null) => {
	if (!date) return null;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export const formatTime = (date: Date | null) => {
	if (!date) return null;
	return Intl.DateTimeFormat("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

// Helper to compare dates (handles null cases)
// Compares only year, month, and day (ignores time)
export const datesEqual = (
	d1: Date | null | undefined,
	d2: Date | null | undefined,
): boolean => {
	if (d1 === d2) return true;
	if (!d1 || !d2) return false;
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
};

// Helper to compare times (handles null cases)
// Compares only hour and minute (format: "HH:MM")
export const timesEqual = (
	time1: string | null | undefined,
	time2: string | null | undefined,
): boolean => {
	if (time1 === time2) return true; // handles null/undefined cases
	if (!time1 || !time2) return false;

	// Normalize time strings to "HH:MM" format for comparison
	const normalizeTime = (time: string): string => {
		const parts = time.split(":");
		if (parts.length < 2) return time;
		const hours = parts[0].padStart(2, "0");
		const minutes = parts[1].padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	return normalizeTime(time1) === normalizeTime(time2);
};

export const localDayStart = () => {
	const localDate = new Date();
	return new Date(
		localDate.getFullYear(),
		localDate.getMonth(),
		localDate.getDate(),
		0,
		0,
		0,
		0,
	);
};

export const localDayEnd = () => {
	const localDate = new Date();
	return new Date(
		localDate.getFullYear(),
		localDate.getMonth(),
		localDate.getDate(),
		23,
		59,
		59,
		999,
	);
};

export const isDateBetween = (date: Date, startDate: Date, endDate: Date) => {
	return date >= startDate && date <= endDate;
};

export const isDateBefore = (date: Date, startDate: Date) => {
	if (!date || !startDate) return false;
	return date < startDate;
};

export const isDateAfter = (date: Date, endDate: Date) => {
	if (!date || !endDate) return false;
	return date > endDate;
};

/**
 * Format a date as relative time (e.g., "2 days ago", "1 week ago")
 */
export const formatRelativeTime = (date: Date | string | null): string => {
	if (!date) return "Unknown";
	
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
	
	if (diffInSeconds < 60) {
		return "just now";
	}
	
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
	}
	
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
	}
	
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
	}
	
	const diffInWeeks = Math.floor(diffInDays / 7);
	if (diffInWeeks < 4) {
		return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
	}
	
	const diffInMonths = Math.floor(diffInDays / 30);
	if (diffInMonths < 12) {
		return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
	}
	
	const diffInYears = Math.floor(diffInDays / 365);
	return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
};
