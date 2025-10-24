import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  isToday,
  parseISO,
  startOfDay,
  isBefore
} from "date-fns";

export const timeSlots = [
  "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM",
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
];

export const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getTimeSlotPosition(time: string): number {
  const timeMap: { [key: string]: number } = {
    "12:00 AM": 0, "1:00 AM": 1, "2:00 AM": 2, "3:00 AM": 3, "4:00 AM": 4, "5:00 AM": 5,
    "6:00 AM": 6, "7:00 AM": 7, "8:00 AM": 8, "9:00 AM": 9, "10:00 AM": 10, "11:00 AM": 11,
    "12:00 PM": 12, "1:00 PM": 13, "2:00 PM": 14, "3:00 PM": 15, "4:00 PM": 16, "5:00 PM": 17,
    "6:00 PM": 18, "7:00 PM": 19, "8:00 PM": 20, "9:00 PM": 21, "10:00 PM": 22, "11:00 PM": 23
  };
  return timeMap[time] || 0;
}

export function calculateEndTime(startTime: string, duration: number): string {
  const timeMap: { [key: string]: number } = {
    "12:00 AM": 0, "1:00 AM": 1, "2:00 AM": 2, "3:00 AM": 3, "4:00 AM": 4, "5:00 AM": 5,
    "6:00 AM": 6, "7:00 AM": 7, "8:00 AM": 8, "9:00 AM": 9, "10:00 AM": 10, "11:00 AM": 11,
    "12:00 PM": 12, "1:00 PM": 13, "2:00 PM": 14, "3:00 PM": 15, "4:00 PM": 16, "5:00 PM": 17,
    "6:00 PM": 18, "7:00 PM": 19, "8:00 PM": 20, "9:00 PM": 21, "10:00 PM": 22, "11:00 PM": 23
  };
  
  const startIndex = timeMap[startTime] || 0;
  const endIndex = startIndex + (duration / 60);
  const timeKeys = Object.keys(timeMap);
  return timeKeys[endIndex] || startTime;
}

export function generateWeekDays(currentWeek: Date): Date[] {
  const weekStart = startOfWeek(currentWeek);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function navigateWeek(currentWeek: Date, direction: "prev" | "next"): Date {
  return direction === "prev" ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1);
}

export { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, parseISO, startOfDay, isBefore };
