import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { HabitProvider, useHabits } from '../HabitContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../utils/notifications', () => ({
  scheduleHabitReminder: jest.fn().mockResolvedValue(['notif-id-1']),
  cancelHabitReminder: jest.fn().mockResolvedValue(true),
}));

describe('HabitContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }) => <HabitProvider>{children}</HabitProvider>;

  test('inicializa con la lista de hábitos vacía', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.habits).toEqual([]);
  });

  test('addHabit agrega un nuevo hábito a la lista', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addHabit({
        name: 'Leer 30 minutos',
        icon: '📚',
        color: '#00CEC9',
        attribute: 'inteligencia',
        frequency: { type: 'daily' },
      });
    });

    expect(result.current.habits.length).toBe(1);
    expect(result.current.habits[0].name).toBe('Leer 30 minutos');
    expect(result.current.habits[0].attribute).toBe('inteligencia');
  });

  test('updateHabit actualiza los datos de un hábito existente', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addHabit({
        name: 'Correr',
        frequency: { type: 'daily' },
      });
    });

    const created = result.current.habits[0];

    act(() => {
      result.current.updateHabit({
        ...created,
        name: 'Correr 5km',
      });
    });

    expect(result.current.habits[0].name).toBe('Correr 5km');
  });

  test('deleteHabit remueve un hábito de la lista', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addHabit({
        name: 'Meditar',
        frequency: { type: 'daily' },
      });
    });

    const habitId = result.current.habits[0].id;

    act(() => {
      result.current.deleteHabit(habitId);
    });

    expect(result.current.habits.length).toBe(0);
  });

  test('toggleToday marca y desmarca la completitud de hoy', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addHabit({
        name: 'Estudiar Jest',
        frequency: { type: 'daily' },
      });
    });

    const habitId = result.current.habits[0].id;

    let success;
    act(() => {
      success = result.current.toggleToday(habitId);
    });

    expect(success).toBe(true);
    expect(Object.keys(result.current.habits[0].completions).length).toBe(1);

    // Volver a presionar para desmarcar
    act(() => {
      result.current.toggleToday(habitId);
    });

    expect(Object.keys(result.current.habits[0].completions).length).toBe(0);
  });

  test('toggleToday muestra alerta si no es un día programado', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useHabits(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    // Supongamos hoy es un día no incluido en [99] (días 0-6)
    act(() => {
      result.current.addHabit({
        name: 'Ir al gimnasio',
        frequency: { type: 'weekly', days: [] }, // Ningún día programado
      });
    });

    const habitId = result.current.habits[0].id;

    let success;
    act(() => {
      success = result.current.toggleToday(habitId);
    });

    expect(success).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith(
      'Hábito no programado',
      expect.stringContaining('Este hábito no está programado')
    );

    alertSpy.mockRestore();
  });
});
