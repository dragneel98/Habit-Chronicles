// ============================================================
// RpgContext.jsx
// Contexto para manejar el personaje RPG, avatares pixel y
// los 4 atributos principales: Fuerza, Inteligencia, Resistencia y Salud.
// Persiste los niveles y experiencia en AsyncStorage.
// ============================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
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

    setRpgData((prev) => {
      const currentStat = prev.stats[key] || { level: 1, xp: 0, maxXp: 100 };
      let newXp = currentStat.xp + (amount || 10);
      let newLevel = currentStat.level;
      let newMaxXp = currentStat.maxXp;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.round(newMaxXp * 1.25);
      }

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

  return (
    <RpgContext.Provider
      value={{
        rpgData,
        loaded,
        addXp,
        removeXp,
        updateCharacter,
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
