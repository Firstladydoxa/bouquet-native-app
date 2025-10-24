import { useThemeColors } from "@/hooks/use-themed-styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaymentSuccessProps {
    title?: string;
    message?: string;
    congratsMessage?: string;
    buttonText?: string;
    onButtonPress?: () => void;
    redirectPath?: string;
}

export default function PaymentSuccess({
    title = "Payment Successful!",
    message = "Your payment has been processed successfully.",
    congratsMessage = "Congratulations! You now have access to premium features.",
    buttonText = "Continue",
    onButtonPress,
    redirectPath = "/(rhapsodylanguages)/(drawer)/(tabs)",
}: PaymentSuccessProps) {
    const colors = useThemeColors();
    const router = useRouter();
    const styles = createStyles(colors);

    const handleButtonPress = () => {
        if (onButtonPress) {
            onButtonPress();
        } else if (redirectPath) {
            router.push(redirectPath as any);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={[colors.success || '#4CAF50', colors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconGradient}
                    >
                        <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
                    </LinearGradient>
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Congratulations Message */}
                <View style={styles.congratsCard}>
                    <Ionicons name="trophy" size={32} color={colors.warning || '#FFC107'} />
                    <Text style={styles.congratsText}>{congratsMessage}</Text>
                </View>

                {/* Details Message */}
                <Text style={styles.message}>{message}</Text>

                {/* Feature List */}
                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle-outline" size={24} color={colors.success || '#4CAF50'} />
                        <Text style={styles.featureText}>Full access to all content</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle-outline" size={24} color={colors.success || '#4CAF50'} />
                        <Text style={styles.featureText}>Download for offline use</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle-outline" size={24} color={colors.success || '#4CAF50'} />
                        <Text style={styles.featureText}>Priority support</Text>
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleButtonPress}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[colors.primary || '#3B82F6', colors.secondary || '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>{buttonText}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Email Confirmation Notice */}
                <View style={styles.noticeCard}>
                    <Ionicons name="mail-outline" size={20} color={colors.info || '#2196F3'} />
                    <Text style={styles.noticeText}>
                        A confirmation email has been sent to your inbox.
                    </Text>
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
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconGradient: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 24,
        textAlign: 'center',
    },
    congratsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning ? colors.warning + '15' : '#FFC10715',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        gap: 12,
        width: '100%',
    },
    congratsText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        lineHeight: 22,
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    featuresList: {
        width: '100%',
        marginBottom: 32,
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
    },
    button: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 24,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        gap: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    noticeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info ? colors.info + '15' : '#2196F315',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        color: colors.textLight,
        lineHeight: 18,
    },
});
