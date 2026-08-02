import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HabitProvider } from './context/HabitContext';
import { RpgProvider } from './context/RpgContext';
import AppNavigator from './navigation/AppNavigator';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P: PressStart2P_400Regular,
  });

  if (!fontsLoaded) return null; // o un splash screen

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

