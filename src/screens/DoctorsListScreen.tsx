import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Doctor, RootStackParamList } from '../types';
import { getDoctors } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { COLORS } from '../constants';

type DoctorsListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DoctorsList'
>;

interface Props {
  navigation: DoctorsListScreenNavigationProp;
}

export const DoctorsListScreen: React.FC<Props> = ({ navigation }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const doctorsData = await getDoctors();
      setDoctors(doctorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    navigation.navigate('DoctorDetail', { doctor });
  }, [navigation]);

  const handleMyBookingsPress = useCallback(() => {
    navigation.navigate('MyBookings');
  }, [navigation]);

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
          onPress={handleMyBookingsPress}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  bookingsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookingsButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  doctorCard: {
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
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  doctorTimezone: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.disabled,
  },
});