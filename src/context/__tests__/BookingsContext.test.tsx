import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { BookingsProvider, useBookings } from '../BookingsContext';
import * as storage from '../../services/storage';
import { Booking } from '../../types';

jest.mock('../../services/storage');

describe('BookingsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BookingsProvider>{children}</BookingsProvider>
  );

  it('should load bookings on mount', async () => {
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

    (storage.getStoredBookings as jest.Mock).mockResolvedValueOnce(mockBookings);

    const { result } = renderHook(() => useBookings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookings).toEqual(mockBookings);
  });

  it('should add a new booking', async () => {
    (storage.getStoredBookings as jest.Mock).mockResolvedValueOnce([]);
    (storage.saveBooking as jest.Mock).mockImplementation(async (booking) => booking);

    const { result } = renderHook(() => useBookings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newBooking = {
      doctorName: 'Dr. Test',
      doctorTimezone: 'Australia/Sydney',
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T09:30:00Z',
      dayOfWeek: 'Monday',
    };

    await act(async () => {
      await result.current.addBooking(newBooking);
    });

    expect(result.current.bookings.length).toBe(1);
    expect(result.current.bookings[0].doctorName).toBe('Dr. Test');
  });

  it('should prevent duplicate bookings', async () => {
    const existingBooking: Booking = {
      id: 'booking-1',
      doctorName: 'Dr. Test',
      doctorTimezone: 'Australia/Sydney',
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T09:30:00Z',
      dayOfWeek: 'Monday',
      createdAt: '2024-01-01T08:00:00Z',
    };

    (storage.getStoredBookings as jest.Mock).mockResolvedValueOnce([existingBooking]);

    const { result } = renderHook(() => useBookings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const duplicateBooking = {
      doctorName: 'Dr. Test',
      doctorTimezone: 'Australia/Sydney',
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T09:30:00Z',
      dayOfWeek: 'Monday',
    };

    await act(async () => {
      await expect(result.current.addBooking(duplicateBooking)).rejects.toThrow(
        'already booked'
      );
    });
  });

  it('should cancel a booking', async () => {
    const booking: Booking = {
      id: 'booking-1',
      doctorName: 'Dr. Test',
      doctorTimezone: 'Australia/Sydney',
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T09:30:00Z',
      dayOfWeek: 'Monday',
      createdAt: '2024-01-01T08:00:00Z',
    };

    (storage.getStoredBookings as jest.Mock).mockResolvedValueOnce([booking]);
    (storage.removeBooking as jest.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() => useBookings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.cancelBooking('booking-1');
    });

    expect(result.current.bookings.length).toBe(0);
  });

  it('should check if slot is booked', async () => {
    const booking: Booking = {
      id: 'booking-1',
      doctorName: 'Dr. Test',
      doctorTimezone: 'Australia/Sydney',
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T09:30:00Z',
      dayOfWeek: 'Monday',
      createdAt: '2024-01-01T08:00:00Z',
    };

    (storage.getStoredBookings as jest.Mock).mockResolvedValueOnce([booking]);

    const { result } = renderHook(() => useBookings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isSlotBooked('Dr. Test', '2024-01-01T09:00:00Z')).toBe(true);
    expect(result.current.isSlotBooked('Dr. Test', '2024-01-01T10:00:00Z')).toBe(false);
  });
});
