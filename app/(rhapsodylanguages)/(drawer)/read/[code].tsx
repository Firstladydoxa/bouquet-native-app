import CustomLoader from '@/components/ui/CustomLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { RhapsodyLanguagesAPI } from '@/services/rhapsodylanguagesApi';
import { useSubscriptionService } from '@/services/subscriptionService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReadPage() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const colors = useThemeColors();
    const { user } = useAuth();
    const subscriptionService = useSubscriptionService();
    const styles = createStyles(colors);

    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [dailyArticlePage, setDailyArticlePage] = useState(6); // Default start page
    const [isFlipping, setIsFlipping] = useState(false);
    const [languageData, setLanguageData] = useState<any | null>(null);
    const [accessChecked, setAccessChecked] = useState(false);

    // Calculate daily article pages
    const getDailyArticlePages = () => {
        const today = new Date();
        const dayOfMonth = today.getDate();
        
        // Each article is 2 pages, starting from page 6
        // Day 1: pages 6-7, Day 2: pages 8-9, etc.
        const startPage = 5 + (dayOfMonth * 2) - 1; // -1 because we want page 6 for day 1
        const endPage = startPage + 1;
        
        return { startPage, endPage, dayOfMonth };
    };

    const { startPage, endPage, dayOfMonth } = getDailyArticlePages();

    // Validate subscription access - only after language data is loaded
    const accessResult = languageData 
        ? subscriptionService.checkLanguageAccess(languageData)
        : { hasAccess: false, message: 'Loading...' };

    // Fetch language metadata to check type (open vs subscription)
    useEffect(() => {
        const fetchLanguageData = async () => {
            if (!code) return;
            
            try {
                // Fetch all languages to find this one
                const languages = await RhapsodyLanguagesAPI.fetchRorlanguagesByName();
                const language = languages.find((lang: any) => lang.value === decodeURIComponent(code));
                
                if (language) {
                    setLanguageData(language);
                } else {
                    // If not found, create a default open language object
                    setLanguageData({
                        value: code,
                        label: decodeURIComponent(code),
                        type: 'open',
                        read: '1',
                        listen: '0',
                        watch: '0',
                    });
                }
            } catch (err) {
                console.error('Error fetching language data:', err);
                // Default to open type if we can't fetch
                setLanguageData({
                    value: code,
                    label: decodeURIComponent(code),
                    type: 'open',
                    read: '1',
                    listen: '0',
                    watch: '0',
                });
            } finally {
                setAccessChecked(true);
            }
        };

        fetchLanguageData();
    }, [code]);

    useEffect(() => {
        if (user && code && accessChecked && accessResult.hasAccess) {
            fetchPdfFile();
        }
    }, [user, code, accessChecked, accessResult.hasAccess]);

    useEffect(() => {
        // Set initial page to today's article
        setCurrentPage(startPage);
        setDailyArticlePage(startPage);
    }, [startPage]);

    const fetchPdfFile = async () => {
        try {
            setLoading(true);
            setError(null);

            const fileName = await RhapsodyLanguagesAPI.fetchLanguageFile({
                user_id: user!.id,
                type: 'read',
                language: decodeURIComponent(code!),
            });

            if (fileName) {
                // Properly encode the filename for URL - important for filenames with spaces
                const encodedFileName = encodeURIComponent(fileName);
                const remotePdfUrl = `https://mediathek.tniglobal.org/read/${encodedFileName}`;
                console.log('Original filename:', fileName);
                console.log('Encoded filename:', encodedFileName);
                console.log('Testing PDF URL:', remotePdfUrl);
                
                // Test if the remote URL is accessible before using it
                try {
                    const testResponse = await fetch(remotePdfUrl, { 
                        method: 'HEAD' // Only check headers, don't download content
                    });
                    
                    console.log('PDF URL test response:', testResponse.status, testResponse.headers.get('content-type'));
                    
                    if (testResponse.ok && testResponse.headers.get('content-type')?.includes('pdf')) {
                        // URL is valid and serves PDF content - use direct streaming
                        console.log('PDF URL is valid, using direct streaming');
                        setPdfUrl(remotePdfUrl);
                    } else {
                        throw new Error(`Invalid PDF response: ${testResponse.status}`);
                    }
                } catch (urlTestError: any) {
                    console.error('PDF URL test failed:', urlTestError);
                    setError(`Unable to access PDF file: ${urlTestError.message}`);
                }
            } else {
                setError('PDF file not found for this language');
            }
        } catch (err: any) {
            console.error('Error fetching PDF file:', err);
            setError(err.message || 'Failed to load PDF file');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number, numberOfPages: number) => {
        setCurrentPage(page);
        setTotalPages(numberOfPages);
    };

    const goToPreviousPage = () => {
        if (currentPage > startPage) {
            setIsFlipping(true);
            setCurrentPage(currentPage - 1);
            setTimeout(() => setIsFlipping(false), 300);
        }
    };

    const goToNextPage = () => {
        if (currentPage < endPage) {
            setIsFlipping(true);
            setCurrentPage(currentPage + 1);
            setTimeout(() => setIsFlipping(false), 300);
        }
    };

    const getPageProgress = () => {
        const progress = ((currentPage - startPage + 1) / 2) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    // Show loading first while checking access
    if (!accessChecked || loading) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient 
                    colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']} 
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Loading...</Text>
                </LinearGradient>
                <CustomLoader message={`Loading today's Rhapsody article...`} size="large" />
            </SafeAreaView>
        );
    }

    // Only check access after loading is complete
    if (!accessResult.hasAccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Read - {decodeURIComponent(code!)}</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="lock-closed-outline" size={64} color={colors.textLight} />
                    <Text style={styles.errorTitle}>Premium Content</Text>
                    <Text style={styles.errorMessage}>{accessResult.message}</Text>
                    <TouchableOpacity 
                        style={styles.upgradeButton} 
                        onPress={() => router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/')}
                    >
                        <LinearGradient
                            colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !pdfUrl) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient 
                    colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']} 
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Read - {decodeURIComponent(code!)}</Text>
                </LinearGradient>
                <View style={styles.errorContainer}>
                    <Ionicons name="document-outline" size={64} color={colors.textLight} />
                    <Text style={styles.errorTitle}>Document Not Available</Text>
                    <Text style={styles.errorMessage}>{error || 'Unable to load the document'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchPdfFile}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Beautiful Header */}
            <LinearGradient 
                colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']} 
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{decodeURIComponent(code!)}</Text>
                    <Text style={styles.headerSubtitle}>Day {dayOfMonth} • Article</Text>
                </View>
                <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => router.push(`/download/${code}` as any)}
                >
                    <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <LinearGradient
                        colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                        style={[styles.progressFill, { width: `${getPageProgress()}%` }]}
                    />
                </View>
                <Text style={styles.progressText}>
                    Page {currentPage - startPage + 1} of 2
                </Text>
            </View>

            {/* PDF Reader */}
            <View style={styles.pdfContainer}>
                <Pdf
                    source={{ 
                        uri: pdfUrl,
                        cache: false, // Disable caching to prevent local file downloads
                    }}
                    trustAllCerts={true}
                    onLoadComplete={(numberOfPages) => {
                        setTotalPages(numberOfPages);
                    }}
                    onPageChanged={(page) => handlePageChange(page, totalPages)}
                    onError={(error) => {
                        console.error('PDF Error:', error);
                        setError('Failed to load PDF');
                    }}
                    style={[styles.pdf, isFlipping && styles.flippingPdf]}
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
                />
            </View>

            {/* Navigation Controls */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity 
                    style={[
                        styles.navigationButton,
                        currentPage <= startPage && styles.disabledButton
                    ]}
                    onPress={goToPreviousPage}
                    disabled={currentPage <= startPage}
                >
                    <Ionicons 
                        name="chevron-back" 
                        size={24} 
                        color={currentPage <= startPage ? colors.textLight : "#FFFFFF"}
                    />
                    <Text style={[
                        styles.navigationButtonText,
                        currentPage <= startPage && styles.disabledButtonText
                    ]}>
                        Previous
                    </Text>
                </TouchableOpacity>

                <View style={styles.pageIndicator}>
                    <Text style={styles.pageText}>{currentPage - startPage + 1} / 2</Text>
                </View>

                <TouchableOpacity 
                    style={[
                        styles.navigationButton,
                        currentPage >= endPage && styles.disabledButton
                    ]}
                    onPress={goToNextPage}
                    disabled={currentPage >= endPage}
                >
                    <Text style={[
                        styles.navigationButtonText,
                        currentPage >= endPage && styles.disabledButtonText
                    ]}>
                        Next
                    </Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={24} 
                        color={currentPage >= endPage ? colors.textLight : "#FFFFFF"}
                    />
                </TouchableOpacity>
            </View>
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
    downloadButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    progressText: {
        fontSize: 12,
        color: colors.textLight,
        textAlign: 'center',
        fontWeight: '500',
    },
    pdfContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    pdf: {
        flex: 1,
        width: screenWidth,
        height: screenHeight,
        backgroundColor: colors.background,
    },
    flippingPdf: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
    pageIndicator: {
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pageText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
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
        color: colors.text,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
    },
    upgradeButton: {
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    gradientButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    upgradeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: colors.primary,
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
});
