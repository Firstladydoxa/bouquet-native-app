import { useSubscription } from '@/contexts/SubscriptionContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface SubscriptionStatsProps {
  style?: any;
}

export const SubscriptionStats: React.FC<SubscriptionStatsProps> = ({ style }) => {
  const { hasSubscription, subscriptionDetails, loading } = useSubscription();
  const colors = useThemeColors();
  const router = useRouter();
  const styles = createStyles(colors);

  // Don't show anything if no subscription or still loading
  if (!hasSubscription || !subscriptionDetails || loading) {
    return null;
  }

  const calculateRemainingDays = () => {
    if (!subscriptionDetails?.end) return 0;
    const endDate = new Date(subscriptionDetails.end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateRemainingDays();
  const isExpiringSoon = remainingDays <= 7;

  const getSubscriptionIcon = () => {
    if (subscriptionDetails?.package?.label?.toLowerCase().includes('premium')) {
      return 'diamond-outline';
    }
    if (subscriptionDetails?.package?.label?.toLowerCase().includes('basic')) {
      return 'star-outline';
    }
    return 'flash-outline';
  };

  const getStatusColor = () => {
    if (isExpiringSoon) return '#FF6B6B';
    return colors.primary;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={20} color={colors.primary} />
        <Text style={styles.headerText}>Your Subscription</Text>
      </View>

      <View style={styles.statsGrid}>
        {/* Main Subscription Card */}
        <TouchableOpacity 
          style={styles.mainCard}
          onPress={() => router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/')}
        >
          <LinearGradient
            colors={[getStatusColor(), colors.secondary || '#5856D6']}
            style={styles.gradientCard}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Ionicons name={getSubscriptionIcon()} size={24} color="#FFFFFF" />
                <Text style={styles.cardTitle}>
                  {subscriptionDetails.package?.label || 'Active Plan'}
                </Text>
              </View>
              <Text style={styles.cardSubtitle}>Active Subscription</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Remaining Days Card */}
        <View style={[styles.miniCard, isExpiringSoon && styles.warningCard]}>
          <View style={styles.miniCardContent}>
            <Ionicons 
              name={isExpiringSoon ? "warning-outline" : "calendar-outline"} 
              size={20} 
              color={isExpiringSoon ? '#FF6B6B' : colors.primary} 
            />
            <Text style={[styles.miniCardNumber, isExpiringSoon && styles.warningText]}>
              {remainingDays}
            </Text>
            <Text style={[styles.miniCardLabel, isExpiringSoon && styles.warningText]}>
              Days Left
            </Text>
          </View>
        </View>

        {/* Language Access Card */}
        <View style={styles.miniCard}>
          <View style={styles.miniCardContent}>
            <Ionicons name="language-outline" size={20} color={colors.primary} />
            <Text style={styles.miniCardNumber}>∞</Text>
            <Text style={styles.miniCardLabel}>Languages</Text>
          </View>
        </View>

        {/* Quick Actions Card */}
        <TouchableOpacity 
          style={styles.miniCard}
          onPress={() => router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/')}
        >
          <View style={styles.miniCardContent}>
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
            <Text style={styles.miniCardLabel}>Manage</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isExpiringSoon && (
        <TouchableOpacity 
          style={styles.renewalBanner}
          onPress={() => router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/')}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.renewalGradient}
          >
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.renewalText}>
              Subscription expires soon - Renew now!
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mainCard: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  gradientCard: {
    flex: 1,
    justifyContent: 'center',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  miniCard: {
    width: (screenWidth - 56) / 3, // 3 cards per row with margins
    height: 70,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  warningCard: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  miniCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  miniCardNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  miniCardLabel: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  warningText: {
    color: '#FF6B6B',
  },
  renewalBanner: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  renewalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  renewalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});