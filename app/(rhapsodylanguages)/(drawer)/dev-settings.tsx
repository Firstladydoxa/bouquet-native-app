import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WELCOME_SHOWN_KEY = '@rhapsody_welcome_shown';
const TOUR_COMPLETED_KEY = '@rhapsody_tour_completed';

export default function DevSettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const handleResetWelcome = async () => {
        Alert.alert(
            'Reset Welcome Screen',
            'This will show the welcome screen again on next app start. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(WELCOME_SHOWN_KEY);
                            Alert.alert('Success', 'Welcome screen reset successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset welcome screen');
                        }
                    },
                },
            ]
        );
    };

    const handleResetTour = async () => {
        Alert.alert(
            'Reset App Tour',
            'This will show the app tour again. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(TOUR_COMPLETED_KEY);
                            Alert.alert(
                                'Success',
                                'App tour reset successfully. Please restart the app to see the tour.'
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset app tour');
                        }
                    },
                },
            ]
        );
    };

    const handleResetAll = async () => {
        Alert.alert(
            'Reset Everything',
            'This will reset welcome screen and app tour. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove([
                                WELCOME_SHOWN_KEY,
                                TOUR_COMPLETED_KEY,
                            ]);
                            Alert.alert(
                                'Success',
                                'All onboarding elements reset successfully. Please restart the app.'
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Developer Settings
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Onboarding Controls
                    </Text>
                    <Text style={[styles.sectionDescription, { color: colors.textLight }]}>
                        Reset welcome screen and app tour for testing
                    </Text>

                    <TouchableOpacity
                        style={[styles.actionButton, { borderColor: colors.border }]}
                        onPress={handleResetWelcome}
                    >
                        <LinearGradient
                            colors={[colors.primary + '20', colors.primary + '10']}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="refresh" size={24} color={colors.primary} />
                            <View style={styles.buttonContent}>
                                <Text style={[styles.buttonTitle, { color: colors.text }]}>
                                    Reset Welcome Screen
                                </Text>
                                <Text style={[styles.buttonSubtitle, { color: colors.textLight }]}>
                                    Show welcome screen on next launch
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { borderColor: colors.border }]}
                        onPress={handleResetTour}
                    >
                        <LinearGradient
                            colors={[colors.secondary + '20', colors.secondary + '10']}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="map" size={24} color={colors.secondary} />
                            <View style={styles.buttonContent}>
                                <Text style={[styles.buttonTitle, { color: colors.text }]}>
                                    Reset App Tour
                                </Text>
                                <Text style={[styles.buttonSubtitle, { color: colors.textLight }]}>
                                    Show step-by-step tour again
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { borderColor: colors.border }]}
                        onPress={handleResetAll}
                    >
                        <LinearGradient
                            colors={['#EF4444' + '20', '#EF4444' + '10']}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="trash" size={24} color="#EF4444" />
                            <View style={styles.buttonContent}>
                                <Text style={[styles.buttonTitle, { color: colors.text }]}>
                                    Reset Everything
                                </Text>
                                <Text style={[styles.buttonSubtitle, { color: colors.textLight }]}>
                                    Clear all onboarding data
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        These settings are for development and testing purposes only.
                        Restart the app after resetting to see the changes.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 20,
    },
    actionButton: {
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    buttonContent: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    buttonSubtitle: {
        fontSize: 13,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
});
