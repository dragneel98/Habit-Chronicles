// Formulario para crear (o editar) un hábito: nombre, icono,
// color, frecuencia (diario / días específicos) y recordatorio.
// ============================================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, HABIT_ICONS, WEEK_DAYS,
} from '../constants/theme';
import { useHabits } from '../context/HabitContext';
import { RPG_ATTRIBUTES } from '../context/RpgContext';
import { requestNotificationPermission } from '../utils/notifications';

export default function CreateHabitScreen({ navigation, route }) {
  const { addHabit, updateHabit, deleteHabit } = useHabits();
  const editingHabit = route.params?.habit;

  const [name, setName] = useState(editingHabit?.name || '');
  const [icon, setIcon] = useState(editingHabit?.icon || HABIT_ICONS[0]);
  const [color, setColor] = useState(editingHabit?.color || COLORS.habitPalette[0]);
  const [attribute, setAttribute] = useState(editingHabit?.attribute || 'fuerza');
  const [xpReward, setXpReward] = useState(editingHabit?.xpReward || 10);
  const [freqType, setFreqType] = useState(editingHabit?.frequency?.type || 'daily');

  const [days, setDays] = useState(editingHabit?.frequency?.days || [1, 2, 3, 4, 5]);

  // Horario de ejecución
  const [execTimeEnabled, setExecTimeEnabled] = useState(editingHabit?.executionTime?.enabled || false);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    if (editingHabit?.executionTime?.enabled) {
      d.setHours(editingHabit.executionTime.startHour, editingHabit.executionTime.startMinute, 0, 0);
    } else {
      d.setHours(9, 0, 0, 0);
    }
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    if (editingHabit?.executionTime?.enabled) {
      d.setHours(editingHabit.executionTime.endHour, editingHabit.executionTime.endMinute, 0, 0);
    } else {
      d.setHours(18, 0, 0, 0);
    }
    return d;
  });

  // Recordatorios
  const [reminderEnabled, setReminderEnabled] = useState(editingHabit?.reminder?.enabled || false);
  const [customReminderEnabled, setCustomReminderEnabled] = useState(
    editingHabit?.reminder?.enabled && editingHabit?.reminder?.useCustomTime ? true : false
  );
  const [reminderTime, setReminderTime] = useState(() => {
    const d = new Date();
    if (editingHabit?.reminder?.enabled && editingHabit?.reminder?.useCustomTime) {
      d.setHours(editingHabit.reminder.hour, editingHabit.reminder.minute, 0, 0);
    } else {
      d.setHours(9, 0, 0, 0);
    }
    return d;
  });

  const [pickerType, setPickerType] = useState(null); // null | 'start' | 'end' | 'reminder'

  const toggleDay = (dayKey) => {
    setDays((prev) => (prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]));
  };

  const handleReminderToggle = async () => {
    if (!reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permiso necesario', 'Activá las notificaciones para recibir recordatorios.');
        return;
      }
    }
    setReminderEnabled((prev) => !prev);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Ponele un nombre a tu hábito.');
      return;
    }

    if (freqType === 'weekly' && days.length === 0) {
      Alert.alert('Frecuencia incorrecta', 'Seleccioná al menos un día de la semana.');
      return;
    }

    const habitData = {
      name: name.trim(),
      icon,
      color,
      attribute,
      xpReward: Number(xpReward) || 10,
      frequency: freqType === 'daily' ? { type: 'daily' } : { type: 'weekly', days },

      executionTime: {
        enabled: execTimeEnabled,
        startHour: startTime.getHours(),
        startMinute: startTime.getMinutes(),
        endHour: endTime.getHours(),
        endMinute: endTime.getMinutes(),
      },
      reminder: {
        enabled: reminderEnabled,
        useCustomTime: customReminderEnabled,
        hour: customReminderEnabled
          ? reminderTime.getHours()
          : (execTimeEnabled ? startTime.getHours() : 9),
        minute: customReminderEnabled
          ? reminderTime.getMinutes()
          : (execTimeEnabled ? startTime.getMinutes() : 0),
      },
    };

    if (editingHabit) {
      updateHabit({ ...editingHabit, ...habitData });
    } else {
      addHabit(habitData);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar hábito', '¿Seguro que querés eliminar este hábito y todo su historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteHabit(editingHabit.id);
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
      <Text style={styles.label}>Nombre del hábito</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Tomar agua"
        placeholderTextColor={COLORS.textLight}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Icono</Text>
      <View style={styles.wrapRow}>
        {HABIT_ICONS.map((ic) => (
          <TouchableOpacity
            key={ic}
            style={[styles.iconOption, icon === ic && styles.iconOptionSelected]}
            onPress={() => setIcon(ic)}
          >
            <Text style={styles.iconOptionText}>{ic}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.wrapRow}>
        {COLORS.habitPalette.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <Text style={styles.label}>Atributo RPG a potenciar</Text>
      <View style={styles.wrapRow}>
        {Object.keys(RPG_ATTRIBUTES).map((key) => {
          const attr = RPG_ATTRIBUTES[key];
          const isSelected = attribute === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.rpgChip,
                isSelected && { backgroundColor: attr.color + '25', borderColor: attr.color, borderWidth: 2 },
              ]}
              onPress={() => setAttribute(key)}
            >
              <Text style={styles.rpgChipText}>
                {attr.icon} {attr.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Puntos de XP al completar</Text>
      <View style={styles.wrapRow}>
        {[5, 10, 15, 20].map((pts) => (
          <TouchableOpacity
            key={pts}
            style={[
              styles.xpChip,
              xpReward === pts && styles.xpChipSelected,
            ]}
            onPress={() => setXpReward(pts)}
          >
            <Text style={[styles.xpChipText, xpReward === pts && styles.xpChipTextSelected]}>
              +{pts} XP
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      <Text style={styles.label}>Frecuencia</Text>
      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, freqType === 'daily' && styles.segmentBtnActive]}
          onPress={() => setFreqType('daily')}
        >
          <Text style={[styles.segmentText, freqType === 'daily' && styles.segmentTextActive]}>Todos los días</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, freqType === 'weekly' && styles.segmentBtnActive]}
          onPress={() => setFreqType('weekly')}
        >
          <Text style={[styles.segmentText, freqType === 'weekly' && styles.segmentTextActive]}>Días específicos</Text>
        </TouchableOpacity>
      </View>

      {freqType === 'weekly' && (
        <View style={styles.wrapRow}>
          {WEEK_DAYS.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[styles.dayOption, days.includes(d.key) && { backgroundColor: color }]}
              onPress={() => toggleDay(d.key)}
            >
              <Text style={[styles.dayOptionText, days.includes(d.key) && { color: COLORS.white }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Restringir horario de ejecución</Text>
        <TouchableOpacity
          style={[styles.toggle, execTimeEnabled && { backgroundColor: color }]}
          onPress={() => setExecTimeEnabled((prev) => !prev)}
        >
          <View style={[styles.toggleKnob, execTimeEnabled && styles.toggleKnobActive]} />
        </TouchableOpacity>
      </View>

      {execTimeEnabled && (
        <View style={styles.timeRangeRow}>
          <TouchableOpacity
            style={[styles.timeBox, { flex: 1, marginTop: 0 }]}
            onPress={() => setPickerType('start')}
          >
            <Text style={styles.timeLabel}>Desde</Text>
            <Text style={styles.timeText}>
              🕒 {startTime.getHours().toString().padStart(2, '0')}:{startTime.getMinutes().toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeBox, { flex: 1, marginTop: 0 }]}
            onPress={() => setPickerType('end')}
          >
            <Text style={styles.timeLabel}>Hasta</Text>
            <Text style={styles.timeText}>
              🕒 {endTime.getHours().toString().padStart(2, '0')}:{endTime.getMinutes().toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Recordatorios</Text>
        <TouchableOpacity
          style={[styles.toggle, reminderEnabled && { backgroundColor: color }]}
          onPress={handleReminderToggle}
        >
          <View style={[styles.toggleKnob, reminderEnabled && styles.toggleKnobActive]} />
        </TouchableOpacity>
      </View>

      {reminderEnabled && (
        <View style={{ marginTop: SPACING.xs }}>
          <View style={[styles.switchRow, { marginTop: 0, marginBottom: SPACING.sm }]}>
            <Text style={styles.subLabel}>Horario de recordatorio personalizado</Text>
            <TouchableOpacity
              style={[styles.toggleSmall, customReminderEnabled && { backgroundColor: color }]}
              onPress={() => setCustomReminderEnabled((prev) => !prev)}
            >
              <View style={[styles.toggleKnobSmall, customReminderEnabled && styles.toggleKnobSmallActive]} />
            </TouchableOpacity>
          </View>

          {customReminderEnabled ? (
            <TouchableOpacity style={[styles.timeBox, { marginTop: 0 }]} onPress={() => setPickerType('reminder')}>
              <Text style={styles.timeText}>
                🔔 {reminderTime.getHours().toString().padStart(2, '0')}:{reminderTime.getMinutes().toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {execTimeEnabled
                  ? `🔔 Al inicio de la ejecución (${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')})`
                  : '🔔 A las 09:00 por defecto'}
              </Text>
            </View>
          )}
        </View>
      )}

      {pickerType !== null && (
        <DateTimePicker
          value={
            pickerType === 'start'
              ? startTime
              : pickerType === 'end'
                ? endTime
                : reminderTime
          }
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onValueChange={(event, selected) => {
            if (selected) {
              if (pickerType === 'start') setStartTime(selected);
              else if (pickerType === 'end') setEndTime(selected);
              else if (pickerType === 'reminder') setReminderTime(selected);
            }
            if (Platform.OS !== 'ios') {
              setPickerType(null);
            }
          }}
          onDismiss={() => {
            setPickerType(null);
          }}
        />
      )}

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{editingHabit ? 'Guardar cambios' : 'Crear hábito'}</Text>
      </TouchableOpacity>

      {editingHabit && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Eliminar hábito</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconOptionSelected: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: COLORS.surfaceAlt },
  iconOptionText: { fontSize: FONT_SIZES.xl },
  colorDot: { width: 36, height: 36, borderRadius: RADIUS.full },
  colorDotSelected: { borderWidth: 3, borderColor: COLORS.text },
  segment: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: COLORS.primary },
  segmentText: { color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.sm },
  segmentTextActive: { color: COLORS.white },
  dayOption: {
    width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  dayOptionText: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  reminderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md,
  },
  toggle: {
    width: 50, height: 30, borderRadius: RADIUS.full, backgroundColor: COLORS.border, padding: 3, justifyContent: 'center',
  },
  toggleKnob: { width: 24, height: 24, borderRadius: RADIUS.full, backgroundColor: COLORS.white },
  toggleKnobActive: { transform: [{ translateX: 20 }] },
  timeBox: {
    marginTop: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  timeText: { fontSize: FONT_SIZES.lg, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold },
  saveBtn: {
    marginTop: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold },
  deleteBtn: { marginTop: SPACING.md, paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.xl },
  deleteBtnText: { color: COLORS.danger, fontWeight: FONT_WEIGHTS.semibold },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md,
  },
  timeRangeRow: {
    flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm,
  },
  timeLabel: {
    fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: 2, textTransform: 'uppercase', fontWeight: FONT_WEIGHTS.medium,
  },
  subLabel: {
    fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium,
  },
  toggleSmall: {
    width: 42, height: 24, borderRadius: RADIUS.full, backgroundColor: COLORS.border, padding: 2, justifyContent: 'center',
  },
  toggleKnobSmall: { width: 18, height: 18, borderRadius: RADIUS.full, backgroundColor: COLORS.white },
  toggleKnobSmallActive: { transform: [{ translateX: 18 }] },
  infoBox: {
    marginTop: SPACING.sm, backgroundColor: COLORS.surface, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center',
  },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium },
  rpgChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rpgChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  xpChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  xpChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  xpChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  xpChipTextSelected: {
    color: COLORS.white,
  },
});

