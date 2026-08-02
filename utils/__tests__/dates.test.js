import { todayKey, toKey, addDays, isSameDay, isWithinExecutionWindow } from '../dates';

describe('utils/dates.js', () => {
  describe('todayKey', () => {
    test('genera el mismo string todo el día y cambia al otro día', () => {
      const morning = new Date(2026, 7, 2, 8, 30, 0);
      const evening = new Date(2026, 7, 2, 23, 45, 0);
      const nextDay = new Date(2026, 7, 3, 0, 1, 0);

      jest.useFakeTimers().setSystemTime(morning);
      const keyMorning = todayKey();

      jest.setSystemTime(evening);
      const keyEvening = todayKey();

      expect(keyMorning).toBe(keyEvening);
      expect(keyMorning).toBe('2026-08-02');

      jest.setSystemTime(nextDay);
      const keyNextDay = todayKey();

      expect(keyNextDay).not.toBe(keyMorning);
      expect(keyNextDay).toBe('2026-08-03');

      jest.useRealTimers();
    });
  });

  describe('isWithinExecutionWindow', () => {
    test('retorna true si la ventana de ejecucion no esta habilitada', () => {
      const habitWithoutWindow = { executionTime: { enabled: false } };
      expect(isWithinExecutionWindow(habitWithoutWindow)).toBe(true);
    });

    test('funciona con ventana normal (ej: 08:00–10:00)', () => {
      const habit = {
        executionTime: {
          enabled: true,
          startHour: 8,
          startMinute: 0,
          endHour: 10,
          endMinute: 0,
        },
      };

      const insideTime = new Date(2026, 7, 2, 9, 30);
      const beforeTime = new Date(2026, 7, 2, 7, 59);
      const afterTime = new Date(2026, 7, 2, 10, 1);

      expect(isWithinExecutionWindow(habit, insideTime)).toBe(true);
      expect(isWithinExecutionWindow(habit, beforeTime)).toBe(false);
      expect(isWithinExecutionWindow(habit, afterTime)).toBe(false);
    });

    test('funciona con ventana que cruza medianoche (ej: 22:00–02:00)', () => {
      const habit = {
        executionTime: {
          enabled: true,
          startHour: 22,
          startMinute: 0,
          endHour: 2,
          endMinute: 0,
        },
      };

      const nightTime = new Date(2026, 7, 2, 23, 15); // 23:15 -> dentro
      const earlyMorningTime = new Date(2026, 7, 3, 1, 30); // 01:30 -> dentro
      const afternoonTime = new Date(2026, 7, 2, 15, 0); // 15:00 -> fuera

      expect(isWithinExecutionWindow(habit, nightTime)).toBe(true);
      expect(isWithinExecutionWindow(habit, earlyMorningTime)).toBe(true);
      expect(isWithinExecutionWindow(habit, afternoonTime)).toBe(false);
    });
  });

  describe('addDays y isSameDay', () => {
    test('addDays agrega o resta días correctamente', () => {
      const date = new Date(2026, 7, 1);
      const future = addDays(date, 5);
      const past = addDays(date, -3);

      expect(toKey(future)).toBe('2026-08-06');
      expect(toKey(past)).toBe('2026-07-29');
    });

    test('isSameDay compara la misma fecha independientemente de la hora', () => {
      const a = new Date(2026, 7, 2, 10, 0);
      const b = new Date(2026, 7, 2, 20, 30);
      const c = new Date(2026, 7, 3, 10, 0);

      expect(isSameDay(a, b)).toBe(true);
      expect(isSameDay(a, c)).toBe(false);
    });
  });
});
