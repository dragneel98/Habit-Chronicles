// Tarjeta de hábito para la pantalla principal: nombre, icono,
// racha actual y checkbox para marcar el día de hoy.
// ============================================================
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { calculateStreaks, isScheduledDay } from '../utils/streaks';
import { todayKey, isWithinExecutionWindow } from '../utils/dates';
import { RPG_ATTRIBUTES } from '../context/RpgContext';
import backgroundImg from "../assets/avatars/fondo.jpg"
import CompletionBurst from './animations/CompletionBurst';

export default function HabitCard({ habit, onPress, onToggleToday }) {

  const [showBurst, setShowBurst] = useState(false);

  const { current } = calculateStreaks(habit);
  const doneToday = !!habit.completions?.[todayKey()];

  const attrInfo = habit.attribute ? RPG_ATTRIBUTES[habit.attribute.toLowerCase()] : RPG_ATTRIBUTES.fuerza;
  const xpPts = habit.xpReward || 10;

  const today = new Date();
  const isScheduledToday = isScheduledDay(habit, today);
  const isTimeValid = isWithinExecutionWindow(habit, today);
  const isLocked = !doneToday && (!isScheduledToday || !isTimeValid);

  // Formatear texto de días y horas
  const getDaysString = () => {
    if (!habit.frequency || habit.frequency.type === 'daily') return 'Todos los días';
    const dayLabels = {
      0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'
    };
    return habit.frequency.days.map(d => dayLabels[d]).join(', ');
  };

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = habit.executionTime?.enabled
    ? ` • 🕒 ${pad(habit.executionTime.startHour)}:${pad(habit.executionTime.startMinute)} - ${pad(habit.executionTime.endHour)}:${pad(habit.executionTime.endMinute)}`
    : '';
  const scheduleText = `${getDaysString()}${timeStr}`;

  // Determinar texto y color de estado
  let statusText = '✨ Disponible hoy';
  let statusColor = COLORS.success;

  if (doneToday) {
    statusText = '🎉 ¡Completado hoy!';
    statusColor = COLORS.primary;
  } else if (!isScheduledToday) {
    statusText = '🔒 No programado hoy';
    statusColor = COLORS.textSecondary;
  } else if (!isTimeValid) {
    statusText = '🔒 Fuera de horario';
    statusColor = COLORS.danger;
  }

  const handleToggle = () => {
    if (!doneToday) setShowBurst(true); // solo al completar, no al des-marcar
    onToggleToday();
  };

  return (
    <ImageBackground
      source={backgroundImg}
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}
    >
      {showBurst && (
        <CompletionBurst
          xp={xpPts}
          color={habit.color}
          onDone={() => setShowBurst(false)}
        />
      )}
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.iconWrap, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
            {attrInfo && (
              <View style={[styles.rpgBadge, { backgroundColor: attrInfo.color + '20' }]}>
                <Text style={[styles.rpgBadgeText, { color: attrInfo.color }]}>
                  {attrInfo.icon} +{xpPts} XP
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.streak}>🔥 {current} {current === 1 ? 'día' : 'días'} de racha</Text>
          <Text style={styles.schedule} numberOfLines={1}>{scheduleText}</Text>
          <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: isLocked ? COLORS.border : habit.color },
            doneToday && { backgroundColor: habit.color },
            isLocked && { backgroundColor: COLORS.background },
          ]}
          onPress={handleToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {doneToday && <Text style={styles.check}>✓</Text>}
          {!doneToday && isLocked && <Text style={styles.lock}>🔒</Text>}
        </TouchableOpacity>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    // position: 'relative',
    // backgroundColor: COLORS.surface,
    // borderRadius: RADIUS.md,
    padding: SPACING.md,
    // marginBottom: SPACING.sm,
    // marginTop: SPACING.sm,
    // margin: SPACING.md,
    ...SHADOW.card,
    alignSelf: 'stretch',
    width: "100%",
    // position: 'relative',
    // overflow: 'visible',
  },
  backgroundImage: {
    width: "100%",
    // position: 'relative',
    // overflow: 'visible',
  },
  imageStyle: {
    // resizeMode: 'contain',
    width: "100%"
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: { fontSize: FONT_SIZES.xl },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    flex: 1,
    marginRight: 6,
  },
  rpgBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  rpgBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  },

  streak: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  schedule: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  status: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  lock: { fontSize: 12 },
});

