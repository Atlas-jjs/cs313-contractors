import { addDays, addWeeks, format } from "date-fns";

export interface ParsedCalendarEvent {
  id: string;
  day: number;
  startTime: string;
  endTime: string;
  remarks: string;
  reservationId: string;
  reserverType: string;
  reserverId: string;
}

// Variables must match the supabase fields
export interface RawCalendarEvent {
  schedule_id: string;
  date: string;
  start_time: string;
  end_time: string;
  remarks: string;
  reservation_id: string;
  user_type: string;
  user_id: string;
}

// OLD
// export interface CalendarEvent {
//   title: string;
//   day: number;
//   startTime: string;
//   endTime: string;
//   remarks: string;
//   color: string;
// }

export function generateWeekOptions(baseWeek: Date) {
  // Generate array of 7 week options centered around the base week
  return Array.from({ length: 7 }).map((_, i) => {
    const offset = i - 3; // Fetch the 3 previous weeks
    const weekStart = addWeeks(baseWeek, offset);
    const weekEnd = addDays(weekStart, 6);
    // Format dates for better readability (e.g. November 17 - November 23, 2025)
    const label = `${format(weekStart, "MMMM d")} - ${format(
      weekEnd,
      "MMMM d, yyyy"
    )}`;
    return { label, offset };
  });
}

// Example of function generateWeekOptions()
// [
//   { label: "October 27 - November 2, 2025", offset: -3 },
//   { label: "November 3 - November 9, 2025", offset: -2 },
//   { label: "November 10 - November 16, 2025", offset: -1 },
//   { label: "November 17 - November 23, 2025", offset: 0 },
//   { label: "November 24 - November 30, 2025", offset: 1 },
//   { label: "December 1 - December 7, 2025", offset: 2 },
//   { label: "December 8 - December 14, 2025", offset: 3 },
// ]

// Convert AM/PM values into decimal (e.g. 2:45PM -> 14.75)
export function parseTime(timeStr: string): number {
  const [time, modifier] = timeStr.split(" ");
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours + minutes / 60;
}

// Convert decimal values into AM/PM (e.g. 14.75 -> 2:45PM)
export function formatTo12Hour(time24: string) {
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export function getTop(time: string): number {
  return parseTime(time);
}

export function getDuration(start: string, end: string): number {
  return parseTime(end) - parseTime(start);
}

export function formatEvents(data: RawCalendarEvent[]): ParsedCalendarEvent[] {
  return (
    data.map((item: RawCalendarEvent) => ({
      id: item.schedule_id,
      day: new Date(`${item.date}T00:00:00Z`).getDay(),
      remarks: item.remarks,
      startTime: item.start_time
        ? formatTo12Hour(item.start_time.slice(0, 5))
        : "Undefined",
      endTime: item.end_time
        ? formatTo12Hour(item.end_time.slice(0, 5))
        : "Undefined",
      reservationId: item.reservation_id,
      reserverType: item.user_type,
      reserverId: item.user_id,
    })) || []
  );
}
