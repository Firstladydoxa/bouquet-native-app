import { useThemeColors } from '@/hooks/use-themed-styles';
import { PdfUtils, usePdfReaderState } from '@/services/dailyArticleService';
import { useSubscriptionService } from '@/services/subscriptionService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DailyPdfReaderProps {
  pdfUrl: string;
  languageLabel: string;
  onClose: () => void;
  initialDay?: number;
}

export const DailyPdfReader: React.FC<DailyPdfReaderProps> = ({
  pdfUrl,
  languageLabel,
  onClose,
  initialDay
}) => {
  const colors = useThemeColors();
  const subscriptionService = useSubscriptionService();
  const styles = createStyles(colors);
  
  const {
    selectedDay,
    currentPage,
    currentArticle,
    daysInMonth,
    navigation,
    actualPdfPage,
    goToPreviousDay,
    goToNextDay,
    goToDay,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage
  } = usePdfReaderState(initialDay);

  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const readingProgress = PdfUtils.getReadingProgress(selectedDay, daysInMonth);
  const articleTitle = PdfUtils.getArticleTitle(selectedDay);

  const handlePdfLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages);
    setPdfLoading(false);
    setPdfError(null);
  };

  const handlePdfError = (error: any) => {
    console.error('PDF Error:', error);
    setPdfError('Failed to load PDF. Please try again.');
    setPdfLoading(false);
  };

  if (!currentArticle.isValidDay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Invalid Day</Text>
          <Text style={styles.errorText}>
            Day {selectedDay} is not valid for the current month.
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={onClose}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{languageLabel}</Text>
          <Text style={styles.headerSubtitle}>{articleTitle}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{readingProgress}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${readingProgress}%` }]} />
      </View>

      {/* PDF Content */}
      <View style={styles.contentContainer}>
        {pdfLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading article...</Text>
          </View>
        )}

        {pdfError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorTitle}>Error Loading Article</Text>
            <Text style={styles.errorText}>{pdfError}</Text>
            <TouchableOpacity 
              style={styles.errorButton} 
              onPress={() => {
                setPdfError(null);
                setPdfLoading(true);
              }}
            >
              <Text style={styles.errorButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!pdfError && (
          <Pdf
            source={{ uri: pdfUrl, cache: false }}
            page={actualPdfPage}
            onLoadComplete={handlePdfLoadComplete}
            onError={handlePdfError}
            style={styles.pdf}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Day Navigation */}
        <View style={styles.dayNavigation}>
          <TouchableOpacity
            style={[styles.navButton, !navigation.hasPrevious && styles.navButtonDisabled]}
            onPress={goToPreviousDay}
            disabled={!navigation.hasPrevious}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={navigation.hasPrevious ? colors.primary : colors.textLight} 
            />
            <Text style={[
              styles.navButtonText, 
              !navigation.hasPrevious && styles.navButtonTextDisabled
            ]}>
              Day {navigation.previousDay || ''}
            </Text>
          </TouchableOpacity>

          <View style={styles.currentDayContainer}>
            <Text style={styles.currentDayLabel}>Day</Text>
            <Text style={styles.currentDayNumber}>{selectedDay}</Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, !navigation.hasNext && styles.navButtonDisabled]}
            onPress={goToNextDay}
            disabled={!navigation.hasNext}
          >
            <Text style={[
              styles.navButtonText, 
              !navigation.hasNext && styles.navButtonTextDisabled
            ]}>
              Day {navigation.nextDay || ''}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={navigation.hasNext ? colors.primary : colors.textLight} 
            />
          </TouchableOpacity>
        </View>

        {/* Page Navigation */}
        <View style={styles.pageNavigation}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && !navigation.hasPrevious && styles.pageButtonDisabled]}
            onPress={goToPreviousPage}
            disabled={currentPage === 1 && !navigation.hasPrevious}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.pageIndicator}>
            <View style={styles.pageDotsContainer}>
              <View style={[styles.pageDot, currentPage === 1 && styles.pageDotActive]} />
              <View style={[styles.pageDot, currentPage === 2 && styles.pageDotActive]} />
            </View>
            <Text style={styles.pageText}>
              Page {currentPage} of 2
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.pageButton, currentPage === 2 && !navigation.hasNext && styles.pageButtonDisabled]}
            onPress={goToNextPage}
            disabled={currentPage === 2 && !navigation.hasNext}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pdf: {
    flex: 1,
    width: screenWidth,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dayNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    gap: 4,
  },
  navButtonDisabled: {
    backgroundColor: colors.border,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: colors.textLight,
  },
  currentDayContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 25,
  },
  currentDayLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  currentDayNumber: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: colors.primary + '15',
  },
  pageButtonDisabled: {
    backgroundColor: colors.border,
  },
  pageIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  pageDotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  pageDotActive: {
    backgroundColor: colors.primary,
  },
  pageText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
});