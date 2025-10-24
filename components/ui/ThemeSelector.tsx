import { ThemeName, useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ThemeSelectorProps {
  onThemeSelect?: (theme: ThemeName) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeSelect }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 20,
    },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    themeOption: {
      width: '47%',
      aspectRatio: 1.2,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    selectedThemeOption: {
      borderColor: colors.primary,
      borderWidth: 3,
      shadowOpacity: 0.2,
    },
    themePreview: {
      width: 60,
      height: 40,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    selectedIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
  });

  const handleThemeSelect = async (theme: ThemeName) => {
    try {
      await setTheme(theme);
      onThemeSelect?.(theme);
      
      // Show a brief confirmation
      Alert.alert(
        'Theme Changed',
        `Successfully switched to ${theme} theme!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to change theme. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getThemePreviewColors = (themeName: ThemeName) => {
    return {
      backgroundColor: colors.primary,
      borderColor: colors.border,
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Theme</Text>
      <Text style={styles.description}>
        Select a theme that matches your style. Your choice will be saved and applied across the app.
      </Text>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.themeGrid}>
          {availableThemes.map((theme) => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.themeOption,
                currentTheme === theme && styles.selectedThemeOption,
              ]}
              onPress={() => handleThemeSelect(theme)}
              activeOpacity={0.7}
            >
              {currentTheme === theme && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                  style={styles.selectedIcon}
                />
              )}
              
              <View
                style={[
                  styles.themePreview,
                  getThemePreviewColors(theme),
                ]}
              />
              
              <Text style={styles.themeName}>{theme}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};