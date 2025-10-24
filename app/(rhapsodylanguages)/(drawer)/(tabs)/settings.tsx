import { CompactThemeSelector } from '@/components/ui/CompactThemeSelector';
import { ThemeColorWidget } from '@/components/ui/ThemeColorWidget';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.primary,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      marginRight: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 20,
      lineHeight: 20,
    },
    widgetContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    widgetLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 24,
    },
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    compactLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    featureList: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
  });

  const features = [
    'Real-time theme switching',
    'Persistent theme selection',
    '9 beautiful color themes',
    'Instant app-wide updates',
    'Elegant modal interface',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Theme Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your app appearance</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Theme Widget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons 
              name="color-palette" 
              size={24} 
              color={colors.primary} 
              style={styles.sectionIcon}
            />
            Theme Color Selector
          </Text>
          <Text style={styles.sectionDescription}>
            Choose from 9 beautiful themes to personalize your app experience. 
            Changes apply instantly across all screens.
          </Text>
          <View style={styles.widgetContainer}>
            <ThemeColorWidget size="large" showText={true} />
            <Text style={styles.widgetLabel}>Tap to change theme</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Compact Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons 
              name="options" 
              size={24} 
              color={colors.primary} 
              style={styles.sectionIcon}
            />
            Quick Theme Switcher
          </Text>
          <Text style={styles.sectionDescription}>
            A compact theme selector perfect for quick switching without leaving your current screen.
          </Text>
          <View style={styles.compactContainer}>
            <Text style={styles.compactLabel}>Current Theme</Text>
            <CompactThemeSelector />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons 
              name="star" 
              size={24} 
              color={colors.primary} 
              style={styles.sectionIcon}
            />
            Theme Features
          </Text>
          <View style={styles.featureList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}