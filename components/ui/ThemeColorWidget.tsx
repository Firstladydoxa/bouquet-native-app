import { THEMES } from '@/constants/colors';
import { ThemeName, useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ThemeColorWidgetProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const ThemeColorWidget: React.FC<ThemeColorWidgetProps> = ({ 
  showText = true, 
  size = 'medium',
  style 
}) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const colors = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'large':
        return { width: 56, height: 56, borderRadius: 28 };
      default:
        return { width: 44, height: 44, borderRadius: 22 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 16;
      default: return 14;
    }
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 8,
    },
    colorButton: {
      ...getSizeStyles(),
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.background,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      fontSize: getTextSize(),
      color: colors.text,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: screenWidth * 0.9,
      maxHeight: screenHeight * 0.7,
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    description: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    themeCard: {
      width: (screenWidth * 0.9 - 48 - 16) / 2, // Account for padding and gap
      aspectRatio: 1.1,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    selectedThemeCard: {
      borderColor: colors.primary,
      borderWidth: 3,
      backgroundColor: colors.background,
      shadowOpacity: 0.2,
      transform: [{ scale: 1.02 }],
    },
    themePreview: {
      flexDirection: 'row',
      width: '100%',
      height: 40,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    colorStripe: {
      flex: 1,
    },
    themeName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    themeDescription: {
      fontSize: 11,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: 4,
    },
    selectedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 4,
    },
    currentThemeIndicator: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: colors.secondary,
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const handleThemeSelect = async (theme: ThemeName) => {
    try {
      await setTheme(theme);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  const getThemeColors = (themeName: ThemeName) => {
    const theme = THEMES[themeName];
    return [
      theme.primary,
      theme.secondary,
      theme.primary, // Using primary instead of accent
      theme.background,
    ];
  };

  const getThemeDescription = (themeName: ThemeName) => {
    const descriptions: Record<ThemeName, string> = {
      coffee: 'Warm & cozy',
      forest: 'Natural & fresh',
      purple: 'Creative & bold',
      ocean: 'Calm & serene',
      sunset: 'Vibrant & warm',
      mint: 'Cool & refreshing',
      midnight: 'Dark & elegant',
      roseGold: 'Elegant & luxe',
      goldNavy: 'Classic & premium',
    };
    return descriptions[themeName] || 'Beautiful theme';
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.colorButton}>
          {currentTheme && (
            <View style={styles.currentThemeIndicator}>
              <Ionicons name="star" size={10} color={colors.background} />
            </View>
          )}
          <Ionicons name="color-palette" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color={colors.background} />
        </View>
        {showText && (
          <Text style={styles.label}>{currentTheme}</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.8)" />
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              Pick a theme that reflects your style. Changes apply instantly across the entire app.
            </Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.themeGrid}>
                {availableThemes.map((theme) => {
                  const themeColors = getThemeColors(theme);
                  const isSelected = currentTheme === theme;
                  
                  return (
                    <TouchableOpacity
                      key={theme}
                      style={[
                        styles.themeCard,
                        isSelected && styles.selectedThemeCard,
                      ]}
                      onPress={() => handleThemeSelect(theme)}
                      activeOpacity={0.8}
                    >
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={12} color={colors.background} />
                        </View>
                      )}

                      <View style={styles.themePreview}>
                        {themeColors.map((color, index) => (
                          <View
                            key={index}
                            style={[
                              styles.colorStripe,
                              { backgroundColor: color },
                            ]}
                          />
                        ))}
                      </View>

                      <View>
                        <Text style={styles.themeName}>{theme}</Text>
                        <Text style={styles.themeDescription}>
                          {getThemeDescription(theme)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};