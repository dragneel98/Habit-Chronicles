// ============================================================
// AppNavigator.js
// Estructura de navegación: Tabs (Inicio / Estadísticas) +
// Stack para Crear hábito y Detalle de hábito.
// ============================================================
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import CreateHabitScreen from '../screens/CreateHabitScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import StatsScreen from '../screens/StatsScreen';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTitleStyle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.lg },
  headerTintColor: COLORS.primary,
  headerShadowVisible: false,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ title: 'Nuevo hábito' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Detalle' }} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StatsMain" component={StatsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}


export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={HomeStack}
          options={{
            tabBarIcon: ({ focused }) => <Ionicons
              name="home"
              size={24}
              color="black"
            />
          }}
        />
        <Tab.Screen
          name="Estadísticas"
          component={StatsStack}
          options={{
            tabBarIcon: ({ focused }) =>
              <TabIcon emoji="📊" focused={focused} />
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
