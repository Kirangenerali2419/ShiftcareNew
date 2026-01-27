import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Doctor } from '../types';
import { getDoctors } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { SerializedTimeSlot } from '../navigation/AppNavigator';

type RootStackParamList = {
  DoctorsList: undefined;
  DoctorDetail: { doctor: Doctor };
  BookingConfirmation: { doctor: Doctor; slot: SerializedTimeSlot };
  MyBookings: undefined;
};

type DoctorsListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DoctorsList'
>;

interface Props {
  navigation: DoctorsListScreenNavigationProp;
}

export const DoctorsListScreen: React.FC<Props> = ({ navigation }) => {
  console.log('[DoctorsListScreen] Component initialized');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = async () => {
    try {
      console.log('[DoctorsListScreen] Starting to load doctors...');
      setIsLoading(true);
      setError(null);
      const doctorsData = await getDoctors();
      console.log('[DoctorsListScreen] Loaded doctors:', doctorsData.length);
      setDoctors(doctorsData);
    } catch (err) {
      console.error('[DoctorsListScreen] Error loading doctors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
    } finally {
      setIsLoading(false);
      console.log('[DoctorsListScreen] Finished loading doctors');
    }
  };

  useEffect(() => {
    console.log('[DoctorsListScreen] useEffect triggered');
    loadDoctors();
  }, []);

  const handleDoctorPress = (doctor: Doctor) => {
    navigation.navigate('DoctorDetail', { doctor });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading doctors..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadDoctors} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Doctors</Text>
        <TouchableOpacity
          style={styles.bookingsButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.bookingsButtonText}>My Bookings</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.doctorCard}
            onPress={() => handleDoctorPress(item)}
          >
            <Text style={styles.doctorName}>{item.name}</Text>
            <Text style={styles.doctorTimezone}>{item.timezone}</Text>
            <Text style={styles.availabilityText}>
              {item.availability.length} day{item.availability.length !== 1 ? 's' : ''} available
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No doctors available</Text>
          </View>
        }
      />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookingsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  doctorTimezone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
