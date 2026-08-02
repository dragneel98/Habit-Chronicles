// Overlay de pantalla completa para "¡Subiste de nivel!".
// Fondo se oscurece -> banner pixel entra con rebote -> rayos
// de luz rotan detrás -> se cierra al tocar o solo tras unos seg.
// ============================================================
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LevelUpOverlay({
  attribute = 'Fuerza',
  newLevel = 2,
  icon = '💪',
  color = '#ffb020',
  onClose,
}) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;
  const bannerY = useRef(new Animated.Value(30)).current;
  const rayRotate = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fondo oscuro entra
    Animated.timing(bgOpacity, {
      toValue: 0.85,
      duration: 220,
      useNativeDriver: true,
    }).start();

    // Rayos girando en loop continuo detrás del banner
    Animated.loop(
      Animated.timing(rayRotate, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Banner entra con rebote pixel-RPG
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(bannerScale, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
        Animated.timing(bannerY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulso del ícono, en loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.15,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-cierre a los 2.6s (opcional, también se puede tocar para cerrar antes)
    const timer = setTimeout(() => handleClose(), 2600);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bannerScale, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose && onClose());
  };

  const rotateDeg = rayRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableWithoutFeedback onPress={handleClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[styles.bg, { opacity: bgOpacity }]}
          pointerEvents="none"
        />

        <View style={styles.center} pointerEvents="none">
          {/* Rayos de luz rotando */}
          <Animated.View
            style={[
              styles.rays,
              { borderColor: color, transform: [{ rotate: rotateDeg }] },
            ]}
          />

          {/* Banner principal */}
          <Animated.View
            style={[
              styles.banner,
              {
                transform: [{ scale: bannerScale }, { translateY: bannerY }],
              },
            ]}
          >
            <Text style={styles.levelUpLabel}>¡NIVEL SUPERIOR!</Text>

            <Animated.Text
              style={[styles.icon, { transform: [{ scale: iconPulse }] }]}
            >
              {icon}
            </Animated.Text>

            <Text style={[styles.attrName, { color }]}>{attribute}</Text>
            <Text style={styles.levelText}>Nivel {newLevel}</Text>

            <Text style={styles.hint}>toca para continuar</Text>
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  bg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rays: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: 0,
    borderWidth: 3,
    borderStyle: 'dashed',
    opacity: 0.35,
  },
  banner: {
    backgroundColor: '#1a1030',
    borderWidth: 4,
    borderTopColor: '#5a4a8a',
    borderLeftColor: '#5a4a8a',
    borderBottomColor: '#0d0820',
    borderRightColor: '#0d0820',
    borderRadius: 0, // pixel-square, sin curvas
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: 'center',
    minWidth: width * 0.7,
  },
  levelUpLabel: {
    color: '#ffd75e',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 10,
  },
  attrName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  levelText: {
    color: '#fff',
    fontSize: 15,
    marginTop: 4,
  },
  hint: {
    color: '#8a7fae',
    fontSize: 11,
    marginTop: 18,
  },
});