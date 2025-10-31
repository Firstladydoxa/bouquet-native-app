import { GlobalReminderSystem } from '@/components/subscriptions/GlobalReminderSystem';
import CustomLoader from '@/components/ui/CustomLoader';
import { useSubscription } from '@/contexts';
import { useTheme } from '@/contexts/ThemeContext';
import { BerkshireSwash_400Regular, useFonts } from '@expo-google-fonts/berkshire-swash';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManageSubscriptionScreen() {
  const {
    hasSubscription,
    subscriptionDetails,
    paymentHistory,
    loading,
    error,
  } = useSubscription();

  const [showAllPayments, setShowAllPayments] = useState(false);
  const INITIAL_PAYMENT_COUNT = 3;

  // Load Berkshire Swash font
  const [fontsLoaded] = useFonts({
    BerkshireSwash_400Regular,
  });

  // Get theme colors
  const { colors } = useTheme();

  // Helper function to get status display
  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { text: 'ACTIVE', color: design.success, bgColor: design.successBg };
      case 'free_trial':
        return { text: 'FREE TRIAL', color: '#FF6B35', bgColor: '#FF6B3515' };
      case 'cancelled':
        return { text: 'CANCELLED', color: '#DC2626', bgColor: '#DC262615' };
      case 'expired':
        return { text: 'EXPIRED', color: '#9CA3AF', bgColor: '#9CA3AF15' };
      case 'past_due':
        return { text: 'PAST DUE', color: '#F59E0B', bgColor: '#F59E0B15' };
      default:
        return { text: 'UNKNOWN', color: '#6B7280', bgColor: '#6B728015' };
    }
  };

  // Helper function to get language display
  const getLanguageDisplay = (languages: string[]) => {
    if (!languages || languages.length === 0) return 'N/A';
    
    // Check for wildcard (free trial all languages)
    if (languages.includes('*')) {
      return 'All Languages (Free Trial)';
    }
    
    // If more than 3 languages, show count
    if (languages.length > 3) {
      return `${languages.slice(0, 3).join(', ')} + ${languages.length - 3} more`;
    }
    
    return languages.join(', ');
  };

  // Design System - Modern white background with theme accents
  const design = {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceElevated: '#F1F5F9',
    primary: colors.primary,
    primaryLight: colors.primaryLight || colors.primary,
    secondary: colors.secondary || colors.primary,
    secondaryLight: colors.secondaryLight || (colors.secondary || colors.primary),
    tertiary: colors.tertiary || colors.primary,
    accent: '#6366F1',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    info: '#3B82F6',
    infoBg: '#DBEAFE',
  };

  const handleViewInvoice = async (invoiceUrl: string) => {
    try {
      await WebBrowser.openBrowserAsync(invoiceUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: design.primary,
        toolbarColor: design.surface,
      });
    } catch (error) {
      console.error('Error opening invoice:', error);
      Alert.alert('Error', 'Failed to open invoice');
    }
  };

  const handleDownloadInvoice = async (invoiceUrl: string, invoiceNumber: string) => {
    try {
      Alert.alert(
        'Download Invoice',
        `Do you want to download invoice ${invoiceNumber}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const fileUri = ((FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory) + `invoice_${invoiceNumber}.pdf`;
                
                const downloadResumable = FileSystem.createDownloadResumable(
                  invoiceUrl,
                  fileUri,
                  {},
                  (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
                  }
                );

                const result = await downloadResumable.downloadAsync();
                
                if (result) {
                  const isAvailable = await Sharing.isAvailableAsync();
                  
                  if (isAvailable) {
                    await Sharing.shareAsync(result.uri, {
                      mimeType: 'application/pdf',
                      dialogTitle: `Invoice ${invoiceNumber}`,
                      UTI: 'com.adobe.pdf'
                    });
                    Alert.alert('Success', 'Invoice downloaded successfully');
                  } else {
                    Alert.alert('Success', `Invoice saved to: ${result.uri}`);
                  }
                }
              } catch (downloadError) {
                console.error('Download error:', downloadError);
                Alert.alert('Error', 'Failed to download invoice. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Failed to download invoice');
    }
  };

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: design.background }]}>
        <View style={styles.loadingContainer}>
          <CustomLoader size="large" message="Loading your subscription..." />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasSubscription) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: design.background }]}>
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[design.primary + '20', design.primary + '08']}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="sparkles" size={64} color={design.primary} />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: design.textPrimary, fontFamily: 'BerkshireSwash_400Regular' }]}>
            No Active Plan
          </Text>
          <Text style={[styles.emptyText, { color: design.textSecondary }]}>
            Unlock premium features and exclusive content. Start your journey today!
          </Text>
          <TouchableOpacity 
            style={[styles.subscribeButton, { backgroundColor: design.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeButtonText}>View Plans</Text>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: design.background }]}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.mainTitle, { color: design.secondary, fontFamily: 'BerkshireSwash_400Regular' }]}>
            My Subscription
          </Text>
          <Text style={[styles.headerSubtitle, { color: design.textSecondary }]}>
            Manage your plan and billing details
          </Text>
        </View>

        {/* Global Reminder System */}
        <GlobalReminderSystem />

        {/* Active Subscription Card */}
        {subscriptionDetails && (
          <LinearGradient
            colors={[design.primary + '08', design.background]}
            style={[styles.featureCard, { borderColor: design.primary + '30' }]}
          >
            {/* Card Header */}
            <View style={styles.featureCardHeader}>
              <View style={styles.featureCardTitleRow}>
                <LinearGradient
                  colors={[design.secondary, design.secondaryLight]}
                  style={styles.featureIconContainer}
                >
                  <MaterialIcons name="stars" size={28} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.featureCardTitleContainer}>
                  <Text style={[styles.featureCardTitle, { color: design.primary, fontFamily: 'BerkshireSwash_400Regular' }]}>
                    {subscriptionDetails.status === 'free_trial' ? 'Free Trial Plan' : 'Active Plan'}
                  </Text>
                </View>
              </View>
              {/* Status Badge moved here */}
              <View style={[styles.statusBadge, { backgroundColor: getStatusDisplay(subscriptionDetails.status).bgColor }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusDisplay(subscriptionDetails.status).color }]} />
                <Text style={[styles.statusText, { color: getStatusDisplay(subscriptionDetails.status).color }]}>
                  {getStatusDisplay(subscriptionDetails.status).text}
                </Text>
              </View>
            </View>

            {/* Plan Details */}
            <View style={[styles.planCard, { backgroundColor: design.surface }]}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: design.tertiary, fontFamily: 'BerkshireSwash_400Regular' }]}>
                    {subscriptionDetails.status === 'free_trial' 
                      ? 'Free Trial Access' 
                      : (subscriptionDetails.package?.label || 'Premium Plan')
                    }
                  </Text>
                  <View style={styles.planPriceRow}>
                    <Text style={[styles.planPrice, { color: design.primary }]}>
                      {subscriptionDetails.status === 'free_trial' ? 'FREE' : `$${subscriptionDetails.package?.price}`}
                    </Text>
                    <Text style={[styles.planDuration, { color: design.secondary }]}>
                      {subscriptionDetails.status === 'free_trial' 
                        ? 'Until Dec 31, 2025'
                        : `/ ${subscriptionDetails.package?.duration || 'month'} days`
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subscription Details Grid - Two rows layout */}
            <View style={styles.detailsContainer}>
              {/* First Row: Start Date and Expires */}
              <View style={[styles.detailRow, { borderBottomColor: design.borderLight }]}>
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconWrapper, { backgroundColor: design.primary + '15' }]}>
                    <Ionicons name="calendar-outline" size={20} color={design.primary} />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: design.textTertiary }]}>Start Date</Text>
                    <Text style={[styles.detailValue, { color: design.textPrimary }]}>
                      {subscriptionDetails.start ? 
                        new Date(subscriptionDetails.start).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 
                        'N/A'
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={[styles.detailIconWrapper, { backgroundColor: design.secondary + '15' }]}>
                    <Ionicons name="time-outline" size={20} color={design.secondary} />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: design.textTertiary }]}>Expires</Text>
                    <Text style={[styles.detailValue, { color: design.textPrimary }]}>
                      {subscriptionDetails.end ? 
                        new Date(subscriptionDetails.end).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 
                        'N/A'
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Second Row: Languages (Full Width) */}
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.detailItem, { flex: 1 }]}>
                  <View style={[styles.detailIconWrapper, { backgroundColor: design.tertiary + '15' }]}>
                    <Ionicons name="language-outline" size={20} color={design.tertiary} />
                  </View>
                  <View style={[styles.detailTextContainer, { flex: 1 }]}>
                    <Text style={[styles.detailLabel, { color: design.textTertiary }]}>
                      Language{subscriptionDetails.language && subscriptionDetails.language.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={[styles.detailValue, { color: design.textPrimary, flexWrap: 'wrap' }]}>
                      {getLanguageDisplay(subscriptionDetails.language || [])}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Payment History Section */}
        <View style={[styles.section, { backgroundColor: design.surface }]}>
          <View style={styles.sectionHeader}>

            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconContainer, { backgroundColor: design.primary + '15' }]}>
                <FontAwesome5 name="receipt" size={20} color={design.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: design.tertiary, fontFamily: 'BerkshireSwash_400Regular' }]}>
                Payment History
              </Text>
            </View>

            {paymentHistory?.payments && paymentHistory.payments.length > 0 && (
              <Text style={[styles.paymentCount, { color: design.textTertiary }]}>
                {paymentHistory.payments.length} payment{paymentHistory.payments.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {paymentHistory?.payments && paymentHistory.payments.length > 0 ? (
            <>
              <View style={styles.paymentsList}>
                {(showAllPayments ? paymentHistory.payments : paymentHistory.payments.slice(0, INITIAL_PAYMENT_COUNT)).map((payment, index) => (
                  <View key={payment.id} style={[styles.paymentCard, { backgroundColor: design.background, borderColor: design.border }]}>
                    <View style={styles.paymentCardHeader}>
                      <View style={styles.paymentCardLeft}>
                        <View style={[
                          styles.paymentIconContainer,
                          { backgroundColor: payment.status === 'succeeded' ? design.successBg : design.warningBg }
                        ]}>
                          <Ionicons 
                            name={payment.status === 'succeeded' ? 'checkmark-circle' : 'time'} 
                            size={24} 
                            color={payment.status === 'succeeded' ? design.success : design.warning} 
                          />
                        </View>
                        <View style={styles.paymentCardInfo}>
                          <Text style={[styles.paymentAmount, { color: design.textPrimary }]}>
                            ${payment.amount} {payment.currency.toUpperCase()}
                          </Text>
                          <Text style={[styles.paymentDate, { color: design.textSecondary }]}>
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                          {payment.package?.label && (
                            <View style={styles.paymentPackageRow}>
                              <Ionicons name="cube-outline" size={14} color={design.primary} />
                              <Text style={[styles.paymentPackage, { color: design.primary }]}>
                                {payment.package.label}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={[
                        styles.paymentStatusBadge,
                        { backgroundColor: payment.status === 'succeeded' ? design.successBg : design.warningBg }
                      ]}>
                        <Text style={[
                          styles.paymentStatusText,
                          { color: payment.status === 'succeeded' ? design.success : design.warning }
                        ]}>
                          {payment.status === 'succeeded' ? 'Paid' : payment.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {paymentHistory.payments.length > INITIAL_PAYMENT_COUNT && (
                <TouchableOpacity
                  style={[styles.loadMoreButton, { backgroundColor: design.background, borderColor: design.primary + '30' }]}
                  onPress={() => setShowAllPayments(!showAllPayments)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showAllPayments ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={design.primary} 
                  />
                  <Text style={[styles.loadMoreText, { color: design.primary }]}>
                    {showAllPayments ? 'Show Less' : `Show ${paymentHistory.payments.length - INITIAL_PAYMENT_COUNT} More`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyStateIconContainer, { backgroundColor: design.borderLight }]}>
                <Ionicons name="receipt-outline" size={40} color={design.textTertiary} />
              </View>
              <Text style={[styles.emptyStateText, { color: design.textSecondary }]}>
                No payment history available
              </Text>
            </View>
          )}
        </View>

        {/* Invoice Management Section */}
        <View style={[styles.section, { backgroundColor: design.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconContainer, { backgroundColor: design.primary + '15' }]}>
                <Ionicons name="document-text" size={20} color={design.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: design.tertiary, fontFamily: 'BerkshireSwash_400Regular' }]}>
                Invoices
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionDescription, { color: design.textSecondary }]}>
            Download and view your subscription invoices in PDF format
          </Text>

          {paymentHistory?.payments && paymentHistory.payments.length > 0 ? (
            <View style={styles.invoicesList}>
              {paymentHistory.payments
                .filter(payment => payment.charge_details?.receipt_url)
                .slice(0, 3)
                .map((payment) => (
                  <View key={payment.id} style={[styles.invoiceCard, { backgroundColor: design.background, borderColor: design.border }]}>
                    <View style={styles.invoiceCardLeft}>
                      <View style={[styles.invoiceIconContainer, { backgroundColor: design.infoBg }]}>
                        <Ionicons name="document" size={24} color={design.secondary} />
                      </View>
                      <View style={styles.invoiceCardInfo}>
                        <Text style={[styles.invoiceNumber, { color: design.textPrimary }]}>
                          Invoice #{payment.charge_details?.receipt_number || payment.id}
                        </Text>
                        <Text style={[styles.invoiceDate, { color: design.textSecondary }]}>
                          {new Date(payment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.invoiceActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: design.primary }]}
                        onPress={() => payment.charge_details?.receipt_url && 
                          handleViewInvoice(payment.charge_details.receipt_url)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="eye" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: design.tertiary }]}
                        onPress={() => payment.charge_details?.receipt_url && 
                          handleDownloadInvoice(
                            payment.charge_details.receipt_url, 
                            payment.charge_details?.receipt_number || payment.id.toString()
                          )}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="download" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyStateIconContainer, { backgroundColor: design.borderLight }]}>
                <Ionicons name="document-outline" size={40} color={design.textTertiary} />
              </View>
              <Text style={[styles.emptyStateText, { color: design.textSecondary }]}>
                No invoices available yet
              </Text>
            </View>
          )}
        </View>

        {error && (
          <View style={[styles.errorCard, { backgroundColor: design.errorBg, borderColor: design.error + '30' }]}>
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle" size={24} color={design.error} />
              <Text style={[styles.errorTitle, { color: design.error }]}>Error</Text>
            </View>
            <Text style={[styles.errorText, { color: design.textPrimary }]}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Header
  header: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 35,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },

  // Feature Card (Active Subscription)
  featureCard: {
    borderRadius: 24,
    padding: 35,
    marginBottom: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  featureCardHeader: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIconContainer: {
    marginHorizontal: 8,
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureCardTitleContainer: {
    flex: 1,
    marginTop: 14,
  },
  featureCardTitle: {
    fontSize: 26,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Plan Card
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,

    marginBottom: 8,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  planDuration: {
    fontSize: 18,
    marginLeft: 4,
  },

  // Details Grid
  detailsContainer: {
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Section
  section: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sectionTitle: {
    fontSize: 24,
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentCount: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Payment Card
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  paymentCardInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    marginBottom: 6,
  },
  paymentPackageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentPackage: {
    fontSize: 13,
    fontWeight: '600',
  },
  paymentStatusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Load More Button
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 12,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Invoice Card
  invoicesList: {
    gap: 12,
  },
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  invoiceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  invoiceCardInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },

  // Error Card
  errorCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
