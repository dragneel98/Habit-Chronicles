import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { useHabits } from '../context/HabitContext';
import { useRpg } from '../context/RpgContext';
import HabitCard from '../components/HabitCard';
import RpgHeaderCard from '../components/RpgHeaderCard';
import { todayKey } from '../utils/dates';
import LevelUpOverlay from '../components/animations/LevelUpAnimation';


export default function HomeScreen({ navigation }) {
  const { habits, toggleToday } = useHabits();
  const { addXp, removeXp, levelUpEvent, dismissLevelUp } = useRpg();

  const handleToggleHabit = (habit) => {
    const isDoneBefore = !!habit.completions?.[todayKey()];
    const toggled = toggleToday(habit.id);
    if (toggled !== false) {
      const attribute = habit.attribute || 'fuerza';
      const xp = habit.xpReward || 10;
      if (isDoneBefore) {
        removeXp(attribute, xp);
      } else {
        addXp(attribute, xp);
      }
    }
  };

  return (
    <View style={styles.container}>
      <RpgHeaderCard />

      {/* Título + lista de hábitos con padding propio */}
      <View style={styles.listWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mis hábitos </Text>
          <Text style={styles.subtitle}>
            {habits.length === 0 ? 'Todavía no creaste ningún hábito' : `${habits.length} hábito(s) activos`}
          </Text>
        </View>

        <View style={styles.frameInner}>
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            removeClippedSubviews={false}
            renderItem={({ item }) => (
              <HabitCard
                habit={item}
                onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
                onToggleToday={() => handleToggleHabit(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🌱</Text>
                <Text style={styles.emptyText}>Creá tu primer hábito tocando el botón +</Text>
              </View>
            }
          />
        </View>

      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHabit')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      {levelUpEvent && (
        <LevelUpOverlay
          attribute={levelUpEvent.attribute}
          newLevel={levelUpEvent.newLevel}
          icon={levelUpEvent.icon}
          color={levelUpEvent.color}
          onClose={dismissLevelUp}
        />
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 0,
    backgroundColor: '#5c3417'
  },
  listWrapper: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  frameInner: {
    // backgroundColor: '#8b5a2b', // marrón medio (madera)
    // borderWidth: 2,
    // borderTopColor: '#c78a4a',   // luz arriba-izquierda (bisel claro)
    // borderLeftColor: '#c78a4a',
    // borderBottomColor: '#5c3417', // sombra abajo-derecha (bisel oscuro)
    // borderRightColor: '#5c3417',
    // padding: SPACING.md,
    width: "100%"
  },
  list: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xs,
    paddingBottom: 160,
    width: "100%",
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: SPACING.xxl },

  emptyEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 58,
    height: 58,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.floating,
  },
  fabText: { color: COLORS.white, fontSize: FONT_SIZES.xxxl, marginTop: -2 },
});
