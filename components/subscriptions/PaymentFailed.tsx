import { useThemeColors } from "@/hooks/use-themed-styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaymentFailedProps {
    title?: string;
    message?: string;
    errorDetails?: string;
    retryButtonText?: string;
    cancelButtonText?: string;
    onRetry?: () => void;
    onCancel?: () => void;
    redirectPath?: string;
}

export default function PaymentFailed({
    title = "Payment Failed",
    message = "We couldn't process your payment. Please try again.",
    errorDetails,
    retryButtonText = "Try Again",
    cancelButtonText = "Go Back",
    onRetry,
    onCancel,
    redirectPath = "/(rhapsodylanguages)/(drawer)/(tabs)",
}: PaymentFailedProps) {
    const colors = useThemeColors();
    const router = useRouter();
    const styles = createStyles(colors);

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else if (redirectPath) {
            router.push(redirectPath as any);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Error Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                        <Ionicons name="close-circle" size={80} color={colors.error || '#f44336'} />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Main Message */}
                <Text style={styles.message}>{message}</Text>

                {/* Error Details Card */}
                {errorDetails && (
                    <View style={styles.errorCard}>
                        <Ionicons name="alert-circle-outline" size={24} color={colors.error || '#f44336'} />
                        <Text style={styles.errorText}>{errorDetails}</Text>
                    </View>
                )}

                {/* Common Reasons */}
                <View style={styles.reasonsCard}>
                    <Text style={styles.reasonsTitle}>Common reasons for payment failure:</Text>
                    <View style={styles.reasonsList}>
                        <View style={styles.reasonItem}>
                            <Ionicons name="ellipse" size={6} color={colors.textLight} />
                            <Text style={styles.reasonText}>Insufficient funds in account</Text>
                        </View>
                        <View style={styles.reasonItem}>
                            <Ionicons name="ellipse" size={6} color={colors.textLight} />
                            <Text style={styles.reasonText}>Card expired or invalid</Text>
                        </View>
                        <View style={styles.reasonItem}>
                            <Ionicons name="ellipse" size={6} color={colors.textLight} />
                            <Text style={styles.reasonText}>Incorrect card details</Text>
                        </View>
                        <View style={styles.reasonItem}>
                            <Ionicons name="ellipse" size={6} color={colors.textLight} />
                            <Text style={styles.reasonText}>Network connection issue</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                {onRetry && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[colors.primary || '#3B82F6', colors.secondary || '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.retryButtonText}>{retryButtonText}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
                </TouchableOpacity>

                {/* Support Notice */}
                <View style={styles.supportCard}>
                    <Ionicons name="help-circle-outline" size={20} color={colors.info || '#2196F3'} />
                    <Text style={styles.supportText}>
                        Need help? Contact our support team for assistance.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconBackground: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.error ? colors.error + '15' : '#f4433615',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    errorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error ? colors.error + '15' : '#f4433615',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
        gap: 12,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: colors.error || '#f44336',
        fontWeight: '500',
        lineHeight: 20,
    },
    reasonsCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 32,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reasonsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    reasonsList: {
        gap: 10,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    reasonText: {
        fontSize: 14,
        color: colors.textLight,
        flex: 1,
    },
    retryButton: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 12,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        gap: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    cancelButton: {
        padding: 16,
        marginBottom: 24,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textLight,
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info ? colors.info + '15' : '#2196F315',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    supportText: {
        flex: 1,
        fontSize: 13,
        color: colors.textLight,
        lineHeight: 18,
    },
});
