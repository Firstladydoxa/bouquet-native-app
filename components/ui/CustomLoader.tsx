import { useThemeColors } from "@/hooks/use-themed-styles";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface CustomLoaderProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export default function CustomLoader({ message = "Loading...", size = 'medium' }: CustomLoaderProps) {
    const colors = useThemeColors();
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim1 = useRef(new Animated.Value(1)).current;
    const scaleAnim2 = useRef(new Animated.Value(1)).current;
    const scaleAnim3 = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const loaderSize = size === 'small' ? 60 : size === 'large' ? 120 : 80;
    const dotSize = size === 'small' ? 8 : size === 'large' ? 16 : 12;

    useEffect(() => {
        // Rotation animation for outer ring
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulsing animation for dots
        const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animValue, {
                        toValue: 1.5,
                        duration: 600,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        createPulseAnimation(scaleAnim1, 0).start();
        createPulseAnimation(scaleAnim2, 200).start();
        createPulseAnimation(scaleAnim3, 400).start();

        // Fade in text
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const styles = createStyles(colors, loaderSize, dotSize);

    return (
        <View style={styles.container}>
            <View style={styles.loaderContainer}>
                {/* Outer rotating ring */}
                <Animated.View
                    style={[
                        styles.outerRing,
                        {
                            transform: [{ rotate }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[colors.primary || '#3B82F6', 'transparent', colors.secondary || '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientRing}
                    />
                </Animated.View>

                {/* Middle ring */}
                <Animated.View
                    style={[
                        styles.middleRing,
                        {
                            transform: [{ rotate: rotate }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[colors.secondary || '#8B5CF6', 'transparent', colors.primary || '#3B82F6']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientRing}
                    />
                </Animated.View>

                {/* Pulsing dots in center */}
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.primary, transform: [{ scale: scaleAnim1 }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.secondary, transform: [{ scale: scaleAnim2 }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.tertiary || colors.primary, transform: [{ scale: scaleAnim3 }] },
                        ]}
                    />
                </View>
            </View>

            {/* Loading message */}
            <Animated.Text style={[styles.message, { opacity: opacityAnim }]}>
                {message}
            </Animated.Text>
        </View>
    );
}

const createStyles = (colors: any, loaderSize: number, dotSize: number) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
            padding: 20,
        },
        loaderContainer: {
            width: loaderSize,
            height: loaderSize,
            justifyContent: 'center',
            alignItems: 'center',
        },
        outerRing: {
            position: 'absolute',
            width: loaderSize,
            height: loaderSize,
            borderRadius: loaderSize / 2,
            overflow: 'hidden',
        },
        middleRing: {
            position: 'absolute',
            width: loaderSize * 0.7,
            height: loaderSize * 0.7,
            borderRadius: (loaderSize * 0.7) / 2,
            overflow: 'hidden',
        },
        gradientRing: {
            flex: 1,
            borderWidth: 3,
            borderColor: 'transparent',
            borderRadius: loaderSize / 2,
        },
        dotsContainer: {
            flexDirection: 'row',
            gap: dotSize / 2,
            justifyContent: 'center',
            alignItems: 'center',
        },
        dot: {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
        },
        message: {
            marginTop: 24,
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
        },
    });
