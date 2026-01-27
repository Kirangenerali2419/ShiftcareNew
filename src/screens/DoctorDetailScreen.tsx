import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Doctor, TimeSlot } from '../types';
import { getAllDoctorTimeSlots, formatTimeSlot, getWeekStart } from '../utils/timeSlots';
import { useBookings } from '../context/BookingsContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SerializedTimeSlot } from '../navigation/AppNavigator';

type RootStackParamList = {
  DoctorsList: undefined;
  DoctorDetail: { doctor: Doctor };
  BookingConfirmation: { doctor: Doctor; slot: SerializedTimeSlot };
  MyBookings: undefined;
};

type DoctorDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DoctorDetail'
>;

type DoctorDetailScreenRouteProp = RouteProp<RootStackParamList, 'DoctorDetail'>;

interface Props {
  navigation: DoctorDetailScreenNavigationProp;
  route: DoctorDetailScreenRouteProp;
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  console.log('[DoctorDetailScreen] Component initialized');
  console.log('[DoctorDetailScreen] Route params:', route.params);
  const { doctor } = route.params;
  console.log('[DoctorDetailScreen] Doctor:', doctor.name);
  const { bookings } = useBookings();
  const [timeSlotsByDay, setTimeSlotsByDay] = useState<Record<string, TimeSlot[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [weekStart] = useState(getWeekStart());

  useEffect(() => {
    console.log('[DoctorDetailScreen] Generating time slots...');
    const slots = getAllDoctorTimeSlots(doctor, weekStart, bookings);
    console.log('[DoctorDetailScreen] Generated slots for days:', Object.keys(slots));
    setTimeSlotsByDay(slots);
  }, [doctor, weekStart, bookings]);

  const handleSlotPress = (slot: TimeSlot) => {
    console.log('[DoctorDetailScreen] Slot pressed:', slot);
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      // Convert Date objects to ISO strings for navigation
      const serializedSlot = {
        ...slot,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
      };
      console.log('[DoctorDetailScreen] Navigating to BookingConfirmation with serialized slot:', serializedSlot);
      navigation.navigate('BookingConfirmation', { 
        doctor, 
        slot: serializedSlot as any 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Details</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.timezone}>Timezone: {doctor.timezone}</Text>
        </View>
        <Text style={styles.sectionTitle}>Available Time Slots (30 minutes each)</Text>
        {DAYS_ORDER.map((day) => {
          const slots = timeSlotsByDay[day] || [];
          if (slots.length === 0) return null;

          return (
            <View key={day} style={styles.daySection}>
              <Text style={styles.dayTitle}>{day}</Text>
              <View style={styles.slotsContainer}>
                {slots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotButton,
                      !slot.isAvailable && styles.slotButtonDisabled,
                    ]}
                    onPress={() => handleSlotPress(slot)}
                    disabled={!slot.isAvailable}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        !slot.isAvailable && styles.slotTextDisabled,
                      ]}
                    >
                      {formatTimeSlot(slot, slot.timezone)}
                    </Text>
                    {!slot.isAvailable && (
                      <Text style={styles.bookedLabel}>Booked</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
        {Object.keys(timeSlotsByDay).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No available slots this week</Text>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  doctorInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timezone: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    marginBottom: 8,
  },
  slotButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  slotText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  slotTextDisabled: {
    color: '#999',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#D32F2F',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
