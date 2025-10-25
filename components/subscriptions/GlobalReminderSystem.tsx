import { useSubscription } from '@/contexts/SubscriptionContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

interface ReminderSystemProps {
  style?: any;
}

export const GlobalReminderSystem: React.FC<ReminderSystemProps> = ({ style }) => {
  const { hasSubscription, subscriptionDetails, loading } = useSubscription();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [billingData, setBillingData] = useState({
    daysRemaining: 0,
    totalDays: 0,
    daysElapsed: 0,
    billingPeriod: '',
    nextPaymentDate: '',
    isExpiringSoon: false,
  });

  useEffect(() => {
    if (subscriptionDetails) {
      calculateBillingPeriod();
    }
  }, [subscriptionDetails]);

  const calculateBillingPeriod = () => {
    if (!subscriptionDetails?.start || !subscriptionDetails?.end) return;

    const startDate = new Date(subscriptionDetails.start);
    const endDate = new Date(subscriptionDetails.end);
    const today = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    const remaining = endDate.getTime() - today.getTime();

    const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil(elapsed / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)));

    // Determine billing period type
    let billingPeriod = 'Monthly';
    if (totalDays > 300) billingPeriod = 'Annual';
    else if (totalDays > 80) billingPeriod = 'Quarterly';

    // Calculate next payment date (approximate)
    let nextPaymentDate = '';
    if (subscriptionDetails.next_payment_date) {
      nextPaymentDate = new Date(subscriptionDetails.next_payment_date).toLocaleDateString();
    } else {
      nextPaymentDate = endDate.toLocaleDateString();
    }

    setBillingData({
      daysRemaining,
      totalDays,
      daysElapsed,
      billingPeriod,
      nextPaymentDate,
      isExpiringSoon: daysRemaining <= 7,
    });
  };

  // Don't show anything if no subscription or still loading
  if (!hasSubscription || !subscriptionDetails || loading) {
    return null;
  }

  const progressPercentage = billingData.totalDays > 0 
    ? (billingData.daysElapsed / billingData.totalDays) * 100 
    : 0;

  const chartData = [
    {
      name: 'Used',
      count: billingData.daysElapsed,
      color: billingData.isExpiringSoon ? '#FF6B6B' : colors.primary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Remaining',
      count: billingData.daysRemaining,
      color: colors.border || '#E5E7EB',
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => colors.primary,
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons 
          name="notifications-outline" 
          size={20} 
          color={billingData.isExpiringSoon ? '#FF6B6B' : colors.primary} 
        />
        <Text style={styles.headerText}>Billing Period Tracker</Text>
        {billingData.isExpiringSoon && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>!</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={200}
              height={140}
              chartConfig={chartConfig}
              accessor={'count'}
              backgroundColor={'transparent'}
              paddingLeft={'0'}
              hasLegend={false}
              center={[10, 0]}
            />
            <View style={styles.chartCenter}>
              <Text style={[styles.chartCenterNumber, billingData.isExpiringSoon && styles.warningText]}>
                {billingData.daysRemaining}
              </Text>
              <Text style={styles.chartCenterLabel}>Days Left</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.statNumber}>{billingData.totalDays}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.statNumber}>{billingData.daysElapsed}</Text>
            <Text style={styles.statLabel}>Days Used</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.statNumber}>{Math.round(progressPercentage)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* Billing Info */}
        <View style={styles.billingInfo}>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Billing Period:</Text>
            <Text style={styles.billingValue}>{billingData.billingPeriod}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Next Payment:</Text>
            <Text style={[styles.billingValue, billingData.isExpiringSoon && styles.warningText]}>
              {billingData.nextPaymentDate}
            </Text>
          </View>
        </View>

        {/* Warning Banner */}
        {billingData.isExpiringSoon && (
          <View style={styles.warningBanner}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.warningGradient}
            >
              <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
              <Text style={styles.warningBannerText}>
                Your subscription expires in {billingData.daysRemaining} days!
              </Text>
            </LinearGradient>
          </View>
        )}
      </View>
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
    flex: 1,
  },
  warningBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    gap: 16,
  },
  chartSection: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  chartCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -20 }],
    alignItems: 'center',
  },
  chartCenterNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  chartCenterLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  warningText: {
    color: '#FF6B6B',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  billingInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billingLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  warningBanner: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  warningGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  warningBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});