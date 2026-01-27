import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStoredBookings,
  saveBooking,
  removeBooking,
  isSlotBooked,
} from '../storage';
import { Booking } from '../../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStoredBookings', () => {
    it('should return empty array when no bookings exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getStoredBookings();
      expect(result).toEqual([]);
    });

    it('should return parsed bookings when they exist', async () => {
      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          startTime: '2024-01-01T09:00:00Z',
          endTime: '2024-01-01T09:30:00Z',
          dayOfWeek: 'Monday',
          createdAt: '2024-01-01T08:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockBookings));

      const result = await getStoredBookings();
      expect(result).toEqual(mockBookings);
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await getStoredBookings();
      expect(result).toEqual([]);
    });
  });

  describe('saveBooking', () => {
    it('should save a new booking', async () => {
      const newBooking: Booking = {
        id: 'booking-1',
        doctorName: 'Dr. Test',
        doctorTimezone: 'Australia/Sydney',
        startTime: '2024-01-01T09:00:00Z',
        endTime: '2024-01-01T09:30:00Z',
        dayOfWeek: 'Monday',
        createdAt: '2024-01-01T08:00:00Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await saveBooking(newBooking);
      expect(result).toEqual(newBooking);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should append to existing bookings', async () => {
      const existingBookings: Booking[] = [
        {
          id: 'booking-1',
          doctorName: 'Dr. One',
          doctorTimezone: 'Australia/Sydney',
          startTime: '2024-01-01T09:00:00Z',
          endTime: '2024-01-01T09:30:00Z',
          dayOfWeek: 'Monday',
          createdAt: '2024-01-01T08:00:00Z',
        },
      ];

      const newBooking: Booking = {
        id: 'booking-2',
        doctorName: 'Dr. Two',
        doctorTimezone: 'Australia/Perth',
        startTime: '2024-01-02T10:00:00Z',
        endTime: '2024-01-02T10:30:00Z',
        dayOfWeek: 'Tuesday',
        createdAt: '2024-01-02T08:00:00Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingBookings));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      await saveBooking(newBooking);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify([...existingBookings, newBooking])
      );
    });

    it('should throw error on save failure', async () => {
      const booking: Booking = {
        id: 'booking-1',
        doctorName: 'Dr. Test',
        doctorTimezone: 'Australia/Sydney',
        startTime: '2024-01-01T09:00:00Z',
        endTime: '2024-01-01T09:30:00Z',
        dayOfWeek: 'Monday',
        createdAt: '2024-01-01T08:00:00Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Save failed'));

      await expect(saveBooking(booking)).rejects.toThrow('Failed to save booking');
    });
  });

  describe('removeBooking', () => {
    it('should remove a booking by ID', async () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          startTime: '2024-01-01T09:00:00Z',
          endTime: '2024-01-01T09:30:00Z',
          dayOfWeek: 'Monday',
          createdAt: '2024-01-01T08:00:00Z',
        },
        {
          id: 'booking-2',
          doctorName: 'Dr. Another',
          doctorTimezone: 'Australia/Perth',
          startTime: '2024-01-02T10:00:00Z',
          endTime: '2024-01-02T10:30:00Z',
          dayOfWeek: 'Tuesday',
          createdAt: '2024-01-02T08:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(bookings));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await removeBooking('booking-1');
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify([bookings[1]])
      );
    });

    it('should handle removal errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Read failed'));

      const result = await removeBooking('booking-1');
      expect(result).toBe(false);
    });
  });

  describe('isSlotBooked', () => {
    it('should return true if slot is booked', async () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          startTime: '2024-01-01T09:00:00Z',
          endTime: '2024-01-01T09:30:00Z',
          dayOfWeek: 'Monday',
          createdAt: '2024-01-01T08:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(bookings));

      const result = await isSlotBooked('Dr. Test', '2024-01-01T09:00:00Z');
      expect(result).toBe(true);
    });

    it('should return false if slot is not booked', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));

      const result = await isSlotBooked('Dr. Test', '2024-01-01T09:00:00Z');
      expect(result).toBe(false);
    });
  });
});
