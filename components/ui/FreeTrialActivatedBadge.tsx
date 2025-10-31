import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FreeTrialActivatedBadgeProps {
  style?: any;
  variant?: 'gradient' | 'white';
  showDate?: boolean;
}

/**
 * FreeTrialActivatedBadge Component
 * Display component shown when user has already activated their free trial
 * Non-interactive, just informational
 */
const FreeTrialActivatedBadge: React.FC<FreeTrialActivatedBadgeProps> = ({
  style,
  variant = 'gradient',
  showDate = true
}) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <View style={styles.textContainer}>
              <Text style={styles.title}>✨ Free Trial Active!</Text>
              {showDate && (
                <Text style={styles.subtitle}>Valid until Dec 31, 2025</Text>
              )}
            </View>
          </View>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={['#ECFDF5', '#D1FAE5']}
          style={styles.whiteGradient}
        >
          <View style={styles.whiteContent}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.whiteText, { color: '#059669' }]}>
              ✨ Free Trial Active
            </Text>
            {showDate && (
              <Text style={[styles.whiteSubtext, { color: '#6B7280' }]}>
                Until Dec 31, 2025
              </Text>
            )}
          </View>
        </LinearGradient>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  whiteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  whiteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whiteText: {
    fontSize: 16,
    fontWeight: '700',
  },
  whiteSubtext: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default FreeTrialActivatedBadge;
