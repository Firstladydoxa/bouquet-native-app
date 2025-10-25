import CustomNotification from '@/components/ui/CustomNotification';
import useCustomNotification from '@/hooks/use-custom-notification';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { MediaAPI } from '../../../../services/mediaApi';

const { width, height } = Dimensions.get('window');

export default function WatchVideoPage() {
    const { code } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const videoRef = useRef<Video>(null);
    const { notification, showError, hideNotification } = useCustomNotification();

    // Video states
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Auto-hide controls timer
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (code) {
            loadVideo();
        }
    }, [code]);

    // Cleanup video on component unmount
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                console.log('Cleaning up video on component unmount');
                videoRef.current.unloadAsync().catch(err => 
                    console.error('Error during video cleanup:', err)
                );
                setIsPlaying(false);
                setPosition(0);
                setDuration(0);
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Auto-hide controls after 3 seconds
        if (showControls && isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [showControls, isPlaying]);

    const loadVideo = async () => {
        try {
            setIsLoading(true);

            // Note: This would need proper user ID from auth context
            // For now using the code as user_id, but should be updated
            const videoData = await MediaAPI.fetchDailyVideo(code as string, code as string);
            
            if (!videoData?.url) {
                showError('No Content Available', 'No video content available for today');
                return;
            }

            setVideoUrl(videoData.url);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading video:', error);
            setIsLoading(false);
            showError('Video Load Failed', 'Failed to load video. Please try again.');
        }
    };

    const onVideoStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying || false);
        }
    };

    const togglePlayPause = async () => {
        if (!videoRef.current) return;

        try {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setShowControls(true);
        } catch (err) {
            console.error('Error toggling playback:', err);
        }
    };

    const onSliderValueChange = async (value: number) => {
        if (!videoRef.current) return;
        try {
            await videoRef.current.setPositionAsync(value);
        } catch (err) {
            console.error('Error seeking:', err);
        }
    };

    const formatTime = (millis: number): string => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setShowControls(true);
    };

    const handleVideoPress = () => {
        setShowControls(!showControls);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                    style={styles.loadingGradient}
                >
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading Video...</Text>
                </LinearGradient>
            </View>
        );
    }

    const videoStyle = isFullscreen 
        ? styles.fullscreenVideo 
        : styles.normalVideo;

    const containerStyle = isFullscreen 
        ? styles.fullscreenContainer 
        : styles.normalContainer;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={isFullscreen ? "light-content" : "default"}
                hidden={isFullscreen}
            />
            
            <View style={containerStyle}>
                {/* Video Player */}
                <TouchableOpacity 
                    style={styles.videoWrapper}
                    onPress={handleVideoPress}
                    activeOpacity={1}
                >
                    <Video
                        ref={videoRef}
                        style={videoStyle}
                        source={{ uri: videoUrl }}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={isPlaying}
                        isLooping={false}
                        onPlaybackStatusUpdate={onVideoStatusUpdate}
                    />
                    
                    {/* Video Controls Overlay */}
                    {showControls && (
                        <View style={styles.controlsOverlay}>
                            {/* Top Controls */}
                            <LinearGradient
                                colors={['rgba(0,0,0,0.7)', 'transparent']}
                                style={styles.topControls}
                            >
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => router.back()}
                                >
                                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                
                                <Text style={styles.videoTitle}>
                                    {decodeURIComponent(code as string)} - Daily Video
                                </Text>
                                
                                <TouchableOpacity
                                    style={styles.fullscreenButton}
                                    onPress={toggleFullscreen}
                                >
                                    <Ionicons 
                                        name={isFullscreen ? "contract" : "expand"} 
                                        size={24} 
                                        color="#FFFFFF" 
                                    />
                                </TouchableOpacity>
                            </LinearGradient>

                            {/* Center Play Button */}
                            <TouchableOpacity
                                style={styles.centerPlayButton}
                                onPress={togglePlayPause}
                            >
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={72}
                                    color="rgba(255,255,255,0.9)"
                                />
                            </TouchableOpacity>

                            {/* Bottom Controls */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                style={styles.bottomControls}
                            >
                                {/* Progress Slider */}
                                <View style={styles.progressContainer}>
                                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={0}
                                        maximumValue={duration}
                                        value={position}
                                        onValueChange={onSliderValueChange}
                                        minimumTrackTintColor="#FFFFFF"
                                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                                        thumbTintColor="#FFFFFF"
                                    />
                                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                                </View>

                                {/* Playback Controls */}
                                <View style={styles.playbackControls}>
                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPress={() => onSliderValueChange(Math.max(0, position - 10000))}
                                    >
                                        <Ionicons name="play-back" size={32} color="#FFFFFF" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.mainPlayButton}
                                        onPress={togglePlayPause}
                                    >
                                        <Ionicons
                                            name={isPlaying ? "pause" : "play"}
                                            size={48}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPress={() => onSliderValueChange(Math.min(duration, position + 10000))}
                                    >
                                        <Ionicons name="play-forward" size={32} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Video Information (Only in normal mode) */}
                {!isFullscreen && (
                    <View style={styles.videoInfo}>
                        <LinearGradient
                            colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                            style={styles.infoGradient}
                        >
                            <Text style={styles.languageTitle}>
                                {decodeURIComponent(code as string)}
                            </Text>
                            <Text style={styles.lessonTitle}>Daily Video Lesson</Text>
                            <Text style={styles.progressText}>
                                Progress: {Math.round((position / duration) * 100) || 0}%
                            </Text>
                        </LinearGradient>
                    </View>
                )}
            </View>
            
            <CustomNotification
                visible={notification.visible}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                duration={notification.duration}
                actions={notification.actions}
                onClose={hideNotification}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
    },
    loadingGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginTop: 16,
        fontWeight: '600',
    },
    normalContainer: {
        flex: 1,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    videoWrapper: {
        position: 'relative',
        flex: 1,
    },
    normalVideo: {
        width: width,
        height: width * (9/16), // 16:9 aspect ratio
        backgroundColor: '#000000',
    },
    fullscreenVideo: {
        width: width,
        height: height,
        backgroundColor: '#000000',
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    topControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    videoTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    fullscreenButton: {
        padding: 8,
    },
    centerPlayButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -36 }, { translateY: -36 }],
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 36,
    },
    bottomControls: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        paddingTop: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        minWidth: 40,
        textAlign: 'center',
    },
    slider: {
        flex: 1,
        height: 40,
        marginHorizontal: 12,
    },
    playbackControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButton: {
        padding: 12,
        marginHorizontal: 8,
    },
    mainPlayButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 32,
        padding: 16,
        marginHorizontal: 16,
    },
    videoInfo: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    infoGradient: {
        padding: 20,
        alignItems: 'center',
    },
    languageTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    lessonTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 12,
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
});