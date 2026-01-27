import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Doctor, TimeSlot } from '../types';
import { formatTimeSlot } from '../utils/timeSlots';
import { useBookings } from '../context/BookingsContext';
import { SerializedTimeSlot } from '../navigation/AppNavigator';

type RootStackParamList = {
  DoctorsList: undefined;
  DoctorDetail: { doctor: Doctor };
  BookingConfirmation: { doctor: Doctor; slot: SerializedTimeSlot };
  MyBookings: undefined;
};

type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingConfirmation'
>;

type BookingConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  'BookingConfirmation'
>;

interface Props {
  navigation: BookingConfirmationScreenNavigationProp;
  route: BookingConfirmationScreenRouteProp;
}

export const BookingConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  console.log('[BookingConfirmationScreen] Component initialized');
  console.log('[BookingConfirmationScreen] Route params:', route.params);
  const { doctor, slot: serializedSlot } = route.params;
  console.log('[BookingConfirmationScreen] Doctor:', doctor?.name);
  console.log('[BookingConfirmationScreen] Serialized slot:', serializedSlot);
  const { addBooking } = useBookings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert serialized slot back to TimeSlot with Date objects
  const slot: TimeSlot = useMemo(() => {
    console.log('[BookingConfirmationScreen] Converting serialized slot to TimeSlot');
    try {
      const converted = {
        ...serializedSlot,
        startTime: new Date(serializedSlot.startTime),
        endTime: new Date(serializedSlot.endTime),
      };
      console.log('[BookingConfirmationScreen] Converted slot:', converted);
      return converted;
    } catch (error) {
      console.error('[BookingConfirmationScreen] Error converting slot:', error);
      throw error;
    }
  }, [serializedSlot]);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      
      await addBooking({
        doctorName: doctor.name,
        doctorTimezone: doctor.timezone,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        dayOfWeek: slot.dayOfWeek,
      });
      
      Alert.alert(
        'Booking Confirmed! 🎉',
        'Your appointment has been booked successfully.',
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              navigation.navigate('MyBookings');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to book appointment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Doctor</Text>
          <Text style={styles.value}>{doctor.name}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Day</Text>
          <Text style={styles.value}>{slot.dayOfWeek}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{formatTimeSlot(slot, slot.timezone)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Timezone</Text>
          <Text style={styles.value}>{slot.timezone}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmButtonText}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
