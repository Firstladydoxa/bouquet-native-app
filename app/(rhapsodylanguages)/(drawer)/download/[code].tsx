import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/use-themed-styles";
import { RhapsodyLanguagesAPI } from "@/services/rhapsodylanguagesApi";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DownloadLanguageScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colors = useThemeColors();
    const { code } = useLocalSearchParams<{ code: string }>();
    
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const styles = createStyles(colors);

    useEffect(() => {
        if (user && code) {
            fetchPdfFile();
        }
    }, [user, code]);

    const fetchPdfFile = async () => {
        try {
            setLoading(true);
            setError(null);

            const fileName = await RhapsodyLanguagesAPI.fetchLanguageFile({
                user_id: user!.id,
                type: 'read',
                language: decodeURIComponent(code),
            });

            if (fileName) {
                const remotePdfUrl = `https://mediathek.tniglobal.org/read/${fileName}`;
                setPdfUrl(remotePdfUrl);
            } else {
                setError('PDF file not found');
            }
        } catch (err: any) {
            console.error('Error fetching PDF:', err);
            setError(err.message || 'Failed to load PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!pdfUrl) return;

        try {
            setDownloading(true);
            setDownloadProgress(0);

            const fileName = `${decodeURIComponent(code).replace(/\s+/g, '_')}.pdf`;
            const fileUri = ((FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory) + fileName;

            const downloadResumable = FileSystem.createDownloadResumable(
                pdfUrl,
                fileUri,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    setDownloadProgress(progress);
                }
            );

            const result = await downloadResumable.downloadAsync();

            if (result) {
                setDownloading(false);
                Alert.alert(
                    'Download Complete',
                    'The file has been downloaded successfully. Would you like to share it?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: 'Share',
                            onPress: () => shareFile(result.uri),
                        },
                    ]
                );
            }
        } catch (err: any) {
            console.error('Download error:', err);
            setDownloading(false);
            Alert.alert('Download Failed', 'Failed to download the file. Please try again.');
        }
    };

    const shareFile = async (uri: string) => {
        try {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Sharing Not Available', 'File sharing is not available on this device.');
            }
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    if (loading) {
        return <CustomLoader message="Preparing download..." size="large" />;
    }

    if (error || !pdfUrl) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Download - {decodeURIComponent(code)}</Text>
                </View>
                <View style={styles.contentContainer}>
                    <Ionicons name="cloud-download-outline" size={64} color={colors.textLight} />
                    <Text style={styles.errorTitle}>File Not Available</Text>
                    <Text style={styles.errorMessage}>{error || 'Unable to prepare the file for download'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchPdfFile}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Download - {decodeURIComponent(code)}</Text>
            </View>
            
            <View style={styles.contentContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text-outline" size={80} color={colors.primary} />
                </View>

                <Text style={styles.title}>{decodeURIComponent(code)}</Text>
                <Text style={styles.subtitle}>Ready to download</Text>

                {downloading ? (
                    <View style={styles.downloadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.progressText}>
                            Downloading... {Math.round(downloadProgress * 100)}%
                        </Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${downloadProgress * 100}%`,
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                        onPress={handleDownload}
                    >
                        <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.downloadButtonText}>Download PDF</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.infoText}>
                    The file will be downloaded to your device and can be shared with other apps.
                </Text>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 32,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 24,
    },
    downloadButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    downloadingContainer: {
        alignItems: 'center',
        gap: 16,
        width: '100%',
    },
    progressText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    infoText: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
