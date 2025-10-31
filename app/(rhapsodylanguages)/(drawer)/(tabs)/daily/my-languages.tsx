import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { MediaAPI } from '@/services/mediaApi';
import { DailyRhapsodyLanguage } from '@/types';
import DailyReadingUtils from '@/utils/dailyReadingUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const { width: screenWidth } = Dimensions.get('window');

export default function MyLanguagesDailyReading() {
    const router = useRouter();
    const { user } = useAuth();
    const { subscriptionDetails } = useSubscription();
    const colors = useThemeColors();
    
    // State management
    const [allLanguages, setAllLanguages] = useState<DailyRhapsodyLanguage[]>([]);
    const [myLanguages, setMyLanguages] = useState<DailyRhapsodyLanguage[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<DailyRhapsodyLanguage | null>(null);
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showLanguageList, setShowLanguageList] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Daily reading calculations
    const dailyInfo = DailyReadingUtils.getDailyReadingPages();
    const pagesToShow = DailyReadingUtils.getDailyReadingPageNumbers();
    const progress = DailyReadingUtils.getMonthlyProgress(dailyInfo.dayOfMonth);

    const styles = createStyles(colors);

    // Fetch and filter languages on component mount
    useEffect(() => {
        fetchAndFilterLanguages();
    }, [subscriptionDetails]);

    const fetchAndFilterLanguages = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const languageData = await MediaAPI.fetchRhapsodyLanguages();
            setAllLanguages(languageData);
            
            // Filter to only show languages the user has access to
            const accessibleLanguages = languageData.filter(language => {
                const accessCheck = DailyReadingUtils.checkLanguageAccess(
                    language,
                    subscriptionDetails?.language || [],
                    subscriptionDetails?.status
                );
                return accessCheck.hasAccess;
            });

            // Sort accessible languages alphabetically
            const sortedAccessibleLanguages = accessibleLanguages.sort((a, b) => 
                a.label.localeCompare(b.label)
            );
            
            setMyLanguages(sortedAccessibleLanguages);
            console.log('Accessible languages:', sortedAccessibleLanguages.length);
            
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
        
        // Since we're in MyLanguages, user should have access, but double-check
        const accessCheck = DailyReadingUtils.checkLanguageAccess(
            language,
            subscriptionDetails?.language || [],
            subscriptionDetails?.status
        );

        if (!accessCheck.hasAccess) {
            setError('Access denied to this language');
            return;
        }

        // Load PDF
        await loadPdf(language);
    };

    const loadPdf = async (language: DailyRhapsodyLanguage) => {
        try {
            setPdfLoading(true);
            setError(null);
            
            const pdfUrl = DailyReadingUtils.buildPdfUrl(language.file_name);
            console.log('Loading PDF (streaming):', pdfUrl);
            
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
        // Only allow navigation within allowed pages
        if (pagesToShow.includes(page)) {
            setCurrentPage(page);
        }
    };

    const goToNextPage = () => {
        const currentIndex = pagesToShow.indexOf(currentPage);
        if (currentIndex < pagesToShow.length - 1) {
            setCurrentPage(pagesToShow[currentIndex + 1]);
        }
    };

    const goToPreviousPage = () => {
        const currentIndex = pagesToShow.indexOf(currentPage);
        if (currentIndex > 0) {
            setCurrentPage(pagesToShow[currentIndex - 1]);
        }
    };

    const getCurrentPageIndex = () => {
        return pagesToShow.indexOf(currentPage) + 1;
    };

    const handleBackToLanguages = () => {
        setSelectedLanguage(null);
        setShowLanguageList(true);
        setPdfUrl(null);
        setCurrentPage(1);
        setError(null);
    };

    const filteredLanguages = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return myLanguages;
        return myLanguages.filter(lang => lang.label.toLowerCase().includes(q));
    }, [myLanguages, searchQuery]);

    // Render language item
    const LanguageItem = React.memo(({ item }: { item: DailyRhapsodyLanguage }) => (
        <TouchableOpacity style={styles.languageItem} onPress={() => handleLanguageSelect(item)}>
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
                            <View style={[styles.statusBadge, { backgroundColor: '#4CAF5020' }]}>
                                <Text style={[styles.statusText, { color: '#4CAF50' }]}>Premium</Text>
                            </View>
                        )}
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
            </View>
        </TouchableOpacity>
    ));

    const renderLanguageItem = useCallback(
        ({ item }: { item: DailyRhapsodyLanguage }) => <LanguageItem item={item} />,
        [colors.primary, colors.text, colors.textLight]
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
                    <Text style={styles.headerTitle}>My Languages</Text>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textLight }]}>
                        Loading your languages...
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
                    <Text style={styles.headerTitle}>My Languages</Text>
                </LinearGradient>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
                    <Text style={[styles.errorTitle, { color: colors.text }]}>Error Loading Languages</Text>
                    <Text style={[styles.errorMessage, { color: colors.textLight }]}>{error}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchAndFilterLanguages}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Show empty state when user has no accessible languages
    if (myLanguages.length === 0 && !loading) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={[colors.primary, colors.secondary || colors.primary]} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Languages</Text>
                </LinearGradient>
                <View style={styles.emptyContainer}>
                    <Ionicons name="library-outline" size={64} color={colors.textLight} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Languages Available</Text>
                    <Text style={[styles.emptyMessage, { color: colors.textLight }]}>
                        You don't have access to any Rhapsody languages yet. Start your free trial or purchase a subscription to begin reading.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.exploreButton, { backgroundColor: colors.primary }]} 
                        onPress={() => router.push('./')}
                    >
                        <Text style={styles.exploreButtonText}>Explore All Languages</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient colors={[colors.primary, colors.secondary || colors.primary]} style={styles.header}>
                <TouchableOpacity 
                    onPress={selectedLanguage ? handleBackToLanguages : () => router.back()} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>
                        {selectedLanguage ? selectedLanguage.label : 'My Languages'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {selectedLanguage ? (
                            <>
                                {DailyReadingUtils.formatDayDisplay(dailyInfo.dayOfMonth)} • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </>
                        ) : (
                            `${myLanguages.length} available language${myLanguages.length !== 1 ? 's' : ''}`
                        )}
                    </Text>
                </View>
                {selectedLanguage && (
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                )}
            </LinearGradient>

            {/* Language Selection View */}
            {showLanguageList && (
                <View style={styles.languageListContainer}>
                    <View style={styles.searchContainer}>
                        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="search" size={20} color={colors.textLight} />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search your languages..."
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
                        ListEmptyComponent={
                            <View style={styles.searchEmptyContainer}>
                                <Ionicons name="search-outline" size={48} color={colors.textLight} />
                                <Text style={[styles.searchEmptyText, { color: colors.textLight }]}>
                                    No languages found matching "{searchQuery}"
                                </Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* PDF Reading View */}
            {selectedLanguage && pdfUrl && !showLanguageList && (
                <View style={styles.pdfContainer}>
                    {pdfLoading ? (
                        <View style={styles.pdfLoadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.pdfLoadingText, { color: colors.textLight }]}>
                                Loading daily reading...
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Pdf
                                source={{ 
                                    uri: pdfUrl,
                                }}
                                onLoadComplete={(numberOfPages) => {
                                    console.log('PDF loaded with', numberOfPages, 'pages');
                                }}
                                onPageChanged={handlePageChange}
                                onError={(error) => {
                                    console.error('PDF Error:', error);
                                    setError('Failed to load PDF');
                                }}
                                style={styles.pdf}
                                page={currentPage}
                                horizontal={false}
                                enablePaging={false}
                                spacing={0}
                                enableAnnotationRendering={true}
                                enableAntialiasing={true}
                                enableDoubleTapZoom={true}
                                fitPolicy={0}
                                minScale={1.0}
                                maxScale={3.0}
                                onLoadProgress={() => {
                                    // No-op: PDF streams directly without caching
                                }}
                            />

                            {/* PDF Navigation */}
                            <View style={[styles.pdfNavigation, { backgroundColor: colors.card }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.navButton,
                                        getCurrentPageIndex() <= 1 && styles.navButtonDisabled
                                    ]}
                                    onPress={goToPreviousPage}
                                    disabled={getCurrentPageIndex() <= 1}
                                >
                                    <Ionicons 
                                        name="chevron-back" 
                                        size={24} 
                                        color={getCurrentPageIndex() <= 1 ? colors.textLight : colors.primary}
                                    />
                                    <Text style={[
                                        styles.navButtonText,
                                        { color: getCurrentPageIndex() <= 1 ? colors.textLight : colors.primary }
                                    ]}>
                                        Previous
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.pageIndicator}>
                                    <Text style={[styles.pageIndicatorText, { color: colors.text }]}>
                                        {getCurrentPageIndex()} / {dailyInfo.totalPages}
                                    </Text>
                                    <Text style={[styles.pageTypeText, { color: colors.textLight }]}>
                                        {currentPage === dailyInfo.coverPage ? 'Cover' : 'Article'}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.navButton,
                                        getCurrentPageIndex() >= dailyInfo.totalPages && styles.navButtonDisabled
                                    ]}
                                    onPress={goToNextPage}
                                    disabled={getCurrentPageIndex() >= dailyInfo.totalPages}
                                >
                                    <Text style={[
                                        styles.navButtonText,
                                        { color: getCurrentPageIndex() >= dailyInfo.totalPages ? colors.textLight : colors.primary }
                                    ]}>
                                        Next
                                    </Text>
                                    <Ionicons 
                                        name="chevron-forward" 
                                        size={24} 
                                        color={getCurrentPageIndex() >= dailyInfo.totalPages ? colors.textLight : colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            )}

            {/* Error state during PDF loading */}
            {selectedLanguage && error && !showLanguageList && (
                <ScrollView style={styles.errorScrollContainer} contentContainerStyle={styles.errorContent}>
                    <View style={styles.pdfErrorContainer}>
                        <Ionicons name="document-text-outline" size={64} color={colors.textLight} />
                        <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to Load PDF</Text>
                        <Text style={[styles.errorMessage, { color: colors.textLight }]}>{error}</Text>
                        <TouchableOpacity 
                            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
                            onPress={() => loadPdf(selectedLanguage)}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    exploreButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exploreButtonText: {
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
    searchEmptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    searchEmptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    pdfContainer: {
        flex: 1,
    },
    pdfLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    pdfLoadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
    pdf: {
        flex: 1,
        width: screenWidth,
        backgroundColor: colors.background,
    },
    pdfNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
    errorScrollContainer: {
        flex: 1,
    },
    errorContent: {
        justifyContent: 'center',
        minHeight: '80%',
    },
    pdfErrorContainer: {
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
});