// Widget de cabecera con estética RPG Pixel Art para la HomeScreen.
// Muestra el personaje avatar pixel y las 4 barras de atributos:
// Salud, Fuerza, Inteligencia y Resistencia con sus niveles individuales.
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRpg, RPG_ATTRIBUTES, RPG_AVATARS } from '../context/RpgContext';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, SHADOW } from '../constants/theme';

export default function RpgHeaderCard() {
  const { rpgData, updateCharacter } = useRpg();
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState(rpgData.characterName);
  const [selectedClass, setSelectedClass] = useState(rpgData.characterClass);

  const currentAvatar =
    RPG_AVATARS.find((a) => a.id === rpgData.characterClass) || RPG_AVATARS[0];

  const handleSaveModal = () => {
    updateCharacter(editName.trim() || 'Hero Pixel', selectedClass);
    setModalVisible(false);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Contenido principal del Header RPG */}
      <View style={styles.mainContent}>
        {/* Lado Izquierdo: Avatar Pixel Art */}
        <TouchableOpacity
          style={styles.avatarSection}
          onPress={() => {
            setEditName(rpgData.characterName);
            setSelectedClass(rpgData.characterClass);
            setModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <View style={styles.avatarFrame}>
            <Image source={currentAvatar.image} style={styles.avatarImage} />
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </View>
          <View>
            <Text style={styles.characterName} numberOfLines={1}>
              {rpgData.characterName}
            </Text>
            <Text style={styles.characterClassText}>{currentAvatar.name}</Text>
          </View>
        </TouchableOpacity>

        {/* Lado Derecho: 4 Atributos individuales */}
        <View style={styles.statsSection}>
          {Object.keys(RPG_ATTRIBUTES).map((key) => {
            const attr = RPG_ATTRIBUTES[key];
            const stat = rpgData.stats[key] || { level: 1, xp: 0, maxXp: 100 };
            const progress = Math.min(Math.max(stat.xp / stat.maxXp, 0), 1) * 100;

            return (
              <View key={key} style={styles.statRow}>
                {/* Cabecera del atributo: Icono + Nombre + Nivel + XP */}
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>
                    {attr.icon} {attr.label}{' '}
                    <Text style={styles.statLevel}>Lvl. {stat.level}</Text>
                  </Text>
                  <Text style={styles.statXpText}>
                    {stat.xp}/{stat.maxXp} XP
                  </Text>
                </View>

                {/* Barra de progreso de XP */}
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: attr.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Modal para cambiar Avatar y Nombre */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Hero Pixel 🗡️</Text>

            <Text style={styles.inputLabel}>Character name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Maria M."
              placeholderTextColor="#A0A5BD"
            />

            <Text style={styles.inputLabel}>Choose your class and avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarList}>
              {RPG_AVATARS.map((av) => {
                const isSelected = selectedClass === av.id;
                return (
                  <TouchableOpacity
                    key={av.id}
                    style={[styles.avatarOption, isSelected && styles.avatarOptionSelected]}
                    onPress={() => setSelectedClass(av.id)}
                  >
                    <Image source={av.image} style={styles.avatarOptionImage} />
                    <Text
                      style={[
                        styles.avatarOptionName,
                        isSelected && styles.avatarOptionNameSelected,
                      ]}
                    >
                      {av.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveModal}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    borderBottomWidth: 3,
    borderColor: COLORS.primaryBorder,
    ...SHADOW.card,
  },

  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarSection: {
    alignItems: 'center',
    width: 105,
  },
  avatarFrame: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.md,
    borderWidth: 3,
    borderColor: '#FFD700', // Borde dorado retro
    backgroundColor: '#1E1633',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderTopLeftRadius: 4,
  },
  editBadgeText: {
    fontSize: 10,
  },
  characterName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  characterClassText: {
    fontSize: FONT_SIZES.xs,
    color: '#FFD700',
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 1,
  },
  statsSection: {
    flex: 1,
    gap: 8,
  },
  statRow: {
    width: '100%',
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs + 1,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#E0E0E0',
  },
  statLevel: {
    fontSize: FONT_SIZES.xs,
    color: '#FFD700',
    fontWeight: FONT_WEIGHTS.semibold,
  },
  statXpText: {
    fontSize: 10,
    color: '#B0A8D1',
    fontWeight: FONT_WEIGHTS.semibold,
  },
  progressBarBackground: {
    height: 9,
    backgroundColor: '#1E1633',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3D2F5F',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#2C2046',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#B0A8D1',
    fontWeight: FONT_WEIGHTS.semibold,
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#1E1633',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#4A3B75',
    color: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
  },
  avatarList: {
    flexDirection: 'row',
    marginVertical: SPACING.sm,
  },
  avatarOption: {
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: SPACING.sm,
  },
  avatarOptionSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#3D2F5F',
  },
  avatarOptionImage: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
  },
  avatarOptionName: {
    fontSize: FONT_SIZES.xs,
    color: '#B0A8D1',
    marginTop: 4,
  },
  avatarOptionNameSelected: {
    color: '#FFD700',
    fontWeight: FONT_WEIGHTS.bold,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  cancelButtonText: {
    color: '#B0A8D1',
    fontWeight: FONT_WEIGHTS.semibold,
  },
  saveButton: {
    backgroundColor: '#FF9F43',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHTS.bold,
  },
});
