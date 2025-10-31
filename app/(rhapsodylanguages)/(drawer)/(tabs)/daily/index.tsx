import FreeTrialActivatedBadge from '@/components/ui/FreeTrialActivatedBadge';
import StartFreeTrialButton from '@/components/ui/StartFreeTrialButton';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { MediaAPI } from '@/services/mediaApi';
import { DailyRhapsodyLanguage } from '@/types';
import DailyReadingUtils from '@/utils/dailyReadingUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Pdf from 'react-native-pdf';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GeneralDailyReading() {
    const pdfRef = useRef<any>(null);
    const router = useRouter();
    const { user } = useAuth();
    const { subscriptionDetails, hasFreeTrialActive } = useSubscription();
    const colors = useThemeColors();
    
    // Daily reading calculations
    const dailyInfo = DailyReadingUtils.getDailyReadingPages();
    const pagesToShow = DailyReadingUtils.getDailyReadingPageNumbers();
    const progress = DailyReadingUtils.getMonthlyProgress(dailyInfo.dayOfMonth);

    // State management
    const [languages, setLanguages] = useState<DailyRhapsodyLanguage[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<DailyRhapsodyLanguage | null>(null);
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(() => pagesToShow[0]); // Initialize with first daily page
    const [showLanguageList, setShowLanguageList] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // PDF display settings - DAILY PAGES ONLY
    const dailyPagesOnly = pagesToShow; // Only show today's 3 pages [coverPage, startPage, endPage]

    // Debug logging
    // console.log('Daily info:', dailyInfo);
    // console.log('Pages to show:', pagesToShow);

    const styles = createStyles(colors);

    // Fetch available languages on component mount
    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const languageData = await MediaAPI.fetchRhapsodyLanguages();
            // console.log('Fetched languages:', languageData.length);
            
            // Sort languages: free first, then premium
            const sortedLanguages = languageData.sort((a, b) => {
                if (a.type === 'open' && b.type === 'subscription') return -1;
                if (a.type === 'subscription' && b.type === 'open') return 1;
                return a.label.localeCompare(b.label);
            });
            
            setLanguages(sortedLanguages);
        } catch (err: any) {
            console.error('Error fetching languages:', err);
            setError(err.message || 'Failed to load languages');
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageSelect = async (language: DailyRhapsodyLanguage) => {
        setSelectedLanguage(language);
        setShowLanguageList(false);
        
        // Check access rights
        const accessCheck = DailyReadingUtils.checkLanguageAccess(
            language,
            subscriptionDetails?.language || [],
            subscriptionDetails?.status
        );

        if (!accessCheck.hasAccess) {
            // Show notification view (StartFreeTrialButton will be shown there)
            return;
        }

        // User has access - load PDF
        await loadPdf(language);
    };

    const loadPdf = async (language: DailyRhapsodyLanguage) => {
        try {
            setPdfLoading(true);
            setError(null);
            
            const pdfUrl = DailyReadingUtils.buildPdfUrl(language.file_name);
            // console.log('Loading PDF (streaming):', pdfUrl);
            
            // Directly set the URL - let the Pdf component handle streaming without caching
            setPdfUrl(pdfUrl);
            setCurrentPage(dailyInfo.coverPage); // Start with cover page
        } catch (err: any) {
            console.error('Error preparing PDF:', err);
            setError(err.message || 'Failed to prepare PDF');
        } finally {
            setPdfLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        // Only allow navigation within allowed pages (cover + daily article pages)
        // console.log('Page change requested:', page, 'Allowed:', pagesToShow);
        if (pagesToShow.includes(page)) {
            setCurrentPage(page);
        } else {
            // Prevent navigation to disallowed pages
            // console.log('Page', page, 'not allowed. Staying on', currentPage);
        }
    };

    const goToNextPage = () => {
        const currentIndex = dailyPagesOnly.indexOf(currentPage);
        if (currentIndex >= 0 && currentIndex < dailyPagesOnly.length - 1) {
            const nextPage = dailyPagesOnly[currentIndex + 1];
            // console.log('Navigating to next page:', nextPage, 'from index:', currentIndex);
            //setCurrentPage(nextPage);
            if (pdfRef.current && typeof pdfRef.current.setPage === 'function') {
                pdfRef.current.setPage(nextPage);
            }
        } else {
            // console.log('Already at last page, current index:', currentIndex);
        }
    };

    const goToPreviousPage = () => {
        const currentIndex = dailyPagesOnly.indexOf(currentPage);
        if (currentIndex > 0) {
            const prevPage = dailyPagesOnly[currentIndex - 1];
            // console.log('Navigating to previous page:', prevPage, 'from index:', currentIndex);
            //setCurrentPage(prevPage);
            if (pdfRef.current && typeof pdfRef.current.setPage === 'function') {
                pdfRef.current.setPage(prevPage);
            }
        } else {
            // console.log('Already at first page, current index:', currentIndex);
        }
    };

    const getCurrentPageIndex = () => {
        const index = dailyPagesOnly.indexOf(currentPage);
        // console.log('Current page index calculation:', { currentPage, dailyPagesOnly, index });
        return index >= 0 ? index + 1 : 1; // Return 1-based index for display
    };

    const handleBackToLanguages = () => {
        setSelectedLanguage(null);
        setShowLanguageList(true);
        setPdfUrl(null);
        const firstDailyPage = pagesToShow[0]; // Reset to first daily page (cover)
        // console.log('Resetting to first daily page:', firstDailyPage);
        setCurrentPage(firstDailyPage);
        setError(null);
    };

    const handleFreeTrialSuccess = () => {
        if (selectedLanguage) {
            loadPdf(selectedLanguage);
        }
    };

    // Check if we're in the free trial promotional period (until Dec 31, 2025)
    const isInFreeTrialPeriod = () => {
        const currentDate = new Date();
        const freeTrialEndDate = new Date('2025-12-31T23:59:59');
        return currentDate <= freeTrialEndDate;
    };

    const filteredLanguages = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return languages;
        return languages.filter(lang => lang.label.toLowerCase().includes(q));
    }, [languages, searchQuery]);

    // Render language item
    const LanguageItem = React.memo(({ item }: { item: DailyRhapsodyLanguage }) => {
        const accessCheck = DailyReadingUtils.checkLanguageAccess(
            item,
            subscriptionDetails?.language || [],
            subscriptionDetails?.status
        );

        return (
            <TouchableOpacity
                style={[
                    styles.languageItem,
                    item.type === 'subscription' && !accessCheck.hasAccess && styles.premiumLanguageItem
                ]}
                onPress={() => handleLanguageSelect(item)}
            >
                <View style={styles.languageItemContent}>
                    <View style={styles.languageInfo}>
                        <Text style={[styles.languageLabel, { color: colors.text }]}>
                            {item.label}
                        </Text>
                        <View style={styles.languageStatus}>
                            {item.type === 'open' ? (
                                <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={[styles.statusText, { color: colors.primary }]}>Free</Text>
                                </View>
                            ) : (
                                <View style={[styles.statusBadge, { backgroundColor: '#FF6B3520' }]}>
                                    <Text style={[styles.statusText, { color: '#FF6B35' }]}>Premium</Text>
                                </View>
                            )}
                            {accessCheck.hasAccess && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            )}
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>
            </TouchableOpacity>
        );
    });

    const renderLanguageItem = useCallback(
        ({ item }: { item: DailyRhapsodyLanguage }) => <LanguageItem item={item} />,
        [colors.primary, colors.text, colors.textLight, subscriptionDetails]
    );

    const getItemLayout = useCallback(
        (_: any, index: number) => ({ length: 72, offset: 72 * index, index }),
        []
    );

    // Show loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={[colors.primary, colors.secondary || colors.primary]} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Daily Rhapsody</Text>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textLight }]}>
                        Loading languages...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state
    if (error && !selectedLanguage) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={[colors.primary, colors.secondary || colors.primary]} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Daily Rhapsody</Text>
                </LinearGradient>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
                    <Text style={[styles.errorTitle, { color: colors.text }]}>Error Loading Languages</Text>
                    <Text style={[styles.errorMessage, { color: colors.textLight }]}>{error}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchLanguages}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Render different views based on state
    if (selectedLanguage && pdfUrl && !showLanguageList) {
        // PDF Reading View - full screen like read/[code]
        return (
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <LinearGradient
                    colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                    style={styles.header}
                >
                    <TouchableOpacity style={styles.backButton} onPress={handleBackToLanguages}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>{selectedLanguage.label}</Text>
                        <Text style={styles.headerSubtitle}>Day {dailyInfo.dayOfMonth} • Daily Reading</Text>
                    </View>
                    <View style={styles.headerSpacer} />
                </LinearGradient>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <LinearGradient
                            colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                            style={[styles.progressFill, { width: `${(getCurrentPageIndex() / dailyPagesOnly.length) * 100}%` }]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        Page {getCurrentPageIndex()} of {dailyPagesOnly.length} ({((getCurrentPageIndex() / dailyPagesOnly.length) * 100).toFixed(0)}%)
                    </Text>
                </View>

                {/* Navigation Controls */}
                {/* *<View style={styles.navigationContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.navigationButton,
                            getCurrentPageIndex() <= 1 && styles.disabledButton
                        ]}
                        onPress={goToPreviousPage}
                        disabled={getCurrentPageIndex() <= 1}
                    >
                        <Ionicons 
                            name="chevron-back" 
                            size={24} 
                            color={getCurrentPageIndex() <= 1 ? colors.textLight : "#FFFFFF"}
                        />
                        <Text style={[
                            styles.navigationButtonText,
                            getCurrentPageIndex() <= 1 && styles.disabledButtonText
                        ]}>
                            Previous
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.pageIndicator}>
                        <Text style={styles.pageText}>{getCurrentPageIndex()} / {dailyPagesOnly.length}</Text>
                        <Text style={styles.pageTypeText}>
                            {currentPage === dailyInfo.coverPage ? 'Cover' : 'Article'}
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.navigationButton,
                            getCurrentPageIndex() >= dailyPagesOnly.length && styles.disabledButton
                        ]}
                        onPress={goToNextPage}
                        disabled={getCurrentPageIndex() >= dailyPagesOnly.length}
                    >
                        <Text style={[
                            styles.navigationButtonText,
                            getCurrentPageIndex() >= dailyPagesOnly.length && styles.disabledButtonText
                        ]}>
                            Next
                        </Text>
                        <Ionicons 
                            name="chevron-forward" 
                            size={24} 
                            color={getCurrentPageIndex() >= dailyPagesOnly.length ? colors.textLight : "#FFFFFF"}
                        />
                    </TouchableOpacity>
                </View> */}
                
                

                {/* PDF Reader */}
                <View style={styles.pdfContainer}>
                    {pdfLoading ? (
                        <View style={styles.pdfLoadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.pdfLoadingText, { color: colors.textLight }]}>
                                Loading daily reading...
                            </Text>
                        </View>
                    ) : (
                        <Pdf
                            ref={pdfRef}
                            source={{ 
                                uri: pdfUrl,
                                cache: true,
                                headers: {
                                    'Accept': 'application/pdf',
                                    'User-Agent': 'TNI-BouquetApp/1.0',
                                },
                            }}
                            trustAllCerts={false}
                            onLoadComplete={(numberOfPages) => {
                                // console.log('PDF loaded with', numberOfPages, 'pages');
                                // console.log('Daily pages to show:', dailyPagesOnly);
                                // console.log('Current page on load:', currentPage);
                                
                                // Ensure we start on a valid daily page
                                if (!dailyPagesOnly.includes(currentPage)) {
                                    const firstDailyPage = dailyPagesOnly[0];
                                    // console.log('Setting to first daily page:', firstDailyPage);
                                    setCurrentPage(firstDailyPage);
                                }
                            }}
                            onPageChanged={(page) => {
                                // console.log('Page change attempt to:', page, 'Allowed daily pages:', dailyPagesOnly);
                                
                                // STRICT: Only allow pages within our daily selection
                                if (dailyPagesOnly.includes(page)) {
                                    setCurrentPage(page);
                                    // console.log('Page change allowed to:', page);
                                } else {
                                    // Prevent navigation to unauthorized pages
                                    // console.log('Page change blocked for:', page, 'staying on:', currentPage);
                                    // Force PDF back to current valid page
                                    setTimeout(() => {
                                        if (!dailyPagesOnly.includes(currentPage)) {
                                            setCurrentPage(dailyPagesOnly[0]);
                                        }
                                    }, 100);
                                }
                            }}
                            onError={(error) => {
                                console.error('PDF Error:', error);
                                const errorMessage = (error as any)?.message || String(error) || 'Failed to load PDF';
                                setError(`PDF loading failed: ${errorMessage}`);
                            }}
                            onLoadProgress={(percent) => {
                                // console.log('PDF loading progress:', percent);
                            }}
                            style={styles.pdf}
                            page={currentPage}
                            horizontal={false}
                            enablePaging={false}  // Disable gesture-based page navigation
                            spacing={0}
                            enableAnnotationRendering={false}
                            enableAntialiasing={true}
                            enableDoubleTapZoom={false}  // Disable zooming to prevent scrolling
                            fitPolicy={1}  // Fit to height - entire page fits on screen
                            minScale={1.0}  // Prevent manual zoom out
                            maxScale={1.0}  // Prevent manual zoom in - locks scale at 100%
                            singlePage={false}  // Show only one page at a time
                            onPageSingleTap={() => {
                                // console.log('Daily page tapped');
                            }}
                        />
                    )}
                </View>

                
            </SafeAreaView>
        );
    }

    // Language Selection View or Access Denial
    return (
        <SafeAreaView style={styles.container}>
            {showLanguageList ? (
                // Language List View
                <>
                    {/* Header */}
                    <LinearGradient colors={[colors.primary, colors.secondary || colors.primary]} style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => router.back()} 
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Daily Rhapsody</Text>
                            <Text style={styles.headerSubtitle}>
                                {DailyReadingUtils.formatDayDisplay(dailyInfo.dayOfMonth)} • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.myLanguagesButton}
                            onPress={() => router.push('./my-languages')}
                        >
                            <Ionicons name="library" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Language Selection View */}
                    <View style={styles.languageListContainer}>
                        <View style={styles.searchContainer}>
                            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="search" size={20} color={colors.textLight} />
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search languages..."
                                    placeholderTextColor={colors.textLight}
                                    style={[styles.searchInput, { color: colors.text }]}
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    clearButtonMode="while-editing"
                                />
                            </View>
                        </View>

                        <FlatList
                            data={filteredLanguages}
                            renderItem={renderLanguageItem}
                            keyExtractor={(item) => item.label}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.languageList}
                            initialNumToRender={20}
                            maxToRenderPerBatch={20}
                            updateCellsBatchingPeriod={50}
                            windowSize={10}
                            removeClippedSubviews
                            getItemLayout={getItemLayout}
                        />
                    </View>
                </>
            ) : (
                // Notification View for premium languages without access
                selectedLanguage && !pdfLoading && !pdfUrl ? (
                    <ScrollView style={styles.notificationContainer} contentContainerStyle={styles.notificationContent}>
                        <View style={styles.notificationCard}>
                            <LinearGradient
                                colors={['#FF6B3520', '#FF6B3510']}
                                style={styles.notificationGradient}
                            >
                                <View style={styles.notificationIcon}>
                                    <Ionicons name="lock-closed" size={40} color="#FF6B35" />
                                    </View>
                                    
                                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                                        Premium Language
                                    </Text>
                                    
                                    <Text style={[styles.notificationMessage, { color: colors.textLight }]}>
                                        {selectedLanguage && DailyReadingUtils.checkLanguageAccess(
                                            selectedLanguage,
                                            subscriptionDetails?.language || [],
                                            subscriptionDetails?.status
                                        ).reason}
                                    </Text>

                                    <View style={styles.actionButtons}>
                                        {hasFreeTrialActive ? (
                                            <FreeTrialActivatedBadge
                                                variant="gradient"
                                                showDate={true}
                                                style={styles.freeTrialButton}
                                            />
                                        ) : (
                                            <StartFreeTrialButton
                                                onSuccess={handleFreeTrialSuccess}
                                                redirectToSubscriptions={false}
                                                text="Start Free Trial"
                                                variant="gradient"
                                                style={styles.freeTrialButton}
                                            />
                                        )}
                                        
                                        {!isInFreeTrialPeriod() && (
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: colors.secondary || colors.primary }]}
                                                onPress={() => router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/buy')}
                                            >
                                                <Ionicons name="card" size={20} color="#FFFFFF" />
                                                <Text style={styles.actionButtonText}>Purchase</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.closeButton, { borderColor: colors.border }]}
                                            onPress={handleBackToLanguages}
                                        >
                                            <Ionicons name="close" size={20} color={colors.text} />
                                            <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                            </View>
                    </ScrollView>
                ) : null
            )}
        </SafeAreaView>
    );
}

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
        minHeight: 60,
        width: '100%',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    myLanguagesButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginLeft: 8,
    },
    headerContent: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    progressContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    retryButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    languageListContainer: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    languageList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    languageItem: {
        backgroundColor: colors.card,
        marginBottom: 8,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    premiumLanguageItem: {
        borderColor: '#FF6B3530',
        backgroundColor: '#FF6B3508',
    },
    languageItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    languageInfo: {
        flex: 1,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    languageStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    notificationContainer: {
        flex: 1,
    },
    notificationContent: {
        padding: 16,
        justifyContent: 'center',
        minHeight: screenHeight * 0.6,
    },
    notificationCard: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    notificationGradient: {
        padding: 24,
        alignItems: 'center',
    },
    notificationIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF6B3520',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    notificationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    notificationMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    actionButtons: {
        width: '100%',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    pdfContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
    },
    pdfViewContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerSpacer: {
        width: 40,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(248, 250, 252, 0.98)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
        width: '100%',
    },
    navigationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
        minWidth: 100,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: colors.border,
    },
    navigationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButtonText: {
        color: colors.textLight,
    },
    pageText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    pdfLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingBottom: 50,
    },
    pdfLoadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
    pdf: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
    },
    pdfNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(248, 250, 252, 0.98)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
        width: '100%',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
        minWidth: 100,
        justifyContent: 'center',
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    pageIndicator: {
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pageIndicatorText: {
        fontSize: 16,
        fontWeight: '600',
    },
    pageTypeText: {
        fontSize: 12,
        marginTop: 2,
    },
    freeTrialButton: {
        width: '100%',
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
        backgroundColor: 'transparent',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

