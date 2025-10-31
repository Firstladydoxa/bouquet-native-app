import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import useDailyTextExtractor, { DailyTextContent } from '../../services/dailyTextExtractor';
import DailyReadingUtils from '../../utils/dailyReadingUtils';

interface DailyRhapsodyCardProps {
  style?: ViewStyle;
}

export const DailyRhapsodyCard: React.FC<DailyRhapsodyCardProps> = ({ style }) => {
  const { user } = useAuth();
  const { hasAccess } = useSubscription();
  const { colors } = useTheme();
  const textExtractor = useDailyTextExtractor();
  
  const [dailyContent, setDailyContent] = useState<DailyTextContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get daily reading info
  const dailyInfo = DailyReadingUtils.getDailyReadingPages();
  const articlePageNumber = textExtractor.getArticlePageNumber();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  useEffect(() => {
    loadDailyContent();
  }, []);

  const loadDailyContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the article page number (second page of the 3-page set)
      const pageNumber = textExtractor.getArticlePageNumber();
      console.log('Loading daily content from article page:', pageNumber);
      
      // Extract text content from the specific page
      const content = await textExtractor.extractDailyText();
      console.log('Daily content extracted:', content);
      
      if (!content.isValid) {
        throw new Error(content.error || 'Unable to extract content from today\'s article');
      }
      
      // Validate content before setting
      if (!content.title || !content.date || !content.firstParagraph) {
        console.warn('Incomplete content received:', content);
        throw new Error('Daily content is incomplete');
      }
      
      setDailyContent(content);
    } catch (err) {
      console.error('Error processing daily content:', err);
      setError(err instanceof Error ? err.message : 'Unable to load today\'s reading');
      
      // Set fallback content for better user experience
      setDailyContent({
        title: `Today's Article - Day ${dailyInfo.dayOfMonth}`,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        firstParagraph: 'Stay tuned for today\'s inspiration. You can still access the full content by clicking Read More below.',
        isValid: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to access daily Rhapsody content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') }
        ]
      );
      return;
    }


    router.push('/(rhapsodylanguages)/(drawer)/(tabs)/daily');
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: colors.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border || 'rgba(0,0,0,0.05)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    headerText: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: 'BerkshireSwash_400Regular',
      color: colors.tertiary,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textLight,
      fontStyle: 'italic',
    },
    content: {
      marginBottom: 20,
    },
    articleTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      lineHeight: 24,
    },
    articleDate: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 12,
      fontWeight: '500',
    },
    articleExcerpt: {
      fontSize: 17,
      lineHeight: 24,
      color: colors.text,
      marginBottom: 16,
      textAlign: 'justify',
    },
    pageInfo: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pageInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    pageInfoText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
      fontWeight: '500',
    },
    readMoreButton: {
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: colors.primary || '#3B82F6',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    readMoreGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 10,
    },
    readMoreText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textLight,
      marginTop: 12,
      fontWeight: '500',
    },
    errorContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      textAlign: 'center',
      marginTop: 8,
    },
    lockIcon: {
      padding: 8,
    },
    subscriptionPrompt: {
      backgroundColor: colors.warning + '15',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.warning + '30',
    },
    subscriptionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    subscriptionText: {
      fontSize: 14,
      color: colors.warning,
      marginLeft: 8,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="book" size={24} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>Rhapsody Daily</Text>
            <Text style={styles.sectionSubtitle}>Today's spiritual reflection</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={24} color={colors.textLight} />
          <Text style={styles.loadingText}>Loading today's reading...</Text>
        </View>
      </View>
    );
  }

  if (error || !dailyContent || !dailyContent.isValid) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="book" size={24} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>Rhapsody Daily</Text>
            <Text style={styles.sectionSubtitle}>Today's Article</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || dailyContent?.error || 'Unable to load today\'s article. Please try again later.'}
          </Text>
        </View>
      </View>
    );
  }

  const hasContentAccess = Boolean(user && hasAccess);

  // Use the existing loading and error states above

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerIcon}
        >
          <Ionicons name="book" size={24} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.sectionTitle}>Rhapsody Daily</Text>
          <Text style={styles.sectionSubtitle}> giving your day a lift!</Text>
        </View>
        {!hasContentAccess && (
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={20} color={colors.textLight} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Title from the extracted text */}
        <Text style={styles.articleTitle} numberOfLines={2}>
          {dailyContent?.title || `Day ${dailyInfo.dayOfMonth}'s Reading`}
        </Text>
        
        {/* Date from the extracted text */}
        <Text style={styles.articleDate}>
          {dailyContent?.date || new Date().toLocaleDateString()}
        </Text>
        
        <View style={styles.pageInfo}>
          <View style={styles.pageInfoRow}>
            <Ionicons name="document-text" size={16} color={colors.primary} />
            <Text style={styles.pageInfoText}>
              From Page {articlePageNumber}
            </Text>
          </View>
          <View style={styles.pageInfoRow}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={styles.pageInfoText}>
              Day {dailyInfo.dayOfMonth} / {daysInMonth}
            </Text>
          </View>
        </View>

        {/* First paragraph from the extracted text */}
        <Text style={[
          styles.articleExcerpt, 
          !hasContentAccess && { opacity: 0.6 }
        ]} numberOfLines={hasContentAccess ? 4 : 3}>
          {hasContentAccess 
            ? dailyContent?.firstParagraph 
            : (dailyContent?.firstParagraph?.substring(0, 100) + '...')}
        </Text>

        {/* {!hasContentAccess && (
          <View style={styles.subscriptionPrompt}>
            <View style={styles.subscriptionBadge}>
              <Ionicons name="diamond" size={16} color={colors.warning} />
              <Text style={styles.subscriptionText}>
                {user ? 'Subscription Required' : 'Sign In Required'}
              </Text>
            </View>
          </View>
        )} */}
      </View>

      <TouchableOpacity 
        style={styles.readMoreButton} 
        onPress={handleReadMore}
        activeOpacity={0.8}
      >
        <LinearGradient
          //colors={hasContentAccess ? [colors.primary || '#3B82F6', colors.secondary || '#10B981'] : [colors.warning || '#F59E0B', colors.error || '#EF4444']}
          colors={hasContentAccess ? [colors.primary || '#8B5CF6', colors.secondary || '#10B981'] : [colors.primary || '#3B82F6', colors.secondary || '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.readMoreGradient}
        >
          <Ionicons 
            name={"book"} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.readMoreText}>
            Rhapsody daily in your language
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default DailyRhapsodyCard;