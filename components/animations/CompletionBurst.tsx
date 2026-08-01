// Overlay animado que aparece SOBRE una HabitCard al completarla:
// texto "+XP" flotando hacia arriba + mini destello de "pixeles"
// que se dispersan. Se auto-destruye al terminar (onDone).
// ============================================================
import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';

// Cantidad y dispersión de las "chispas" pixeladas
const SPARKS = [
  { angle: -60, distance: 26 },
  { angle: -20, distance: 32 },
  { angle: 20, distance: 32 },
  { angle: 60, distance: 26 },
  { angle: -90, distance: 20 },
  { angle: 90, distance: 20 },
];

interface CompletionBurstProps {
  xp: number;
  color?: string;
  onDone?: () => void;
}

export default function CompletionBurst({ xp, color = '#ffb020', onDone }:CompletionBurstProps) {
  const floatY = useRef(new Animated.Value(0)).current;
  const floatOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const sparkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // El texto "+XP" aparece con un pequeño "pop"
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 160,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(floatOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(sparkAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Luego flota hacia arriba y se desvanece
      Animated.parallel([
        Animated.timing(floatY, {
          toValue: -46,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatOpacity, {
          toValue: 0,
          duration: 450,
          delay: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onDone && onDone());
  }, []);

  return (
    <View style={styles.wrap} pointerEvents="none">
      {/* Chispas pixeladas que se disparan hacia afuera */}
      {SPARKS.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const tx = sparkAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(rad) * s.distance],
        });
        const ty = sparkAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(rad) * s.distance],
        });
        const op = sparkAnim.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 1, 0],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.spark,
              {
                backgroundColor: color,
                opacity: op,
                transform: [{ translateX: tx }, { translateY: ty }],
              },
            ]}
          />
        );
      })}

      {/* Texto "+XP" flotando */}
      <Animated.View
        style={[
          styles.xpTag,
          {
            opacity: floatOpacity,
            transform: [{ translateY: floatY }, { scale }],
          },
        ]}
      >
        <Text style={[styles.xpText, { color }]}>+{xp} XP</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ocupa todo el ancho de la card y centra su contenido,
  // así el "+XP" nunca se sale por el borde de la pantalla
  wrap: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  spark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -2,   // centra el spark de 4x4 en el punto medio del wrap
    marginLeft: -2,
    width: 4,
    height: 4,
  },
  xpTag: {
    // Ya NO es absolute: al ser hijo de flujo normal dentro de "wrap"
    // (que tiene alignItems/justifyContent: 'center'), queda centrado
    // automáticamente sin importar el ancho del texto ("+8 XP" vs "+20 XP")
    backgroundColor: '#1a1030',
    borderWidth: 2,
    borderColor: '#ffb020',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0, // pixel-square
  },
  xpText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});