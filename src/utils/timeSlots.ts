import { format, addMinutes, startOfWeek, addDays, isSameDay } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { DoctorAvailability, TimeSlot, Booking } from '../types';
import { TIME_CONFIG } from '../constants';

const DAY_MAP: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
} as const;

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
  
  const dateString = format(day, 'yyyy-MM-dd');
  const timeString24 = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  const dateTimeString = `${dateString} ${timeString24}`;
  
  return zonedTimeToUtc(dateTimeString, timezone);
};

const isSlotBooked = (booking: Booking, doctorName: string, slotStart: Date): boolean => {
  const bookingStart = new Date(booking.startTime);
  return (
    booking.doctorName === doctorName &&
    isSameDay(bookingStart, slotStart) &&
    bookingStart.getTime() === slotStart.getTime()
  );
};

export const generateTimeSlots = (
  availability: DoctorAvailability,
  weekStart: Date,
  existingBookings: Booking[] = []
): TimeSlot[] => {
  const dayOffset = DAY_MAP[availability.day_of_week];
  if (dayOffset === undefined) return [];
  
  const targetDay = addDays(weekStart, dayOffset);
  const startTime = parseTimeString(availability.available_at, targetDay, availability.timezone);
  const endTime = parseTimeString(availability.available_until, targetDay, availability.timezone);
  
  const slots: TimeSlot[] = [];
  let currentTime = startTime;
  
  while (currentTime < endTime) {
    const slotEndTime = addMinutes(currentTime, TIME_CONFIG.SLOT_DURATION_MINUTES);
    
    const isBooked = existingBookings.some((booking) => 
      isSlotBooked(booking, availability.name, currentTime)
    );
    
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

export const getAllDoctorTimeSlots = (
  doctor: { name: string; timezone: string; availability: DoctorAvailability[] },
  weekStart: Date,
  existingBookings: Booking[] = []
): Record<string, TimeSlot[]> => {
  return doctor.availability.reduce((acc, avail) => {
    const slots = generateTimeSlots(avail, weekStart, existingBookings);
    if (slots.length > 0) {
      acc[avail.day_of_week] = slots;
    }
    return acc;
  }, {} as Record<string, TimeSlot[]>);
};

export const formatTimeSlot = (slot: TimeSlot, timezone: string): string => {
  const start = formatInTimeZone(slot.startTime, timezone, 'h:mm a');
  const end = formatInTimeZone(slot.endTime, timezone, 'h:mm a');
  return `${start} - ${end}`;
};

export const getWeekStart = (): Date => {
  const now = new Date();
  return startOfWeek(now, { weekStartsOn: TIME_CONFIG.WEEK_START_DAY });
};
