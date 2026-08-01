// Barra de progreso horizontal simple, usada en Estadísticas.
// ============================================================
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

export default function ProgressBar({ percent = 0, color = COLORS.primary, height = 8 }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});
