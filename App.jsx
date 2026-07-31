import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HabitProvider } from './context/HabitContext';
import { RpgProvider } from './context/RpgContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitProvider>
        <RpgProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </RpgProvider>
      </HabitProvider>
    </SafeAreaProvider>
  );
}

