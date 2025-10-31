import CustomLoader from '@/components/ui/CustomLoader';
import FreeTrialActivatedBadge from '@/components/ui/FreeTrialActivatedBadge';
import StartFreeTrialButton from '@/components/ui/StartFreeTrialButton';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { useAuth, useSubscription, useUser } from '@/contexts';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { PaymentApi } from '@/services/paymentApi';
import { RhapsodyLanguagesAPI } from '@/services/rhapsodylanguagesApi';
import { useSubscriptionService } from '@/services/subscriptionService';
import type { Package } from '@/types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionPackagesScreen() {

  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, refreshUser } = useAuth();
  const { hasFreeTrialActive } = useSubscription();
  const subscriptionService = useSubscriptionService();
  const router = useRouter();
  const colors = useThemeColors();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const styles = createStyles(colors);

  const getPackages = async () => {
    try {
      setLoading(true);
      const [packagesResponse] = await Promise.all([
        RhapsodyLanguagesAPI.fetchPackages(),
      ]);

      if (packagesResponse) {
        // Sort packages based on SUBSCRIPTION_SYSTEM_GUIDE.md:
        // 1. Free Trial first (only during promotional period)
        // 2. Always Free second
        // 3. Then rest by price (lowest first)
        const sortedPackages = packagesResponse.sort((a: Package, b: Package) => {
          const isPromotionalPeriod = subscriptionService.isPromotionalPeriodActive();
          
          // Free trial first, but only during promotional period
          if (isPromotionalPeriod) {
            if (a.category === 'free_trial' && b.category !== 'free_trial') return -1;
            if (b.category === 'free_trial' && a.category !== 'free_trial') return 1;
          }
          
          // Always Free second (after free trial if promotional period)
          if (a.category === 'free' && b.category !== 'free' && b.category !== 'free_trial') return -1;
          if (b.category === 'free' && a.category !== 'free' && a.category !== 'free_trial') return 1;
          
          // Sort other packages by price (lowest first)
          if (a.category !== 'free' && a.category !== 'free_trial' && 
              b.category !== 'free' && b.category !== 'free_trial') {
            return a.price - b.price;
          }
          
          return 0;
        });
        
        setPackages(sortedPackages);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current subscription status
  const fetchSubscriptionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get the user's current subscription from our custom auth
      const subscription = user.subscription;
      if (subscription && subscription.package_id) {
        setCurrentSubscription(String(subscription.package_id)); // Convert number to string
      } else {
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to payment page
  const handleSubscribe = (plan: Package) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to subscribe');
      return;
    }

    // Navigate to the dynamic payment route with the package ID
    router.push(`/subscriptions/${plan.id}` as any);
  };

  // Handle free trial activation
  const handleFreeTrial = async (plan: Package) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to start free trial');
      return;
    }

    Alert.alert(
      'Start Free Trial',
      'Get full access to all languages until December 31, 2025. No payment required!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Trial',
          onPress: async () => {
            try {
              setLoading(true);

              const [freeTrialResponse] = await Promise.all([
                  PaymentApi.activateFreeTrial(await getToken()),
              ]);

              if(freeTrialResponse){
                Alert.alert('Success', 'Free trial activated! You now have access to all languages until December 31, 2025.');
                await refreshUser();
              }

              // Call backend API to activate free trial
              // For now, update user metadata locally
              //await user?.update({ metadata: { ...user.metadata, freeTrialActive: true, freeTrialEnd: '2025-12-31T23:59:59', }, });

              Alert.alert(
                'Free Trial Activated!',
                'You now have access to all languages until December 31, 2025.',
                [{ text: 'OK', onPress: () => router.push('/(rhapsodylanguages)/(drawer)/(tabs)') }]
              );
            } catch (error: any) {
              console.error('Error activating free trial:', error);
              Alert.alert('Error', error.message || 'Failed to activate free trial');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Update user metadata to remove subscription
              await user?.update({
                subscription: undefined,
                subscriptionDate: undefined,
                metadata: {
                  ...user.metadata,
                  subscriptionPlan: null,
                },
              });

              setCurrentSubscription(null);
              Alert.alert('Success', 'Subscription cancelled successfully');
            } catch (error) {
              console.error('Cancellation error:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Refresh subscription data
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptionStatus();
    await getPackages();
    setRefreshing(false);
  };

  useEffect(() => {
    if (userLoaded && user) {
      getPackages();
      fetchSubscriptionStatus();
    }
  }, [userLoaded, user]);

  if (!userLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <CustomLoader size="large" message="Loading subscription plans..." />
        </View>
      </SafeAreaView>
    );
  }

  const getPlanStatus = (planId: string) => {
    if (currentSubscription === planId) {
      return 'current';
    }
    return 'available';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Choose Your Plan
          </Text>
          <Text style={styles.subtitle}>
            Unlock premium features with Rhapsody subscription plans
          </Text>
          {currentSubscription && (
            <View style={styles.activePlanBadge}>
              <Text style={styles.activePlanText}>
                ✓ Active Plan:{' '}
                {packages.find((p) => p.id === currentSubscription)?.label}
              </Text>
            </View>
          )}
        </View>

        {/* Theme Selector Section */}
        <View style={styles.themeSelectorSection}>
          <TouchableOpacity 
            style={styles.themeSelectorToggle}
            onPress={() => setShowThemeSelector(!showThemeSelector)}
          >
            <Text style={styles.themeSelectorToggleText}>
              🎨 Customize App Theme
            </Text>
            <Text style={styles.chevron}>
              {showThemeSelector ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showThemeSelector && (
            <ThemeSelector 
              onThemeSelect={(theme) => {
                // Theme selector handles the change automatically
                setShowThemeSelector(false); // Close after selection
              }}
            />
          )}
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          {packages.map((plan, index) => {
            const status = getPlanStatus(plan.id);
            const isCurrentPlan = status === 'current';
            const isPromotionalPeriod = subscriptionService.isPromotionalPeriodActive();
            
            // Determine button behavior based on SUBSCRIPTION_SYSTEM_GUIDE.md
            const shouldShowFreeTrialButton = (() => {
              // For "All Language Free Trial" package - always show Start Free Trial button
              if (plan.category === 'free_trial') {
                return true;
              }
              
              // For all other packages during promotional period - show Start Free Trial button
              if (isPromotionalPeriod && plan.category !== 'free') {
                return true;
              }
              
              return false;
            })();
            
            const shouldShowSubscribeButton = (() => {
              // Never show Subscribe button during promotional period (except for Always Free)
              if (isPromotionalPeriod && plan.category !== 'free') {
                return false;
              }
              
              // After promotional period, show Subscribe button for paid plans
              if (!isPromotionalPeriod && plan.category !== 'free' && plan.category !== 'free_trial') {
                return true;
              }
              
              return false;
            })();
            
            // Define gradient colors with primary/secondary mix
            const gradientColors: readonly [string, string] =
              ([colors.primary || '#3847d6', colors.secondary || '#10B981'] as const);

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  isCurrentPlan && styles.planCardActive,
                ]}
              >
                {/* Popular or Active Badge */}
                {isCurrentPlan && (
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeBadge}
                  >
                    <Text style={styles.activeBadgeText}>
                      ⭐ CURRENTLY ACTIVE
                    </Text>
                  </LinearGradient>
                )}
                
                {/* Free Trial Promotional Badge - Only for ALL Languages Free Trial */}
                {plan.type === 'free_trial' && plan.label === 'ALL Languages Free Trial' && (
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeBadge}
                  >
                    <Text style={styles.activeBadgeText}>
                      🎁 LIMITED TIME OFFER
                    </Text>
                  </LinearGradient>
                )}

                <View style={styles.planContent}>
                  
                  {/* Plan header */}
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>
                      {plan.label}
                    </Text>
                    <Text style={styles.planDescription}>
                      {plan.value}
                    </Text>
                  </View>

                  {/* Price */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceAmount}>
                      ${plan.price}
                    </Text>
                    <Text style={styles.priceDuration}>
                      /{plan.duration} days
                    </Text>
                  </View>

                  {/* Features */}
                  <View style={styles.featuresContainer}>
                    {plan.items.map((feature, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <View style={styles.checkIconContainer}>
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.featureText}>
                          {feature.description}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Action button */}
                  {isCurrentPlan ? (
                    <TouchableOpacity
                      onPress={handleCancelSubscription}
                      style={styles.cancelButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelButtonText}>
                        Cancel Subscription
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      {plan.category === 'free' ? (
                        // Free package - show default info
                        <View style={styles.defaultPackageInfo}>
                          <Ionicons name="checkmark-circle" size={24} color={colors.primary || '#007AFF'} />
                          <Text style={styles.defaultPackageText}>
                            Default subscription for all users
                          </Text>
                        </View>
                      ) : hasFreeTrialActive && plan.category === 'free_trial' ? (
                        // Free trial already activated - show badge
                        <View style={styles.freeTrialPromotionContainer}>
                          <FreeTrialActivatedBadge variant="gradient" showDate={true} />
                        </View>
                      ) : shouldShowFreeTrialButton ? (
                        // Free trial package during promotional period - show button
                        <View style={styles.freeTrialPromotionContainer}>
                          <StartFreeTrialButton 
                            onSuccess={() => {
                              // Refresh user data after successful trial activation
                              refreshUser();
                              onRefresh();
                            }}
                          />
                        </View>
                      ) : shouldShowSubscribeButton ? (
                        // Regular packages - show subscribe button only
                        <TouchableOpacity
                          onPress={() => handleSubscribe(plan)}
                          style={styles.subscribeButton}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.subscribeGradient}
                          >
                            <Text style={styles.subscribeButtonText}>
                              Subscribe Now
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      ) : null}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <LinearGradient
            colors={['#f0f9ff', '#e0f2fe']}
            style={styles.footerCard}
          >
            <View style={styles.footerHeader}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="info" size={28} color={colors.primary || '#3847d6'} />
              </View>
              <Text style={styles.footerTitle}>
                Need Help?
              </Text>
            </View>
            <Text style={styles.footerText}>
              Contact our support team if you have any questions about our
              plans or need assistance with your subscription.
            </Text>
            <View style={styles.footerDivider} />
            <Text style={styles.footerSecure}>
              💳 Secure payments powered by Stripe
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 38,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.primary || '#3847d6',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  activePlanBadge: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6EE7B7',
  },
  activePlanText: {
    color: '#047857',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  plansContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  planCardActive: {
    borderColor: '#6EE7B7',
  },
  activeBadge: {
    paddingVertical: 12,
  },
  activeBadgeText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  planContent: {
    padding: 32,
  },
  planHeader: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 28,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.tertiary || '#3847d6',
    marginBottom: 8,
  },
  planDescription: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary || '#3847d6',
  },
  priceDuration: {
    color: colors.secondary || '#3847d6',
    marginLeft: 8,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkIconContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 6,
    padding: 6,
    marginRight: 12,
    marginTop: 2,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: '#374151',
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  freeTrialButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  freeTrialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  freeTrialButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  freeTrialSubtext: {
    color: '#60A5FA',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  subscribeButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  subscribeButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  defaultPackageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: colors.surface || '#F8F9FA',
    borderRadius: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary || '#007AFF',
  },
  defaultPackageText: {
    color: colors.primary || '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  footerCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  footerTitle: {
    color: colors.primary || '#3847d6',
    fontFamily: 'BerkshireSwash_400Regular',
    fontSize: 22,
  },
  footerText: {
    color: '#1E40AF',
    lineHeight: 24,
    fontSize: 16,
  },
  footerDivider: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
  },
  footerSecure: {
    color: '#1D4ED8',
    fontSize: 14,
    marginTop: 8,
  },
  // Theme Selector Styles
  themeSelectorSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  themeSelectorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  themeSelectorToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  chevron: {
    fontSize: 14,
    color: '#6B7280',
  },
  freeTrialPromotionContainer: {
    width: '100%',
    marginTop: 8,
  },
});