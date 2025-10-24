import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/use-themed-styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function PdfTestScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colors = useThemeColors();
    
    const [loading, setLoading] = useState(false);
    const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
    const [filePath, setFilePath] = useState('read/example.pdf');
    const [error, setError] = useState<string | null>(null);

    const styles = createStyles(colors);

    const fetchPdfBlob = async () => {
        if (!user) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setPdfDataUri(null);

            // Construct PDF URL - using Google Docs viewer for Expo compatibility
            const pdfUrl = `https://mediathek.tniglobal.org/${filePath}`;
            setPdfDataUri(pdfUrl);
            
            Alert.alert('Success', 'PDF loaded successfully!');
        } catch (err: any) {
            console.error('Error fetching PDF:', err);
            setError(err.message || 'Failed to load PDF');
            Alert.alert('Error', 'Failed to load PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CustomLoader message="Fetching PDF from server..." size="large" />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PDF Blob Test</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={32} color={colors.primary} />
                    <Text style={styles.infoTitle}>Test PDF Blob Fetching</Text>
                    <Text style={styles.infoText}>
                        This page demonstrates fetching a PDF file from the backend as a blob
                        and displaying it in the app.
                    </Text>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>File Path on Server:</Text>
                    <TextInput
                        style={styles.input}
                        value={filePath}
                        onChangeText={setFilePath}
                        placeholder="e.g., read/example.pdf"
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.fetchButton}
                    onPress={fetchPdfBlob}
                    activeOpacity={0.8}
                >
                    <Ionicons name="cloud-download-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.fetchButtonText}>Fetch PDF as Blob</Text>
                </TouchableOpacity>

                {error && (
                    <View style={styles.errorCard}>
                        <Ionicons name="alert-circle" size={24} color={colors.error || '#f44336'} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {pdfDataUri && (
                    <View style={styles.pdfPreviewContainer}>
                        <Text style={styles.previewTitle}>PDF Preview:</Text>
                        <View style={styles.pdfWrapper}>
                            <WebView
                                source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfDataUri)}` }}
                                style={styles.pdf}
                                startInLoadIndicatorColor={colors.primary}
                                onError={() => {
                                    setError('Failed to render PDF');
                                }}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.technicalInfo}>
                    <Text style={styles.technicalTitle}>Technical Details:</Text>
                    <Text style={styles.technicalText}>• Fetches PDF file from backend server</Text>
                    <Text style={styles.technicalText}>• Uses Google Docs viewer for Expo compatibility</Text>
                    <Text style={styles.technicalText}>• Displays PDF using WebView component</Text>
                    <Text style={styles.technicalText}>• Works on all platforms (iOS, Android, Web)</Text>
                </View>
            </ScrollView>
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
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    infoCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginTop: 12,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: colors.text,
    },
    fetchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
        padding: 16,
        gap: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 20,
    },
    fetchButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    errorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error ? colors.error + '15' : '#f4433615',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        marginBottom: 20,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: colors.error || '#f44336',
        fontWeight: '500',
    },
    pdfPreviewContainer: {
        marginTop: 20,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    pdfWrapper: {
        height: 400,
        backgroundColor: colors.card,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pdf: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    technicalInfo: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
    },
    technicalTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    technicalText: {
        fontSize: 13,
        color: colors.textLight,
        marginBottom: 6,
        lineHeight: 20,
    },
});
