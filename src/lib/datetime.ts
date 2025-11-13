const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const SHORT_WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return startOfDay(copy);
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(date: Date) {
  const utcSafe = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  return DATE_LABEL_FORMATTER.format(utcSafe);
}

export function toDate(input?: string | Date | null) {
  if (!input) return null;
  const value = input instanceof Date ? input : new Date(input);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDatePart(date: Date) {
  const weekday = SHORT_WEEKDAY_NAMES[date.getDay()];
  const month = SHORT_MONTH_NAMES[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  return `${weekday}, ${day} ${month}`;
}

export function formatTimePart(date: Date) {
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const period = hours24 < 12 ? 'AM' : 'PM';
  return `${hours12}:${minutes} ${period}`;
}

export function formatDateTime(date: Date) {
  return `${formatDatePart(date)} · ${formatTimePart(date)}`;
}

export function toLocalDateTimeString(date?: Date, time: string = '09:00') {
  const base = date ? new Date(date) : new Date();
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T${time}`;
}

export function extractTime(
  input?: string | Date | null,
  fallback: string = '09:00',
) {
  if (!input) return fallback;
  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) return fallback;
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
