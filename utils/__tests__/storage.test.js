import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadHabits, saveHabits } from '../storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('utils/storage.js', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('loadHabits retorna un array vacío si no hay datos guardados', async () => {
    const habits = await loadHabits();
    expect(habits).toEqual([]);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@habit_tracker/habits');
  });

  test('saveHabits guarda los hábitos correctamente y loadHabits los recupera', async () => {
    const sampleHabits = [
      { id: '1', title: 'Hacer ejercicio', frequency: { type: 'daily' } },
      { id: '2', title: 'Leer libro', frequency: { type: 'daily' } },
    ];

    await saveHabits(sampleHabits);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@habit_tracker/habits',
      JSON.stringify(sampleHabits)
    );

    const loaded = await loadHabits();
    expect(loaded).toEqual(sampleHabits);
  });

  test('loadHabits maneja errores y retorna un array vacío', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage failure'));
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const habits = await loadHabits();
    expect(habits).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Error cargando hábitos', expect.any(Error));

    consoleWarnSpy.mockRestore();
  });
});
