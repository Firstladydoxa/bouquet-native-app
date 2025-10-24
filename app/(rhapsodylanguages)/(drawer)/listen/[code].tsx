import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/use-themed-styles";
import { RhapsodyLanguagesAPI } from "@/services/rhapsodylanguagesApi";
import { Ionicons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get('window');

export default function ListenLanguageScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colors = useThemeColors();
    const { code } = useLocalSearchParams<{ code: string }>();
    
    const [loading, setLoading] = useState(true);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const styles = createStyles(colors);

    useEffect(() => {
        if (user && code) {
            fetchAudioFile();
        }

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [user, code]);

    const fetchAudioFile = async () => {
        try {
            setLoading(true);
            setError(null);

            const fileName = await RhapsodyLanguagesAPI.fetchLanguageFile({
                user_id: user!.id,
                type: 'listen',
                language: decodeURIComponent(code),
            });

            if (fileName) {
                const remoteAudioUrl = `https://mediathek.tniglobal.org/listen/${fileName}`;
                setAudioUrl(remoteAudioUrl);
                await loadAudio(remoteAudioUrl);
            } else {
                setError('Audio file not found');
            }
        } catch (err: any) {
            console.error('Error fetching audio:', err);
            setError(err.message || 'Failed to load audio');
            Alert.alert('Error', 'Failed to load the audio. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadAudio = async (url: string) => {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
        } catch (err) {
            console.error('Error loading audio:', err);
            setError('Failed to load audio player');
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
            }
        }
    };

    const togglePlayPause = async () => {
        if (!sound) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        } catch (err) {
            console.error('Error toggling playback:', err);
        }
    };

    const onSliderValueChange = async (value: number) => {
        if (!sound) return;
        try {
            await sound.setPositionAsync(value);
        } catch (err) {
            console.error('Error seeking:', err);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <CustomLoader message="Loading audio..." size="large" />;
    }

    if (error || !audioUrl) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Listen - {decodeURIComponent(code)}</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color={colors.textLight} />
                    <Text style={styles.errorTitle}>Audio Not Available</Text>
                    <Text style={styles.errorMessage}>{error || 'Unable to load the audio'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchAudioFile}>
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
                <Text style={styles.headerTitle}>Listen - {decodeURIComponent(code)}</Text>
            </View>
            
            <View style={styles.playerContainer}>
                <View style={styles.albumArt}>
                    <Ionicons name="musical-notes" size={80} color={colors.primary} />
                </View>

                <Text style={styles.languageTitle}>{decodeURIComponent(code)}</Text>

                <View style={styles.progressContainer}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onValueChange={onSliderValueChange}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={togglePlayPause}
                        disabled={!sound}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={48}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
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
    playerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    albumArt: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    languageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 32,
        textAlign: 'center',
    },
    progressContainer: {
        width: '100%',
        marginBottom: 32,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    timeText: {
        fontSize: 12,
        color: colors.textLight,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
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
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
