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
