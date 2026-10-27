import { format, formatInTimeZone } from "date-fns-tz";
import { ar } from "date-fns/locale";

const TZ = "Africa/Cairo";

export function formatDateArabic(date: Date | string | number): string {
  const d = new Date(date);
  return format(d, "yyyy/MM/dd", { locale: ar });
}

export function formatDateTimeArabic(date: Date | string | number): string {
  const d = new Date(date);
  return format(d, "yyyy/MM/dd HH:mm", { locale: ar });
}

export function formatInCairo(date: Date | string | number, fmt = "yyyy/MM/dd"): string {
  const d = new Date(date);
  return formatInTimeZone(d, TZ, fmt, { locale: ar });
}

export function formatDateTimeCairo(date: Date | string | number): string {
  const d = new Date(date);
  return formatInTimeZone(d, TZ, "yyyy/MM/dd HH:mm", { locale: ar });
}