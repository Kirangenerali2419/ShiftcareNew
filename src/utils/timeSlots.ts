import { format, addMinutes, parse, startOfWeek, addDays, isSameDay } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { DoctorAvailability, TimeSlot, Booking } from '../types';

/**
 * Converts a time string (e.g., " 9:00AM") to a Date object for a given day
 * @param timeString Time string in format " H:MMAM" or " H:MMPM"
 * @param day Date object representing the day
 * @param timezone Timezone string (e.g., "Australia/Sydney")
 * @returns Date object in UTC
 */
const parseTimeString = (timeString: string, day: Date, timezone: string): Date => {
  const trimmed = timeString.trim();
  const isPM = trimmed.toUpperCase().includes('PM');
  const timePart = trimmed.replace(/[APM]/gi, '').trim();
  const [hours, minutes] = timePart.split(':').map(Number);
  
  let hour24 = hours;
  if (isPM && hours !== 12) {
    hour24 = hours + 12;
  } else if (!isPM && hours === 12) {
    hour24 = 0;
  }
  
  // Create date string in the target timezone
  const dateString = format(day, 'yyyy-MM-dd');
  const timeString24 = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  const dateTimeString = `${dateString} ${timeString24}`;
  
  // Parse as if it's in the target timezone, then convert to UTC
  return zonedTimeToUtc(dateTimeString, timezone);
};

/**
 * Generates 30-minute time slots for a doctor's availability window
 * @param availability Doctor availability entry
 * @param weekStart Start of the week (Monday)
 * @param existingBookings Array of existing bookings to mark slots as unavailable
 * @returns Array of TimeSlot objects
 */
export const generateTimeSlots = (
  availability: DoctorAvailability,
  weekStart: Date,
  existingBookings: Booking[] = []
): TimeSlot[] => {
  const dayMap: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };
  
  const dayOffset = dayMap[availability.day_of_week];
  if (dayOffset === undefined) {
    return [];
  }
  
  const targetDay = addDays(weekStart, dayOffset);
  const startTime = parseTimeString(availability.available_at, targetDay, availability.timezone);
  const endTime = parseTimeString(availability.available_until, targetDay, availability.timezone);
  
  const slots: TimeSlot[] = [];
  let currentTime = startTime;
  
  while (currentTime < endTime) {
    const slotEndTime = addMinutes(currentTime, 30);
    
    // Check if this slot conflicts with an existing booking
    const isBooked = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      return (
        booking.doctorName === availability.name &&
        isSameDay(bookingStart, currentTime) &&
        bookingStart.getTime() === currentTime.getTime()
      );
    });
    
    slots.push({
      startTime: new Date(currentTime),
      endTime: new Date(slotEndTime),
      dayOfWeek: availability.day_of_week,
      timezone: availability.timezone,
      isAvailable: !isBooked,
    });
    
    currentTime = slotEndTime;
  }
  
  return slots;
};

/**
 * Generates all time slots for a doctor across their availability
 * @param doctor Doctor object with availability data
 * @param weekStart Start of the week (Monday)
 * @param existingBookings Array of existing bookings
 * @returns Array of TimeSlot objects grouped by day
 */
export const getAllDoctorTimeSlots = (
  doctor: { name: string; timezone: string; availability: DoctorAvailability[] },
  weekStart: Date,
  existingBookings: Booking[] = []
): Record<string, TimeSlot[]> => {
  const slotsByDay: Record<string, TimeSlot[]> = {};
  
  doctor.availability.forEach((avail) => {
    const slots = generateTimeSlots(avail, weekStart, existingBookings);
    if (slots.length > 0) {
      slotsByDay[avail.day_of_week] = slots;
    }
  });
  
  return slotsByDay;
};

/**
 * Formats a time slot for display
 * @param slot TimeSlot object
 * @param timezone Timezone string
 * @returns Formatted time string (e.g., "9:00 AM - 9:30 AM")
 */
export const formatTimeSlot = (slot: TimeSlot, timezone: string): string => {
  const start = formatInTimeZone(slot.startTime, timezone, 'h:mm a');
  const end = formatInTimeZone(slot.endTime, timezone, 'h:mm a');
  return `${start} - ${end}`;
};

/**
 * Gets the start of the current week (Monday)
 * @returns Date object representing Monday of current week
 */
export const getWeekStart = (): Date => {
  const now = new Date();
  return startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday
};
