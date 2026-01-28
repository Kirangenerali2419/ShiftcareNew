import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { BookingsProvider } from './src/context/BookingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BookingsProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </BookingsProvider>
    </ErrorBoundary>
  );
}
