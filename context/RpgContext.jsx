// Contexto para manejar el personaje RPG, avatares pixel y
// los 4 atributos principales: Fuerza, Inteligencia, Resistencia y Salud.
// Persiste los niveles y experiencia en AsyncStorage.
// Además: dispara automáticamente el overlay de "subida de nivel"
// cuando algún atributo cruza de nivel, sin que las pantallas que
// llaman a addXp tengan que preocuparse por eso.
// ============================================================
import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RPG_STORAGE_KEY = '@habit_tracker_rpg_stats_v1';

export const RPG_ATTRIBUTES = {
  fuerza: { key: 'fuerza', label: 'Fuerza', icon: '💪', color: '#FF9F43' },
  inteligencia: { key: 'inteligencia', label: 'Inteligencia', icon: '🧠', color: '#00CEC9' },
  resistencia: { key: 'resistencia', label: 'Resistencia', icon: '⚡', color: '#6C5CE7' },
  salud: { key: 'salud', label: 'Salud', icon: '❤️', color: '#FF7675' },
};

export const RPG_AVATARS = [
  { id: 'knight', name: 'Caballero', image: require('../assets/avatars/knight.png') },
  { id: 'mage', name: 'Mago', image: require('../assets/avatars/mage.png') },
  { id: 'healer', name: 'Sanador', image: require('../assets/avatars/healer.png') },
  { id: 'ranger', name: 'Explorador', image: require('../assets/avatars/ranger.png') },
];

const initialRpgState = {
  characterName: 'Héroe Pixel',
  characterClass: 'knight',
  stats: {
    fuerza: { level: 1, xp: 0, maxXp: 100 },
    inteligencia: { level: 1, xp: 0, maxXp: 100 },
    resistencia: { level: 1, xp: 0, maxXp: 100 },
    salud: { level: 1, xp: 0, maxXp: 100 },
  },
};

const RpgContext = createContext(null);

export function RpgProvider({ children }) {
  const [rpgData, setRpgData] = useState(initialRpgState);
  const [loaded, setLoaded] = useState(false);

  // Cola de eventos de "subida de nivel" pendientes de mostrar.
  // Es una cola (no un solo valor) por si dos atributos suben
  // de nivel casi al mismo tiempo: se muestran uno por uno.
  const [levelUpQueue, setLevelUpQueue] = useState([]);

  // Cargar estado inicial desde AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(RPG_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRpgData((prev) => ({
            ...prev,
            ...parsed,
            stats: {
              ...initialRpgState.stats,
              ...parsed.stats,
            },
          }));
        }
      } catch (e) {
        console.error('Error cargando estado RPG:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Guardar cada vez que cambie
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(RPG_STORAGE_KEY, JSON.stringify(rpgData)).catch((e) =>
        console.error('Error guardando estado RPG:', e)
      );
    }
  }, [rpgData, loaded]);

  // Sumar XP a un atributo (con lógica de level-up por atributo)
  const addXp = (attributeKey, amount = 10) => {
    const key = attributeKey?.toLowerCase();
    if (!RPG_ATTRIBUTES[key]) return;

    // Se lee el estado actual fuera del updater para poder comparar
    // "nivel antes" vs "nivel después" y así saber si hubo level-up.
    const currentStat = rpgData.stats[key] || { level: 1, xp: 0, maxXp: 100 };
    let newXp = currentStat.xp + (amount || 10);
    let newLevel = currentStat.level;
    let newMaxXp = currentStat.maxXp;

    while (newXp >= newMaxXp) {
      newXp -= newMaxXp;
      newLevel += 1;
      newMaxXp = Math.round(newMaxXp * 1.25);
    }

    setRpgData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [key]: { level: newLevel, xp: newXp, maxXp: newMaxXp },
      },
    }));

    // Si el nivel subió (puede subir más de 1 con XP grande), encolar
    // el evento para que el overlay se muestre automáticamente.
    if (newLevel > currentStat.level) {
      setLevelUpQueue((queue) => [...queue, { attributeKey: key, newLevel }]);
    }
  };

  // Restar XP cuando se desmarca una tarea
  const removeXp = (attributeKey, amount = 10) => {
    const key = attributeKey?.toLowerCase();
    if (!RPG_ATTRIBUTES[key]) return;

    setRpgData((prev) => {
      const currentStat = prev.stats[key] || { level: 1, xp: 0, maxXp: 100 };
      let newXp = currentStat.xp - (amount || 10);
      let newLevel = currentStat.level;
      let newMaxXp = currentStat.maxXp;

      while (newXp < 0 && newLevel > 1) {
        newLevel -= 1;
        newMaxXp = Math.round(newMaxXp / 1.25);
        newXp += newMaxXp;
      }

      if (newXp < 0) newXp = 0;

      return {
        ...prev,
        stats: {
          ...prev.stats,
          [key]: {
            level: newLevel,
            xp: newXp,
            maxXp: newMaxXp,
          },
        },
      };
    });
  };

  const updateCharacter = (characterName, characterClass) => {
    setRpgData((prev) => ({
      ...prev,
      characterName: characterName || prev.characterName,
      characterClass: characterClass || prev.characterClass,
    }));
  };

  // Evento actualmente pendiente de mostrar (el primero de la cola),
  // ya resuelto con label/icon/color para que la pantalla que lo
  // consuma no tenga que ir a buscar RPG_ATTRIBUTES por su cuenta.
  const currentLevelUp = levelUpQueue[0] || null;
  const attrInfo = currentLevelUp ? RPG_ATTRIBUTES[currentLevelUp.attributeKey] : null;

  const levelUpEvent = currentLevelUp && attrInfo
    ? {
      attribute: attrInfo.label,
      newLevel: currentLevelUp.newLevel,
      icon: attrInfo.icon,
      color: attrInfo.color,
    }
    : null;

  // Se llama desde la pantalla cuando el overlay terminó de mostrarse
  // (auto-cierre o tap del usuario). Saca el evento actual de la cola;
  // si había otro atributo que subió de nivel casi al mismo tiempo,
  // ese pasa a ser el próximo "levelUpEvent".
  const dismissLevelUp = () => {
    setLevelUpQueue((queue) => queue.slice(1));
  };

  return (
    <RpgContext.Provider
      value={{
        rpgData,
        loaded,
        addXp,
        removeXp,
        updateCharacter,
        levelUpEvent,
        dismissLevelUp,
      }}
    >
      {children}
    </RpgContext.Provider>
  );
}

export function useRpg() {
  const ctx = useContext(RpgContext);
  if (!ctx) throw new Error('useRpg debe usarse dentro de <RpgProvider>');
  return ctx;
}