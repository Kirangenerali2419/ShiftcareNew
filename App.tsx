import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { BookingsProvider } from './src/context/BookingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

console.log('[App] Starting application...');

export default function App() {
  console.log('[App] Rendering App component');
  return (
    <ErrorBoundary>
      <BookingsProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </BookingsProvider>
    </ErrorBoundary>
  );
}
