import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorsListScreen } from '../screens/DoctorsListScreen';
import { DoctorDetailScreen } from '../screens/DoctorDetailScreen';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { Doctor, TimeSlot } from '../types';

export type SerializedTimeSlot = Omit<TimeSlot, 'startTime' | 'endTime'> & {
  startTime: string;
  endTime: string;
};

export type RootStackParamList = {
  DoctorsList: undefined;
  DoctorDetail: { doctor: Doctor };
  BookingConfirmation: { doctor: Doctor; slot: SerializedTimeSlot };
  MyBookings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  console.log('[AppNavigator] Initializing navigation');
  return (
    <NavigationContainer
      onStateChange={(state) => {
        console.log('[AppNavigator] Navigation state changed:', state);
      }}
      onReady={() => {
        console.log('[AppNavigator] Navigation ready');
      }}
    >
      <Stack.Navigator
        initialRouteName="DoctorsList"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="DoctorsList" component={DoctorsListScreen} />
        <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
