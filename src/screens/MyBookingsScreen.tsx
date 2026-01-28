import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useBookings } from '../context/BookingsContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { RootStackParamList, Booking } from '../types';
import { COLORS } from '../constants';

type MyBookingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MyBookings'
>;

interface Props {
  navigation: MyBookingsScreenNavigationProp;
}

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const { bookings, isLoading, error, cancelBooking } = useBookings();

  const handleCancel = useCallback((bookingId: string, doctorName: string) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment with ${doctorName}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to cancel appointment'
              );
            }
          },
        },
      ]
    );
  }, [cancelBooking]);

  const formatBookingDate = useCallback((dateString: string, timezone: string): string => {
    try {
      const date = parseISO(dateString);
      return formatInTimeZone(date, timezone, 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBrowseDoctors = useCallback(() => {
    navigation.navigate('DoctorsList');
  }, [navigation]);

  const renderBookingItem = useCallback(({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.doctorName}>{item.doctorName}</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id, item.doctorName)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.bookingDetail}>
        {item.dayOfWeek} • {formatBookingDate(item.startTime, item.doctorTimezone)}
      </Text>
      <Text style={styles.timezone}>Timezone: {item.doctorTimezone}</Text>
      <Text style={styles.createdAt}>
        Booked on {format(parseISO(item.createdAt), 'MMM dd, yyyy')}
      </Text>
    </View>
  ), [handleCancel, formatBookingDate]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No bookings yet</Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={handleBrowseDoctors}
      >
        <Text style={styles.browseButtonText}>Browse Doctors</Text>
      </TouchableOpacity>
    </View>
  ), [handleBrowseDoctors]);

  if (isLoading) {
    return <LoadingSpinner message="Loading bookings..." />;
  }

  if (error) {
    return <ErrorView message={error} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
      />
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
  listContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  bookingDetail: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  timezone: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 12,
    color: COLORS.text.disabled,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text.disabled,
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});