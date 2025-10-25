import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { MediaAPI } from '@/services/mediaApi';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    const [audioFilename, setAudioFilename] = useState<string>('');
    
    // Animation values
    const pulseAnim = useState(new Animated.Value(1))[0];
    const rotateAnim = useState(new Animated.Value(0))[0];
    
    // Ref to prevent multiple initializations
    const isInitializing = useRef(false);
    // Ref to track current sound for cleanup
    const currentSoundRef = useRef<Audio.Sound | null>(null);

    const styles = createStyles(colors);

    useEffect(() => {
        if (user && code) {
            initializeAudioSystem();
        }
    }, [user, code]); // Removed 'sound' from dependencies to prevent loop

    // Cleanup effect for component unmount only
    useEffect(() => {
        return () => {
            // Use ref to get current sound for cleanup
            const soundToCleanup = currentSoundRef.current;
            if (soundToCleanup) {
                console.log('Component unmount: cleaning up audio');
                soundToCleanup.unloadAsync().catch(err => 
                    console.error('Error during component unmount audio cleanup:', err)
                );
                currentSoundRef.current = null;
            }
        };
    }, []); // Empty dependency array - only runs on mount/unmount

    // Pause audio when screen loses focus (user navigates away)
    useFocusEffect(
        useCallback(() => {
            // Screen is focused
            return () => {
                // Screen is unfocused - pause audio
                const soundToCleanup = currentSoundRef.current;
                if (soundToCleanup && isPlaying) {
                    console.log('Screen unfocused: pausing audio');
                    soundToCleanup.pauseAsync().catch(err => 
                        console.error('Error pausing audio on unfocus:', err)
                    );
                }
            };
        }, [isPlaying])
    );

    // Start pulse animation when playing
    useEffect(() => {
        if (isPlaying) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();

            const rotate = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 8000,
                    useNativeDriver: true,
                })
            );
            rotate.start();

            return () => {
                pulse.stop();
                rotate.stop();
            };
        } else {
            pulseAnim.setValue(1);
            rotateAnim.setValue(0);
        }
    }, [isPlaying]);

    // Calculate daily audio segment (similar to PDF pages)
    const getDailyAudioSegment = (day: number, totalDurationMs: number) => {
        // Each day gets a segment of the audio (like 2 pages in PDF)
        const totalDays = 30; // Assume 30 days worth of content
        const segmentDuration = totalDurationMs / totalDays;
        const start = (day - 1) * segmentDuration;
        const end = day * segmentDuration;
        return { start: Math.max(0, start), end: Math.min(totalDurationMs, end) };
    };

    const initializeAudioSystem = async () => {
        if (isInitializing.current) {
            console.log('Already initializing audio system, skipping...');
            return;
        }
        
        try {
            console.log('Initializing audio system...');
            isInitializing.current = true;
            setLoading(true);
            setError(null);

            // For now, assume content access is allowed (can be enhanced later)
            // TODO: Add proper subscription validation
            
            await fetchAudioFile();
        } catch (err: any) {
            console.error('Error initializing audio system:', err);
            setError(err.message || 'Failed to initialize audio system');
        } finally {
            setLoading(false);
            isInitializing.current = false;
            console.log('Audio system initialization completed');
        }
    };

    const fetchAudioFile = async () => {
        try {
            // Use the new MediaAPI to fetch today's daily audio
            const { filename, url } = await MediaAPI.fetchDailyAudio(
                user!.id,
                decodeURIComponent(code)
            );

            console.log('Fetched daily audio:', { filename, url });
            
            if (filename && url) {
                setAudioFilename(filename);
                setAudioUrl(url);
                await loadAudio(url);
            } else {
                setError('Audio file not found');
            }
        } catch (err: any) {
            console.error('Error fetching audio:', err);
            setError(err.message || 'Failed to load audio');
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
            currentSoundRef.current = newSound; // Keep ref in sync
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
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient 
                    colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']} 
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Loading Audio...</Text>
                </LinearGradient>
                <CustomLoader message="Preparing your daily audio..." size="large" />
            </SafeAreaView>
        );
    }

    if (error === 'subscription_required') {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient 
                    colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']} 
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>{decodeURIComponent(code)}</Text>
                        <Text style={styles.headerSubtitle}>Premium Audio Content</Text>
                    </View>
                </LinearGradient>
                
                <View style={styles.errorContainer}>
                    <Ionicons name="headset-outline" size={80} color={colors.primary} />
                    <Text style={styles.errorTitle}>Premium Audio Experience</Text>
                    <Text style={styles.errorMessage}>
                        Unlock daily Rhapsody audio in different languages.
                        Get unlimited access by subscribing to the Rhapsody plans.
                    </Text>
                    <TouchableOpacity 
                        style={styles.upgradeButton} 
                        onPress={() => router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/')}
                    >
                        <LinearGradient
                            colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.upgradeButtonText}>Subscribe Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !audioUrl) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient 
                    colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']} 
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Listen - {decodeURIComponent(code)}</Text>
                </LinearGradient>
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
            {/* Beautiful Header */}
            <LinearGradient 
                colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']} 
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{decodeURIComponent(code)}</Text>
                    <Text style={styles.headerSubtitle}>Daily Rhapsody Audio</Text>
                </View>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="headset" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <LinearGradient
                            colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                            style={[styles.progressFill, { width: `${Math.round((position / duration) * 100)}%` }]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        Progress: {Math.round((position / duration) * 100)}%
                    </Text>
                </View>
            
            <View style={styles.playerContainer}>
                {/* Animated Album Art */}
                <Animated.View 
                    style={[
                        styles.albumArt,
                        {
                            transform: [
                                { scale: pulseAnim },
                                {
                                    rotate: rotateAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg'],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                        style={styles.albumArtGradient}
                    >
                        <Ionicons name="headset" size={80} color="#FFFFFF" />
                    </LinearGradient>
                </Animated.View>

                <Text style={styles.languageTitle}>{decodeURIComponent(code)}</Text>
                <Text style={styles.dayText}> You are listening to the {code} translation</Text>

                {/* Enhanced Progress Container */}
                <View style={styles.audioProgressContainer}>
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

                {/* Enhanced Controls */}
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

                {/* Day Info */}
                <View style={styles.dayInfoContainer}>
                    <Text style={styles.dayInfoText}>
                        Listen to Rhapsody and give your day a lift.
                    </Text>
                </View>
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
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
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
    headerContent: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
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
    albumArtGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 24,
        textAlign: 'center',
    },
    audioProgressContainer: {
        width: '100%',
        marginBottom: 32,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
    },
    disabledButton: {
        backgroundColor: colors.border,
    },
    dayInfoContainer: {
        marginTop: 32,
        paddingHorizontal: 16,
    },
    dayInfoText: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
});
