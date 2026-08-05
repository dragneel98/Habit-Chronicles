// Detalle de un hábito: calendario de completions, racha actual,
// mejor racha, % de cumplimiento y acceso a edición.
// ============================================================
import { useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { useHabits } from '../context/HabitContext';
import Calendar from '../components/Calendar';
import ProgressBar from '../components/ProgressBar';
import { calculateStreaks, completionRate } from '../utils/streaks';

export default function HabitDetailScreen({ route, navigation }) {
  const { habitId } = route.params;
  const { habits, toggleDate } = useHabits();
  const habit = habits.find((h) => h.id === habitId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: habit?.name || 'Habit',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('CreateHabit', { habit })}>
          <Text style={{ color: COLORS.primary, fontWeight: FONT_WEIGHTS.semibold, marginRight: SPACING.md }}>
            Edit
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, habit]);

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text>This habit no longer exists.</Text>
      </View>
    );
  }

  const { current, best } = calculateStreaks(habit);
  const rate30 = completionRate(habit, 30);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{current}</Text>
          <Text style={styles.statLabel}>Current streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{best}</Text>
          <Text style={styles.statLabel}>Best streak</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rateHeader}>
          <Text style={styles.rateLabel}>Completion (last 30 days)</Text>
          <Text style={styles.ratePercent}>{rate30}%</Text>
        </View>
        <ProgressBar percent={rate30} color={habit.color} />
      </View>

      <View style={styles.card}>
        <Calendar habit={habit} onToggleDate={(dateKey) => toggleDate(habit.id, dateKey)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: COLORS.primaryBorder,
    ...SHADOW.card,
  },
  statEmoji: { fontSize: FONT_SIZES.xl, marginBottom: 4 },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.retro.buttonGreen },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.primaryLight, marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.primaryBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: COLORS.primaryBorder,
    ...SHADOW.card,
  },
  rateHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  rateLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratePercent: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.retro.buttonGreen },
});
