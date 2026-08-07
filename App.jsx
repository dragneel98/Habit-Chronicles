import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { HabitProvider } from './context/HabitContext';
import { RpgProvider } from './context/RpgContext';
import AppNavigator from './navigation/AppNavigator';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

// Mantener la pantalla de splash visible mientras se cargan los recursos
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P: PressStart2P_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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


