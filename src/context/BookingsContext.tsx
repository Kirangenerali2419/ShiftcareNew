import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Booking, BookingsState } from '../types';
import { getStoredBookings, saveBooking, removeBooking } from '../services/storage';

interface BookingsContextType extends BookingsState {
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
  isSlotBooked: (doctorName: string, startTime: string) => boolean;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

const generateBookingId = (): string => 
  `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedBookings = await getStoredBookings();
      setBookings(storedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const addBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      const isDuplicate = bookings.some(
        (b) => b.doctorName === bookingData.doctorName && b.startTime === bookingData.startTime
      );
      
      if (isDuplicate) {
        throw new Error('This appointment slot is already booked');
      }
      
      const newBooking: Booking = {
        ...bookingData,
        id: generateBookingId(),
        createdAt: new Date().toISOString(),
      };
      
      await saveBooking(newBooking);
      setBookings((prev) => [...prev, newBooking]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [bookings]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      setError(null);
      const success = await removeBooking(bookingId);
      if (success) {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const isSlotBooked = useCallback(
    (doctorName: string, startTime: string): boolean => {
      return bookings.some(
        (booking) => booking.doctorName === doctorName && booking.startTime === startTime
      );
    },
    [bookings]
  );

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        isLoading,
        error,
        addBooking,
        cancelBooking,
        refreshBookings: loadBookings,
        isSlotBooked,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = (): BookingsContextType => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};