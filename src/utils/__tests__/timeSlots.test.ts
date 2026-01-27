import { generateTimeSlots, getAllDoctorTimeSlots, formatTimeSlot, getWeekStart } from '../timeSlots';
import { DoctorAvailability, Booking } from '../../types';
import { startOfWeek } from 'date-fns';

describe('Time Slots Utilities', () => {
  describe('generateTimeSlots', () => {
    it('should generate 30-minute slots for a time window', () => {
      const availability: DoctorAvailability = {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        day_of_week: 'Monday',
        available_at: ' 9:00AM',
        available_until: '11:00AM',
      };

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const slots = generateTimeSlots(availability, weekStart);

      // Should have 4 slots: 9:00-9:30, 9:30-10:00, 10:00-10:30, 10:30-11:00
      expect(slots.length).toBeGreaterThanOrEqual(4);
      expect(slots[0].dayOfWeek).toBe('Monday');
      expect(slots[0].timezone).toBe('Australia/Sydney');
    });

    it('should mark slots as unavailable if already booked', () => {
      const availability: DoctorAvailability = {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        day_of_week: 'Monday',
        available_at: ' 9:00AM',
        available_until: '10:00AM',
      };

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const slots = generateTimeSlots(availability, weekStart);
      const firstSlot = slots[0];

      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          startTime: firstSlot.startTime.toISOString(),
          endTime: firstSlot.endTime.toISOString(),
          dayOfWeek: 'Monday',
          createdAt: new Date().toISOString(),
        },
      ];

      const slotsWithBookings = generateTimeSlots(availability, weekStart, bookings);
      const bookedSlot = slotsWithBookings.find(
        (s) => s.startTime.getTime() === firstSlot.startTime.getTime()
      );

      expect(bookedSlot).toBeDefined();
      expect(bookedSlot?.isAvailable).toBe(false);
    });

    it('should handle invalid day of week', () => {
      const availability: DoctorAvailability = {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        day_of_week: 'InvalidDay',
        available_at: ' 9:00AM',
        available_until: '11:00AM',
      };

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const slots = generateTimeSlots(availability, weekStart);

      expect(slots).toEqual([]);
    });

    it('should handle edge case with exact 30-minute window', () => {
      const availability: DoctorAvailability = {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        day_of_week: 'Monday',
        available_at: ' 9:00AM',
        available_until: ' 9:30AM',
      };

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const slots = generateTimeSlots(availability, weekStart);

      expect(slots.length).toBe(1);
    });
  });

  describe('getAllDoctorTimeSlots', () => {
    it('should generate slots for all availability days', () => {
      const doctor = {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        availability: [
          {
            name: 'Dr. Test',
            timezone: 'Australia/Sydney',
            day_of_week: 'Monday',
            available_at: ' 9:00AM',
            available_until: '10:00AM',
          },
          {
            name: 'Dr. Test',
            timezone: 'Australia/Sydney',
            day_of_week: 'Tuesday',
            available_at: ' 9:00AM',
            available_until: '10:00AM',
          },
        ],
      };

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const slotsByDay = getAllDoctorTimeSlots(doctor, weekStart);

      expect(slotsByDay['Monday']).toBeDefined();
      expect(slotsByDay['Tuesday']).toBeDefined();
      expect(slotsByDay['Monday'].length).toBeGreaterThan(0);
      expect(slotsByDay['Tuesday'].length).toBeGreaterThan(0);
    });

    it('should exclude days with no availability', () => {
      const doctor = {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        availability: [],
      };

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const slotsByDay = getAllDoctorTimeSlots(doctor, weekStart);

      expect(Object.keys(slotsByDay).length).toBe(0);
    });
  });

  describe('formatTimeSlot', () => {
    it('should format time slot correctly', () => {
      const slot = {
        startTime: new Date('2024-01-01T09:00:00'),
        endTime: new Date('2024-01-01T09:30:00'),
        dayOfWeek: 'Monday',
        timezone: 'Australia/Sydney',
        isAvailable: true,
      };

      const formatted = formatTimeSlot(slot, 'Australia/Sydney');
      expect(formatted).toContain('9:00');
      expect(formatted).toContain('9:30');
    });
  });

  describe('getWeekStart', () => {
    it('should return Monday of current week', () => {
      const weekStart = getWeekStart();
      expect(weekStart.getDay()).toBe(1); // Monday is day 1
    });
  });
});
