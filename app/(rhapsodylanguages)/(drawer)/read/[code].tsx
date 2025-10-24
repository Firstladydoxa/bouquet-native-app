import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/use-themed-styles";
import { RhapsodyLanguagesAPI } from "@/services/rhapsodylanguagesApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function ReadLanguageScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colors = useThemeColors();
    const { code } = useLocalSearchParams<{ code: string }>();
    
    const [loading, setLoading] = useState(true);
    const [webViewLoading, setWebViewLoading] = useState(true);
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
            Alert.alert('Error', 'Failed to load the document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CustomLoader message="Loading document..." />;
    }

    if (error || !pdfUrl) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Read - {decodeURIComponent(code)}</Text>
                </View>
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/(rhapsodylanguages)/(drawer)/regions/list")} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Read - {decodeURIComponent(code)}</Text>
            </View>
            
            {webViewLoading && (
                <View style={styles.webViewLoader}>
                    <CustomLoader message="Loading PDF viewer..." size="medium" />
                </View>
            )}
            
            <WebView
                source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}` }}
                style={[styles.webview, webViewLoading && styles.hidden]}
                startInLoadIndicatorColor={colors.primary}
                onLoadStart={() => setWebViewLoading(true)}
                onLoadEnd={() => setWebViewLoading(false)}
                onError={() => {
                    setWebViewLoading(false);
                    setError('Failed to load PDF viewer');
                }}
            />
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
    webview: {
        flex: 1,
    },
    webViewLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        zIndex: 10,
    },
    hidden: {
        opacity: 0,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
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
        borderRadius: 20,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
