// ============================================================
// HabitContext.js
// Estado global de la app: lista de hábitos + acciones para
// crear, editar, borrar y marcar como completado. Persiste todo
// en AsyncStorage automáticamente.
// ============================================================
import { createContext, useContext, useEffect, useReducer } from 'react';
import { Alert } from 'react-native';
import { loadHabits, saveHabits } from '../utils/storage';
import { todayKey, isWithinExecutionWindow } from '../utils/dates';
import { scheduleHabitReminder, cancelHabitReminder } from '../utils/notifications';
import { isScheduledDay } from '../utils/streaks';

const HabitContext = createContext(null);

const initialState = {
  habits: [],
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, habits: action.payload, loaded: true };
    case 'ADD_HABIT':
      return { ...state, habits: [action.payload, ...state.habits] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.payload.id ? action.payload : h)),
      };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
    case 'TOGGLE_COMPLETION': {
      const { habitId, dateKey } = action.payload;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== habitId) return h;
          const completions = { ...h.completions };
          if (completions[dateKey]) {
            delete completions[dateKey];
          } else {
            completions[dateKey] = true;
          }
          return { ...h, completions };
        }),
      };
    }
    default:
      return state;
  }
}

export function HabitProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const habits = await loadHabits();
      dispatch({ type: 'HYDRATE', payload: habits });
    })();
  }, []);

  useEffect(() => {
    if (state.loaded) {
      saveHabits(state.habits);
    }
  }, [state.habits, state.loaded]);

  const addHabit = async (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      attribute: habit.attribute || 'fuerza',
      xpReward: habit.xpReward || 10,
      frequency: habit.frequency, // { type: 'daily' } | { type: 'weekly', days: [1,3,5] }
      executionTime: habit.executionTime, // { enabled, startHour, startMinute, endHour, endMinute }
      reminder: habit.reminder,   // { enabled, useCustomTime, hour, minute }
      completions: {},
      createdAt: new Date().toISOString(),
      notificationIds: [],
    };


    if (newHabit.reminder?.enabled) {
      newHabit.notificationIds = await scheduleHabitReminder(newHabit);
    }

    dispatch({ type: 'ADD_HABIT', payload: newHabit });
  };

  const updateHabit = async (habit) => {
    if (habit.notificationIds || habit.notificationId) {
      await cancelHabitReminder(habit.notificationIds || habit.notificationId);
      habit.notificationIds = [];
      habit.notificationId = null;
    }
    if (habit.reminder?.enabled) {
      habit.notificationIds = await scheduleHabitReminder(habit);
    }
    dispatch({ type: 'UPDATE_HABIT', payload: habit });
  };

  const deleteHabit = async (habitId) => {
    const habit = state.habits.find((h) => h.id === habitId);
    if (habit) {
      const ids = habit.notificationIds || habit.notificationId;
      if (ids) {
        await cancelHabitReminder(ids);
      }
    }
    dispatch({ type: 'DELETE_HABIT', payload: habitId });
  };

  const toggleToday = (habitId) => {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return false;

    const today = new Date();
    const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const currentDayName = dayLabels[today.getDay()];

    if (!isScheduledDay(habit, today)) {
      Alert.alert(
        'Hábito no programado',
        `Este hábito no está programado para ejecutarse hoy (${currentDayName}).`
      );
      return false;
    }
    if (!isWithinExecutionWindow(habit, today)) {
      const { startHour, startMinute, endHour, endMinute } = habit.executionTime;
      const pad = (n) => String(n).padStart(2, '0');
      Alert.alert(
        'Fuera de horario',
        `Este hábito solo se puede completar entre las ${pad(startHour)}:${pad(startMinute)} y las ${pad(endHour)}:${pad(endMinute)} (Hora detectada en el dispositivo: ${pad(today.getHours())}:${pad(today.getMinutes())}).`
      );
      return false;
    }

    dispatch({ type: 'TOGGLE_COMPLETION', payload: { habitId, dateKey: todayKey() } });
    return true;
  };


  const toggleDate = (habitId, dateKey) => {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const targetDate = new Date(dateKey + 'T12:00:00'); // Evitar problemas de huso horario
    const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    if (!isScheduledDay(habit, targetDate)) {
      const targetDayName = dayLabels[targetDate.getDay()];
      Alert.alert(
        'Hábito no programado',
        `Este hábito no está programado para este día (${targetDayName}).`
      );
      return;
    }

    const isTargetToday = dateKey === todayKey();
    if (isTargetToday) {
      const today = new Date();
      if (!isWithinExecutionWindow(habit, today)) {
        const { startHour, startMinute, endHour, endMinute } = habit.executionTime;
        const pad = (n) => String(n).padStart(2, '0');
        Alert.alert(
          'Fuera de horario',
          `Este hábito solo se puede completar entre las ${pad(startHour)}:${pad(startMinute)} y las ${pad(endHour)}:${pad(endMinute)} (Hora detectada en el dispositivo: ${pad(today.getHours())}:${pad(today.getMinutes())}).`
        );
        return;
      }
    }

    dispatch({ type: 'TOGGLE_COMPLETION', payload: { habitId, dateKey } });
  };

  return (
    <HabitContext.Provider
      value={{
        habits: state.habits,
        loaded: state.loaded,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleToday,
        toggleDate,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits debe usarse dentro de <HabitProvider>');
  return ctx;
}
