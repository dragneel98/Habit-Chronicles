// Calendario mensual simple. Marca los días completados de un
// hábito y permite tocar un día para alternar su estado
// (útil para cargar completions pasadas).
// ============================================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS } from '../constants/theme';
import { getMonthMatrix, toKey, MONTH_NAMES } from '../utils/dates';
import { isScheduledDay } from '../utils/streaks';

export default function Calendar({ habit, onToggleDate }) {
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = getMonthMatrix(year, month);
  const completions = habit.completions || {};
  const today = toKey(new Date());

  const changeMonth = (delta) => {
    setCursor(new Date(year, month + delta, 1));
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={10}>
          <Text style={styles.nav}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTH_NAMES[month]} {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={10}>
          <Text style={styles.nav}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => (
          <Text key={i} style={styles.weekLabel}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, idx) => {
          if (!date) return <View key={idx} style={styles.cell} />;
          const key = toKey(date);
          const done = !!completions[key];
          const isToday = key === today;
          const isScheduled = isScheduledDay(habit, date);

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.cell,
                done && { backgroundColor: habit.color },
                isToday && !done && styles.todayOutline,
                !isScheduled && styles.cellDisabled,
              ]}
              disabled={!isScheduled}
              onPress={() => onToggleDate(key)}
            >
              <Text style={[styles.cellText, done && styles.cellTextDone]}>{date.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  nav: { fontSize: FONT_SIZES.xxl, color: COLORS.primary, paddingHorizontal: SPACING.md },
  monthLabel: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.text },
  weekRow: { flexDirection: 'row', marginBottom: SPACING.xs },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  todayOutline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  cellText: { color: COLORS.text, fontSize: FONT_SIZES.sm },
  cellTextDone: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  cellDisabled: { opacity: 0.18 },
});
