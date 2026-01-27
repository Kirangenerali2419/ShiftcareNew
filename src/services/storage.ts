import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../types';

const BOOKINGS_KEY = '@shiftcare:bookings';

/**
 * Retrieves all stored bookings from AsyncStorage
 * @returns Promise resolving to array of bookings, or empty array if none exist
 */
export const getStoredBookings = async (): Promise<Booking[]> => {
  try {
    const data = await AsyncStorage.getItem(BOOKINGS_KEY);
    if (data) {
      return JSON.parse(data) as Booking[];
    }
    return [];
  } catch (error) {
    console.error('Error reading bookings from storage:', error);
    return [];
  }
};

/**
 * Saves a booking to AsyncStorage
 * @param booking Booking object to save
 * @returns Promise resolving to the saved booking
 */
export const saveBooking = async (booking: Booking): Promise<Booking> => {
  try {
    const existingBookings = await getStoredBookings();
    const updatedBookings = [...existingBookings, booking];
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
    return booking;
  } catch (error) {
    console.error('Error saving booking to storage:', error);
    throw new Error('Failed to save booking');
  }
};

/**
 * Removes a booking from AsyncStorage
 * @param bookingId ID of the booking to remove
 * @returns Promise resolving to true if booking was removed, false otherwise
 */
export const removeBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const existingBookings = await getStoredBookings();
    const updatedBookings = existingBookings.filter((b) => b.id !== bookingId);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
    return true;
  } catch (error) {
    console.error('Error removing booking from storage:', error);
    return false;
  }
};

/**
 * Checks if a specific doctor/time slot is already booked
 * @param doctorName Name of the doctor
 * @param startTime Start time of the slot (ISO string)
 * @returns Promise resolving to true if slot is booked, false otherwise
 */
export const isSlotBooked = async (doctorName: string, startTime: string): Promise<boolean> => {
  try {
    const bookings = await getStoredBookings();
    return bookings.some(
      (booking) => booking.doctorName === doctorName && booking.startTime === startTime
    );
  } catch (error) {
    console.error('Error checking if slot is booked:', error);
    return false;
  }
};
