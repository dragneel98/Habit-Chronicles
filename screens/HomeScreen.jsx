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
          <Text style={styles.title}>My habits</Text>
          <Text style={styles.subtitle}>
            {habits.length === 0 ? 'You have not created any habits yet' : `${habits.length} active habits`}
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
                <Text style={styles.emptyText}>Create your first habit by tapping the + button</Text>
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

      {/* animacion */}
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
    backgroundColor: '#5c3417',
    padding: 0,
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
  title: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.warning,
    fontFamily: 'PressStart2P'

  },
  subtitle: {
    ontSize: FONT_SIZES.sm,
    color: COLORS.textOnPrimary,
    fontFamily: 'PressStart2P',
    marginTop: 2
  },
  empty: {
    alignItems: 'center',
    marginTop: SPACING.xxl
  },

  emptyEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md, textAlign: 'center' },

  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.sm,
    width: 58,
    height: 58,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.floating,
  },
  fabText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xxxl,
    fontFamily: "PressStart2P",
  },
});
