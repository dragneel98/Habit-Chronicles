// Estadísticas globales: resumen de todos los hábitos, mejor
// racha general y ranking de cumplimiento.
// ============================================================
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { useHabits } from '../context/HabitContext';
import { calculateStreaks, completionRate } from '../utils/streaks';
import ProgressBar from '../components/ProgressBar';
import { todayKey } from '../utils/dates';

export default function StatsScreen() {
  const { habits } = useHabits();

  const totalHabits = habits.length;
  const doneToday = habits.filter((h) => h.completions?.[todayKey()]).length;
  const bestStreakOverall = habits.reduce((max, h) => Math.max(max, calculateStreaks(h).best), 0);

  const ranked = [...habits]
    .map((h) => ({ habit: h, rate: completionRate(h, 30) }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
      <Text style={styles.title}>Statistics</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalHabits}</Text>
          <Text style={styles.summaryLabel}>Active habits</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{doneToday}/{totalHabits}</Text>
          <Text style={styles.summaryLabel}>Completed today</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{bestStreakOverall}</Text>
          <Text style={styles.summaryLabel}>Best streak</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Completion by habit (30 days)</Text>
      {ranked.length === 0 && (
        <Text style={styles.empty}>Create habits to see your stats here.</Text>
      )}
      {ranked.map(({ habit, rate }) => (
        <View key={habit.id} style={styles.habitRow}>
          <Text style={styles.habitIcon}>{habit.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.habitRowHeader}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitRate}>{rate}%</Text>
            </View>
            <ProgressBar percent={rate} color={habit.color} height={6} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    // backgroundColor: '#f1d5a3',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryDark,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: COLORS.primaryBackground,
    borderRadius: RADIUS.md,
    borderBottomWidth: 3,
    borderColor: COLORS.primaryBorder,
    ...SHADOW.card,
  },
  summaryValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.retro.buttonGreen,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primaryLight,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  empty: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    backgroundColor: COLORS.primaryBackground,
    borderRadius: RADIUS.md,
    borderBottomWidth: 3,
    borderColor: COLORS.primaryBorder,
    ...SHADOW.card,
  },
  habitIcon: {
    fontSize: FONT_SIZES.xl,
    width: 36,
    textAlign: 'center',
  },
  habitRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  habitName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primaryLight,
    flex: 1,
    marginRight: SPACING.sm,
  },
  habitRate: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.retro.buttonGreen,
  },
});
