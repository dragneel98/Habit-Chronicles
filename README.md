# Gestor de Hábitos

App de React Native (Expo) para crear y trackear hábitos, con calendario,
rachas, recordatorios y estadísticas.

## Cómo correrla

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar Expo:
   ```bash
   npm start
   ```
3. Escanear el código QR con la app **Expo Go** (Android/iOS), o presionar
   `a` / `i` para abrir en emulador Android/iOS.

## Personalizar colores y tipografía

centralizado en `constants/theme.js`:

- `COLORS` → paleta general de la app + paleta de colores para hábitos
- `FONT_SIZES` / `FONT_WEIGHTS` → escala tipográfica
- `SPACING` → espaciados consistentes (xs, sm, md, lg, xl, xxl)
- `RADIUS` → bordes redondeados
- `HABIT_ICONS` → emojis disponibles al crear un hábito
- `WEEK_DAYS` → etiquetas de días para hábitos con frecuencia semanal

Cambiando estos valores, se actualiza toda la app 

## que incluye esta app

- ✅ Crear hábitos con nombre, icono, color y frecuencia (diaria o días
  específicos de la semana)
- ✅ Marcar el hábito como completado cada día desde la pantalla principal
- ✅ Calendario mensual por hábito (tocando un día se alterna su estado,
  útil para cargar historial pasado)
- ✅ Cálculo de racha actual y mejor racha histórica
- ✅ Recordatorios diarios con notificaciones locales (expo-notifications)
- ✅ Pantalla de estadísticas con resumen general y % de cumplimiento por
  hábito (últimos 30 días)
- ✅ Edición y eliminación de hábitos


