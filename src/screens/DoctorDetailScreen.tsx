import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Doctor, TimeSlot, RootStackParamList, SerializedTimeSlot } from '../types';
import { getAllDoctorTimeSlots, formatTimeSlot, getWeekStart } from '../utils/timeSlots';
import { useBookings } from '../context/BookingsContext';
import { DAYS_ORDER, COLORS } from '../constants';

type DoctorDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DoctorDetail'
>;

type DoctorDetailScreenRouteProp = RouteProp<RootStackParamList, 'DoctorDetail'>;

interface Props {
  navigation: DoctorDetailScreenNavigationProp;
  route: DoctorDetailScreenRouteProp;
}

export const DoctorDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { doctor } = route.params;
  const { bookings } = useBookings();
  const [timeSlotsByDay, setTimeSlotsByDay] = useState<Record<string, TimeSlot[]>>({});
  
  const weekStart = useMemo(() => getWeekStart(), []);

  useEffect(() => {
    const slots = getAllDoctorTimeSlots(doctor, weekStart, bookings);
    setTimeSlotsByDay(slots);
  }, [doctor, weekStart, bookings]);

  const handleSlotPress = useCallback((slot: TimeSlot) => {
    if (slot.isAvailable) {
      const serializedSlot: SerializedTimeSlot = {
        ...slot,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
      };
      navigation.navigate('BookingConfirmation', { 
        doctor, 
        slot: serializedSlot 
      });
    }
  }, [navigation, doctor]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderTimeSlot = useCallback((slot: TimeSlot, index: number) => (
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
  ), [handleSlotPress]);

  const renderDaySection = useCallback((day: string) => {
    const slots = timeSlotsByDay[day] || [];
    if (slots.length === 0) return null;

    return (
      <View key={day} style={styles.daySection}>
        <Text style={styles.dayTitle}>{day}</Text>
        <View style={styles.slotsContainer}>
          {slots.map(renderTimeSlot)}
        </View>
      </View>
    );
  }, [timeSlotsByDay, renderTimeSlot]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
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
        {DAYS_ORDER.map(renderDaySection)}
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  timezone: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    marginBottom: 8,
  },
  slotButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  slotText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  slotTextDisabled: {
    color: COLORS.text.disabled,
  },
  bookedLabel: {
    fontSize: 10,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.disabled,
  },
});