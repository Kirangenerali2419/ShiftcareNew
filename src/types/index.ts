export interface DoctorAvailability {
  name: string;
  timezone: string;
  day_of_week: string;
  available_at: string;
  available_until: string;
}

export interface Doctor {
  id: string;
  name: string;
  timezone: string;
  availability: DoctorAvailability[];
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  dayOfWeek: string;
  timezone: string;
  isAvailable: boolean;
}

export interface SerializedTimeSlot {
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  timezone: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  doctorName: string;
  doctorTimezone: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  createdAt: string;
}

export interface BookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

export type RootStackParamList = {
  DoctorsList: undefined;
  DoctorDetail: { doctor: Doctor };
  BookingConfirmation: { doctor: Doctor; slot: SerializedTimeSlot };
  MyBookings: undefined;
};
