import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const WELCOME_SHOWN_KEY = '@rhapsody_welcome_shown';

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Animate the welcome screen elements
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        // No longer saving to AsyncStorage - welcome shows every time
        router.replace('/(rhapsodylanguages)/(drawer)/(tabs)');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primary || '#007AFF', colors.secondary || '#5856D6']}
                style={styles.gradient}
            >
                {/* Decorative Circles */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />

                {/* Logo Container */}
                <Animated.View 
                    style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../assets/images/icon.png')}
                            style={styles.logo}
                            contentFit="contain"
                        />
                    </View>
                </Animated.View>

                {/* Welcome Text */}
                <Animated.View 
                    style={[
                        styles.textContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.appName}>Rhapsody Languages</Text>
                    <Text style={styles.tagline}>
                        Listen, Read & Watch Daily Rhapsody{'\n'}in Your Language
                    </Text>
                </Animated.View>

                {/* Get Started Button */}
                <Animated.View 
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={handleGetStarted}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <Ionicons name="book-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.featureText}>Read Daily</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="headset-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.featureText}>Listen Anytime</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="videocam-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.featureText}>Watch & Learn</Text>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    circle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -100,
        left: -100,
    },
    circle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -50,
        right: -50,
    },
    circle3: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        top: height / 2,
        right: -30,
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoWrapper: {
        width: 180,
        height: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    logo: {
        width: 140,
        height: 140,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    welcomeText: {
        fontSize: 20,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 8,
        fontWeight: '400',
    },
    appName: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    tagline: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.85,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    getStartedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 12,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
    },
    featureItem: {
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.9,
    },
});
