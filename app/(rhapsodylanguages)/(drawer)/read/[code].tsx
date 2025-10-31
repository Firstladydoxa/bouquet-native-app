import CustomLoader from '@/components/ui/CustomLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { RhapsodyLanguagesAPI } from '@/services/rhapsodylanguagesApi';
import { useSubscriptionService } from '@/services/subscriptionService';
import DailyReadingUtils from '@/utils/dailyReadingUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    const [languageData, setLanguageData] = useState<any | null>(null);
    const [accessChecked, setAccessChecked] = useState(false);

    // Calculate daily reading pages (3 pages total: cover + 2 article pages)
    const dailyInfo = DailyReadingUtils.getDailyReadingPages();
    const allowedPages = DailyReadingUtils.getDailyReadingPageNumbers();
    
    // For read/[code], allow full document navigation (not restricted to daily pages)
    // Only validate pages exist in the PDF
    const validAllowedPages = totalPages > 0 ? Array.from({ length: totalPages }, (_, i) => i + 1) : [];
    const totalDailyPages = totalPages; // Use actual PDF total

    // Validate subscription access - only after language data is loaded
    const accessResult = languageData 
        ? subscriptionService.checkLanguageAccess(languageData)
        : { hasAccess: false, message: 'Loading...' };

    // Get current page index within the allowed pages (0-based)
    const getCurrentPageIndex = () => {
        const pageIndex = validAllowedPages.indexOf(currentPage);
        return pageIndex >= 0 ? pageIndex : 0;
    };

    // Navigate to next page within daily restrictions
    const goToNextPage = () => {
        const currentIndex = getCurrentPageIndex();
        if (currentIndex < validAllowedPages.length - 1) {
            setCurrentPage(validAllowedPages[currentIndex + 1]);
        }
    };

    // Navigate to previous page within daily restrictions  
    const goToPreviousPage = () => {
        const currentIndex = getCurrentPageIndex();
        if (currentIndex > 0) {
            setCurrentPage(validAllowedPages[currentIndex - 1]);
        }
    };

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

    const fetchPdfFile = async () => {
        try {
            setLoading(true);
            setError(null);

            const fileName = await RhapsodyLanguagesAPI.fetchLanguageFile({
                user_id: String(user!.id), // Convert number to string
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
                
                // Skip URL validation for now due to certificate issues
                // The PDF component will handle the loading directly
                console.log('Using direct PDF URL streaming');
                setPdfUrl(remotePdfUrl);
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
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
                        <Text style={styles.headerSubtitle}>Today's Reading</Text>
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
                            style={[styles.progressFill, { width: `${totalDailyPages > 0 ? ((getCurrentPageIndex() + 1) / totalDailyPages) * 100 : 0}%` }]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        Page {getCurrentPageIndex() + 1} of {totalDailyPages} ({totalDailyPages > 0 ? (((getCurrentPageIndex() + 1) / totalDailyPages) * 100).toFixed(0) : 0}%)
                    </Text>
                </View>

                {/* PDF Reader */}
                <View style={styles.pdfContainer}>
                    <Pdf
                        source={{ 
                            uri: pdfUrl,
                            cache: false,
                            headers: {
                                'Accept': 'application/pdf',
                                'User-Agent': 'TNI-BouquetApp/1.0',
                            },
                        }}
                        trustAllCerts={false}
                        onLoadComplete={(numberOfPages) => {
                            console.log('PDF loaded successfully:', numberOfPages, 'pages');
                            setTotalPages(numberOfPages);
                            // Start with page 1
                            setCurrentPage(1);
                        }}
                        onPageChanged={(page) => {
                            console.log('Page change requested to:', page);
                            
                            // Allow navigation to any valid page in the PDF
                            //if (page >= 1 && page <= totalPages) {
                            //    console.log('Page change allowed to:', page);
                            //   setCurrentPage(page);
                            //} else {
                            //    console.log('Page change denied to:', page, 'Valid range: 1-', totalPages);
                            //}
                        }}
                        onError={(error) => {
                            console.error('PDF Error:', error);
                            const errorMessage = (error as any)?.message || String(error) || 'Failed to load PDF';
                            console.log('Setting error:', errorMessage);
                            setError(`PDF loading failed: ${errorMessage}`);
                        }}
                        onLoadProgress={(percent) => {
                            console.log('PDF loading progress:', percent);
                        }}
                        style={styles.pdf}
                        page={currentPage}
                        horizontal={false}
                        enablePaging={false}  // Enable paging for controlled navigation
                        spacing={10}
                        enableAnnotationRendering={false}
                        enableAntialiasing={true}
                        enableDoubleTapZoom={true}
                        fitPolicy={1}  // Fit to screen width
                        minScale={0.5}
                        maxScale={3.0}
                        singlePage={false}  // Show one page at a time for better control
                        onPageSingleTap={() => {
                            console.log('Daily reading page tapped');
                        }}
                    />
                </View>

                {/* Navigation Controls */}
                {/* <View style={styles.navigationContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.navigationButton,
                            getCurrentPageIndex() <= 0 && styles.disabledButton
                        ]}
                        onPress={goToPreviousPage}
                        disabled={getCurrentPageIndex() <= 0}
                    >
                        <Ionicons 
                            name="chevron-back" 
                            size={24} 
                            color={getCurrentPageIndex() <= 0 ? colors.textLight : "#FFFFFF"}
                        />
                        <Text style={[
                            styles.navigationButtonText,
                            getCurrentPageIndex() <= 0 && styles.disabledButtonText
                        ]}>
                            Previous
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.pageIndicator}>
                        <Text style={styles.pageText}>{getCurrentPageIndex() + 1} / {totalDailyPages}</Text>
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.navigationButton,
                            getCurrentPageIndex() >= totalDailyPages - 1 && styles.disabledButton
                        ]}
                        onPress={goToNextPage}
                        disabled={getCurrentPageIndex() >= totalDailyPages - 1}
                    >
                        <Text style={[
                            styles.navigationButtonText,
                            getCurrentPageIndex() >= totalDailyPages - 1 && styles.disabledButtonText
                        ]}>
                            Next
                        </Text>
                        <Ionicons 
                            name="chevron-forward" 
                            size={24} 
                            color={getCurrentPageIndex() >= totalDailyPages - 1 ? colors.textLight : "#FFFFFF"}
                        />
                    </TouchableOpacity>
                </View> */}
                
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
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
        width: '100%',
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
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
    },
    pdf: {
        flex: 1,
        width: '100%',
        height: '100%',
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
