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
