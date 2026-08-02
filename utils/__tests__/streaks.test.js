import { calculateStreaks, isScheduledDay, completionRate } from '../streaks';
import { toKey, addDays } from '../dates';

describe('utils/streaks.js', () => {
  describe('isScheduledDay', () => {
    test('debe retornar true si el hábito es diario', () => {
      const habit = { frequency: { type: 'daily' } };
      expect(isScheduledDay(habit, new Date())).toBe(true);
    });

    test('debe retornar true/false segun los días de la semana especificados', () => {
      // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
      const habit = { frequency: { type: 'weekly', days: [1, 3, 5] } };
      
      // Creamos fechas específicas
      const monday = new Date(2026, 7, 3); // 3 de Agosto 2026 = Lunes (Day 1)
      const tuesday = new Date(2026, 7, 4); // 4 de Agosto 2026 = Martes (Day 2)

      expect(isScheduledDay(habit, monday)).toBe(true);
      expect(isScheduledDay(habit, tuesday)).toBe(false);
    });
  });

  describe('calculateStreaks', () => {
    test('racha en 0 para hábito recién creado sin completar', () => {
      const habit = {
        frequency: { type: 'daily' },
        completions: {},
      };

      const { current, best } = calculateStreaks(habit);
      expect(current).toBe(0);
      expect(best).toBe(0);
    });

    test('racha se calcula bien con hábito diario', () => {
      const today = new Date();
      const yesterday = addDays(today, -1);
      const twoDaysAgo = addDays(today, -2);

      const habit = {
        frequency: { type: 'daily' },
        completions: {
          [toKey(today)]: true,
          [toKey(yesterday)]: true,
          [toKey(twoDaysAgo)]: true,
        },
      };

      const { current, best } = calculateStreaks(habit);
      expect(current).toBe(3);
      expect(best).toBe(3);
    });

    test('racha se calcula bien con días específicos (ej: solo Lunes/Miércoles/Viernes)', () => {
      // Lunes 3 de Agosto 2026
      const monday = new Date(2026, 7, 3); 
      // Viernes previo (31 de Julio 2026)
      const prevFriday = new Date(2026, 6, 31);
      // Miércoles previo (29 de Julio 2026)
      const prevWednesday = new Date(2026, 6, 29);

      // Mockeamos la fecha del test o pasamos hábitos con completions en esos días
      const habit = {
        frequency: { type: 'weekly', days: [1, 3, 5] },
        completions: {
          [toKey(monday)]: true,
          [toKey(prevFriday)]: true,
          [toKey(prevWednesday)]: true,
        },
      };

      // Si nos posicionamos en monday (Lunes)
      jest.useFakeTimers().setSystemTime(monday);

      const { current, best } = calculateStreaks(habit);
      expect(current).toBe(3);
      expect(best).toBe(3);

      jest.useRealTimers();
    });

    test('racha se rompe si falta un día programado', () => {
      const today = new Date(2026, 7, 3); // Lunes (programado)
      const yesterday = new Date(2026, 7, 2); // Domingo (programado en daily)

      const habit = {
        frequency: { type: 'daily' },
        completions: {
          [toKey(today)]: true,
          // yesterday NO está completado
        },
      };

      jest.useFakeTimers().setSystemTime(today);

      const { current, best } = calculateStreaks(habit);
      expect(current).toBe(1); // Sólo hoy
      expect(best).toBe(1);

      jest.useRealTimers();
    });

    test('racha correcta si el usuario completa hoy pero no ayer (día no programado)', () => {
      // Supongamos hábito solo Lunes (1) y Miércoles (3)
      // Hoy = Miércoles 5 de Agosto 2026
      const wednesday = new Date(2026, 7, 5);
      // Lunes = 3 de Agosto 2026
      const monday = new Date(2026, 7, 3);
      // Martes = 4 de Agosto (día NO programado, no completado)

      const habit = {
        frequency: { type: 'weekly', days: [1, 3] },
        completions: {
          [toKey(wednesday)]: true,
          [toKey(monday)]: true,
        },
      };

      jest.useFakeTimers().setSystemTime(wednesday);

      const { current, best } = calculateStreaks(habit);
      expect(current).toBe(2); // Martes fue ignorado porque no era día programado
      expect(best).toBe(2);

      jest.useRealTimers();
    });
  });

  describe('completionRate', () => {
    test('calcula el porcentaje de completitud en los últimos días', () => {
      const today = new Date();
      const habit = {
        frequency: { type: 'daily' },
        completions: {
          [toKey(today)]: true,
        },
      };

      const rate = completionRate(habit, 10);
      expect(rate).toBe(10); // 1 de 10 días = 10%
    });
  });
});
