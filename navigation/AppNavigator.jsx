// Estructura de navegación: Tabs (Inicio / Estadísticas) +
// Stack para Crear hábito y Detalle de hábito.
// ============================================================
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BarChart3 } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import CreateHabitScreen from '../screens/CreateHabitScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import StatsScreen from '../screens/StatsScreen';
import { COLORS, FONT_SIZES } from '../constants/theme';
import { UseSound } from '../utils/useSound';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTitleStyle: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontFamily: 'PressStart2P',
  },
  headerTintColor: COLORS.primary,
  headerShadowVisible: false,
};

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: COLORS.primaryLight,
  tabBarInactiveTintColor: `${COLORS.primaryLight}80`,
  tabBarLabelStyle: {
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.2,
    fontFamily: 'PressStart2P',
  },
  tabBarStyle: {
    backgroundColor: COLORS.primaryBackground,
    borderTopWidth: 3,
    borderTopColor: COLORS.primaryBorder,
    paddingTop: 6,
    paddingBottom: 8,
    height: 78,
    elevation: 0,
  },
  tabBarIconStyle: { marginBottom: 0 },
  tabBarItemStyle: { paddingVertical: 4 },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ title: 'Nuevo hábito' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Detalle' }} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="StatsMain" component={StatsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
          name="Inicio"
          component={HomeStack}
          options={{
            tabBarIcon: ({ focused, color }) => <Home size={22} color={color} />,
          }}
        />
        <Tab.Screen
          name="Estadísticas"
          component={StatsStack}
          options={{
            tabBarIcon: ({ focused, color }) => <BarChart3 size={22} color={color} />,
          }}
          listeners={{
            tabPress: () => UseSound.stats(),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
