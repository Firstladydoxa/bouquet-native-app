import { THEMES } from '@/constants/colors';
import { ThemeName, useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CompactThemeSelectorProps {
  onThemeChange?: (theme: ThemeName) => void;
  style?: any;
}

export const CompactThemeSelector: React.FC<CompactThemeSelectorProps> = ({ 
  onThemeChange,
  style 
}) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 25,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    expandedContainer: {
      minWidth: screenWidth * 0.8,
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 12,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    currentThemeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    currentThemeColor: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    expandIcon: {
      marginLeft: 4,
    },
    themeList: {
      marginTop: 8,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginVertical: 2,
      backgroundColor: colors.card,
    },
    selectedThemeOption: {
      backgroundColor: colors.primary,
    },
    themePreview: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checkIcon: {
      marginLeft: 'auto',
    },
  });

  const handleThemeSelect = async (theme: ThemeName) => {
    try {
      await setTheme(theme);
      setIsExpanded(false);
      onThemeChange?.(theme);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  const getThemeColor = (themeName: ThemeName) => {
    return THEMES[themeName].primary;
  };

  const renderThemeOption = ({ item: theme }: { item: ThemeName }) => {
    const isSelected = currentTheme === theme;
    
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          isSelected && styles.selectedThemeOption,
        ]}
        onPress={() => handleThemeSelect(theme)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.themePreview,
            { backgroundColor: getThemeColor(theme) },
          ]}
        />
        
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={16}
            color={colors.background}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (isExpanded) {
    return (
      <View style={[styles.expandedContainer, style]}>
        <TouchableOpacity
          style={styles.currentThemeButton}
          onPress={() => setIsExpanded(false)}
        >
          <View
            style={[
              styles.currentThemeColor,
              { backgroundColor: colors.primary },
            ]}
          />
          <Ionicons 
            name="chevron-up" 
            size={16} 
            color={colors.text}
            style={styles.expandIcon} 
          />
        </TouchableOpacity>

        <FlatList
          data={availableThemes}
          renderItem={renderThemeOption}
          keyExtractor={(item) => item}
          style={styles.themeList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => setIsExpanded(true)}
      activeOpacity={0.8}
    >
      <View style={styles.currentThemeButton}>
        <View
          style={[
            styles.currentThemeColor,
            { backgroundColor: colors.primary },
          ]}
        />
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={colors.text}
          style={styles.expandIcon} 
        />
      </View>
    </TouchableOpacity>
  );
};