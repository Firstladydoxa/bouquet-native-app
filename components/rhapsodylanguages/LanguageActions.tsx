import FreeTrialActivatedBadge from '@/components/ui/FreeTrialActivatedBadge';
import StartFreeTrialButton from '@/components/ui/StartFreeTrialButton';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { ContentAccessLevel, getAccessLevelColors, useSubscriptionService } from '@/services/subscriptionService';
import { RhapsodyLanguage } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LanguageActionsProps {
  language: RhapsodyLanguage;
  isExpanded: boolean;
  onToggle: () => void;
}

export const LanguageActions: React.FC<LanguageActionsProps> = ({
  language,
  isExpanded,
  onToggle
}) => {
  const router = useRouter();
  const colors = useThemeColors();
  const { hasFreeTrialActive } = useSubscription();
  const subscriptionService = useSubscriptionService();
  
  const accessResult = subscriptionService.checkLanguageAccess(language);
  const styles = createStyles(colors);

  const handleJoinNetwork = async () => {
    try {
      await Linking.openURL('https://tniglobal.org/join-the-network.php');
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const handleAction = (action: 'read' | 'listen' | 'watch' | 'download') => {
    router.push(`/${action}/${encodeURIComponent(language.label)}` as any);
  };

  const handlePurchaseLanguage = () => {
    // Redirect to buy.tsx page with language information
    router.push({
      pathname: '/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/buy',
      params: { 
        language: language.label
      }
    } as any);
  };

  const getAvailableFormats = () => {
    const formats: Array<'read' | 'listen' | 'watch'> = [];
    
    // Check for truthy values - handles '1', 1, true, etc.
    const isEnabled = (val: string | number | boolean | undefined | null) => {
      return val === '1' || val === 1 || val === true;
    };
    
    if (isEnabled(language.read as any)) formats.push('read');
    if (isEnabled(language.listen as any)) formats.push('listen');
    if (isEnabled(language.watch as any)) formats.push('watch');
    
    return formats;
  };

  const availableFormats = getAvailableFormats();

  const handleSubscriptionNavigation = () => {
    router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions');
  };

  const getAccessLevelStyle = () => {
    let level: ContentAccessLevel;
    if (accessResult.hasAccess) {
      level = ContentAccessLevel.SUBSCRIBED;
    } else if (language.type === 'open') {
      level = ContentAccessLevel.OPEN;
    } else {
      level = ContentAccessLevel.RESTRICTED;
    }
    
    return getAccessLevelColors(level, colors);
  };

  const accessColors = getAccessLevelStyle();

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={[styles.accordionHeader, { borderLeftColor: accessColors.primary }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.accordionTitle}>{language.label}</Text>
          <View style={styles.statusContainer}>
            {language.type === 'open' && (
              <View style={[styles.statusBadge, { backgroundColor: accessColors.background }]}>
                <Text style={[styles.statusText, { color: accessColors.text }]}>Free</Text>
              </View>
            )}
            {language.type === 'subscription' && accessResult.hasAccess && (
              <View style={[styles.statusBadge, { backgroundColor: accessColors.background }]}>
                <Text style={[styles.statusText, { color: accessColors.text }]}>Subscribed</Text>
              </View>
            )}
            {language.type === 'subscription' && !accessResult.hasAccess && (
              <View style={[styles.statusBadge, { backgroundColor: accessColors.background }]}>
                <Text style={[styles.statusText, { color: accessColors.text }]}>Premium</Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.primary}
            />
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>
          {/* Join Network Button - Always visible */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={handleJoinNetwork}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Join the Network</Text>
          </TouchableOpacity>

          {/* Check if formats are available first */}
          {availableFormats.length === 0 ? (
            <View style={styles.noFormatsContainer}>
              <Ionicons name="information-circle-outline" size={24} color={colors.textLight} />
              <Text style={styles.noFormatsText}>No formats available for this language</Text>
            </View>
          ) : accessResult.hasAccess ? (
            // User has access - show format-specific action buttons
            <View style={styles.actionButtonsContainer}>
              {availableFormats.map((format) => {
                switch (format) {
                  case 'read':
                    return (
                      <React.Fragment key="read">
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleAction('read')}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="book-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.buttonText}>Read</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.success || '#4CAF50' }]}
                          onPress={() => handleAction('download')}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.buttonText}>Download</Text>
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  case 'listen':
                    return (
                      <TouchableOpacity
                        key="listen"
                        style={[styles.actionButton, { backgroundColor: colors.tertiary || '#FF6F00' }]}
                        onPress={() => handleAction('listen')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Listen</Text>
                      </TouchableOpacity>
                    );
                  case 'watch':
                    return (
                      <TouchableOpacity
                        key="watch"
                        style={[styles.actionButton, { backgroundColor: colors.warning || '#9C27B0' }]}
                        onPress={() => handleAction('watch')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Watch</Text>
                      </TouchableOpacity>
                    );
                  default:
                    return null;
                }
              })}
            </View>
          ) : accessResult.shouldShowFreeTrialOption ? (
            // Show free trial promotion when available
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons 
                  name="gift-outline" 
                  size={24} 
                  color={colors.success || '#4CAF50'} 
                />
                <Text style={styles.alertTitle}>Free Trial Available!</Text>
              </View>
              <Text style={styles.alertText}>
                {accessResult.message}
              </Text>
              
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>Available formats:</Text>
                <View style={styles.formatList}>
                  {availableFormats.map((format) => (
                    <View key={format} style={styles.formatItem}>
                      <Ionicons 
                        name={
                          format === 'read' ? 'book-outline' : 
                          format === 'listen' ? 'headset-outline' : 
                          'play-circle-outline'
                        } 
                        size={16} 
                        color={colors.primary} 
                      />
                      <Text style={styles.formatText}>
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {hasFreeTrialActive ? (
                <FreeTrialActivatedBadge
                  variant="gradient"
                  showDate={true}
                />
              ) : (
                <StartFreeTrialButton 
                  onSuccess={() => {
                    // Refresh the component to show updated access
                    // The subscription context will handle state updates
                  }}
                />
              )}
            </View>
          ) : language.type === 'subscription' ? (
            // Premium language not included in subscription - show purchase option
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons 
                  name="diamond-outline" 
                  size={24} 
                  color={colors.warning || '#FF9800'} 
                />
                <Text style={styles.alertTitle}>Premium Language</Text>
              </View>
              <Text style={styles.alertText}>
                This language is not included in your current subscription. 
                You can add it to your plan for additional access.
              </Text>
              
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>Available formats:</Text>
                <View style={styles.formatList}>
                  {availableFormats.map((format) => (
                    <View key={format} style={styles.formatItem}>
                      <Ionicons 
                        name={
                          format === 'read' ? 'book-outline' : 
                          format === 'listen' ? 'headset-outline' : 
                          'play-circle-outline'
                        } 
                        size={16} 
                        color={colors.primary} 
                      />
                      <Text style={styles.formatText}>
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.alertButton}
                onPress={handlePurchaseLanguage}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.alertButtonText}>Add to Subscription</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            // No subscription - show subscription prompt
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons 
                  name="lock-closed" 
                  size={24} 
                  color={colors.warning || '#FF9800'} 
                />
                <Text style={styles.alertTitle}>Subscription Required</Text>
              </View>
              <Text style={styles.alertText}>
                {accessResult.message}
              </Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={handleSubscriptionNavigation}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.alertButtonText}>{accessResult.actionText}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  accordionContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.surface || colors.background,
    shadowColor: colors.shadow || '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderLeftWidth: 4,
    borderRadius: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: colors.surface || colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border || '#E5E5E5',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: colors.textSecondary || colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  alertButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    gap: 12,
    width: '100%',
  },
  noFormatsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noFormatsText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  formatInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  formatList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  formatText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
});