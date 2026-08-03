import { renderHook, act, waitFor } from '@testing-library/react-native';
import { RpgProvider, useRpg } from '../RpgContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('RpgContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }) => <RpgProvider>{children}</RpgProvider>;

  test('inicializa con el estado por defecto', async () => {
    const { result } = renderHook(() => useRpg(), { wrapper });

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.rpgData.stats.fuerza).toEqual({
      level: 1,
      xp: 0,
      maxXp: 100,
    });
  });

  test('sumar XP sin cruzar maxXp → no cambia level', async () => {
    const { result } = renderHook(() => useRpg(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addXp('fuerza', 50);
    });

    expect(result.current.rpgData.stats.fuerza.level).toBe(1);
    expect(result.current.rpgData.stats.fuerza.xp).toBe(50);
    expect(result.current.levelUpEvent).toBeNull();
  });

  test('sumar XP que cruza maxXp exacto → sube 1 nivel, xp vuelve a 0 y aumenta maxXp', async () => {
    const { result } = renderHook(() => useRpg(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addXp('fuerza', 100);
    });

    // maxXp inicial es 100 -> al sumar 100 pasa a nivel 2, xp = 0, nuevo maxXp = round(100 * 1.25) = 125
    expect(result.current.rpgData.stats.fuerza.level).toBe(2);
    expect(result.current.rpgData.stats.fuerza.xp).toBe(0);
    expect(result.current.rpgData.stats.fuerza.maxXp).toBe(125);
  });

  test('sumar XP muy grande → sube más de 1 nivel en una sola llamada', async () => {
    const { result } = renderHook(() => useRpg(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    // Nivel 1: 0..100 (maxXp 100)
    // Nivel 2: 100..225 (maxXp 125)
    // Nivel 3: 225..381 (maxXp 156)
    // Al sumar 300 XP:
    // Nivel 1 -> 300 - 100 = 200, Nivel 2 (maxXp 125)
    // Nivel 2 -> 200 - 125 = 75, Nivel 3 (maxXp round(125*1.25) = 156)
    // Resultado: Nivel 3, xp 75
    act(() => {
      result.current.addXp('fuerza', 300);
    });

    expect(result.current.rpgData.stats.fuerza.level).toBe(3);
    expect(result.current.rpgData.stats.fuerza.xp).toBe(75);
    expect(result.current.rpgData.stats.fuerza.maxXp).toBe(156);
  });

  test('removeXp no baja de nivel 1 ni deja xp negativo', async () => {
    const { result } = renderHook(() => useRpg(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    // Restar en nivel 1 con 0 xp
    act(() => {
      result.current.removeXp('fuerza', 50);
    });

    expect(result.current.rpgData.stats.fuerza.level).toBe(1);
    expect(result.current.rpgData.stats.fuerza.xp).toBe(0);

    // Subir a nivel 2 y luego restar mucho
    act(() => {
      result.current.addXp('fuerza', 120); // Nivel 2, xp 20, maxXp 125
    });

    expect(result.current.rpgData.stats.fuerza.level).toBe(2);

    act(() => {
      result.current.removeXp('fuerza', 500); // Intenta bajar por debajo de nivel 1
    });

    expect(result.current.rpgData.stats.fuerza.level).toBe(1);
    expect(result.current.rpgData.stats.fuerza.xp).toBe(0);
  });

  test('addXp con attributeKey inválido no rompe nada (return temprano)', async () => {
    const { result } = renderHook(() => useRpg(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    const initialStats = { ...result.current.rpgData.stats };

    act(() => {
      result.current.addXp('invalido_attr', 100);
      result.current.addXp(null, 100);
      result.current.addXp(undefined, 100);
    });

    expect(result.current.rpgData.stats).toEqual(initialStats);
  });

  test('Level-up encola evento en levelUpQueue; dismissLevelUp saca el primero y expone el siguiente', async () => {
    const { result } = renderHook(() => useRpg(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    // Hacemos level up en fuerza e inteligencia casi juntos
    act(() => {
      result.current.addXp('fuerza', 100);
      result.current.addXp('inteligencia', 100);
    });

    // El primer evento expuesto debe ser fuerza
    expect(result.current.levelUpEvent).toEqual({
      attribute: 'Fuerza',
      newLevel: 2,
      icon: '💪',
      color: '#FF9F43',
    });

    // Descartamos el primer evento
    act(() => {
      result.current.dismissLevelUp();
    });

    // El segundo evento expuesto debe ser inteligencia
    expect(result.current.levelUpEvent).toEqual({
      attribute: 'Inteligencia',
      newLevel: 2,
      icon: '🧠',
      color: '#00CEC9',
    });

    // Descartamos el segundo evento
    act(() => {
      result.current.dismissLevelUp();
    });

    // Ya no debe haber eventos
    expect(result.current.levelUpEvent).toBeNull();
  });
});
