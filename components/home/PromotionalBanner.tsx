import FreeTrialActivatedBadge from '@/components/ui/FreeTrialActivatedBadge';
import StartFreeTrialButton from '@/components/ui/StartFreeTrialButton';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface PromotionalBannerProps {
  onSuccess?: () => void;
}

export default function PromotionalBanner({ onSuccess }: PromotionalBannerProps) {
  const colors = useThemeColors();
  const { hasFreeTrialActive } = useSubscription();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AB47BC', '#1A237E', '#FFD700']}  
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.megaPromoContainer}>
              <Ionicons name="megaphone" size={20} color="#FFFFFF" />
              <Text style={styles.megaPromoText}>MEGA PROMOTION!</Text>
            </View>
            <View style={styles.sparkle}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
            </View>
          </View>

          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Rhapsody of Realities</Text>
            <Text style={styles.subtitle}>in ALL Languages</Text>
            <View style={styles.highlight}>
              <Text style={styles.highlightText}>FREE TRIAL</Text>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="globe-outline" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>All Premium Languages</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="book-outline" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>Daily Devotionals</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="headset-outline" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>Audio & Video Content</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Don't miss this opportunity to experience Rhapsody of Realities in all languages!
          </Text>

          {/* Call to Action Button */}
          {hasFreeTrialActive ? (
            <FreeTrialActivatedBadge
              variant="white"
              showDate={true}
              style={styles.ctaButton}
            />
          ) : (
            <StartFreeTrialButton
              text="Start Your FREE Trial"
              redirectToSubscriptions={true}
              onSuccess={onSuccess}
              style={styles.ctaButton}
              variant='white'
            />
          )}

          {/* Timer Section */}
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.timerText}>Valid until December 31, 2025</Text>
          </View>
        </View>

        {/* Book Icon */}
        <View style={styles.bookIconContainer}>
          <View style={styles.bookIcon}>
            <Ionicons name="book" size={32} color="#FFD700" />
          </View>
          <View style={styles.bookGlow} />
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  banner: {
    padding: 20,
    minHeight: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -60,
    right: -30,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -40,
    left: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 100,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  megaPromoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  megaPromoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sparkle: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 15,
    padding: 4,
  },
  titleContainer: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'BerkshireSwash_400Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'BerkshireSwash_400Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.95,
  },
  highlight: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  highlightText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
    minWidth: 90,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    opacity: 0.95,
  },
  ctaButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 3,
  },
  bookIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    zIndex: -1,
  },
});