import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../types';
import { STORAGE_KEYS } from '../constants';

class StorageError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'StorageError';
  }
}

const handleStorageError = (error: unknown, operation: string): never => {
  const message = error instanceof Error ? error.message : 'Unknown storage error';
  throw new StorageError(`Storage ${operation} failed: ${message}`, operation);
};

export const getStoredBookings = async (): Promise<Booking[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    handleStorageError(error, 'read');
  }
};

export const saveBooking = async (booking: Booking): Promise<Booking> => {
  try {
    const existingBookings = await getStoredBookings();
    const updatedBookings = [...existingBookings, booking];
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
    return booking;
  } catch (error) {
    handleStorageError(error, 'save');
  }
};

export const removeBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const existingBookings = await getStoredBookings();
    const updatedBookings = existingBookings.filter((b) => b.id !== bookingId);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
    return true;
  } catch (error) {
    handleStorageError(error, 'remove');
  }
};

export const isSlotBooked = async (doctorName: string, startTime: string): Promise<boolean> => {
  try {
    const bookings = await getStoredBookings();
    return bookings.some(
      (booking) => booking.doctorName === doctorName && booking.startTime === startTime
    );
  } catch (error) {
    return false;
  }
};
