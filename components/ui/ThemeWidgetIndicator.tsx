import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeWidgetIndicator: React.FC = () => {
    const { colors } = useTheme();
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Create a bouncing animation that loops
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: -15,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [bounceAnim]);

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.arrowContainer,
                    {
                        transform: [{ translateY: bounceAnim }],
                    },
                ]}
            >
                <Ionicons 
                    name="arrow-up" 
                    size={32} 
                    color={colors.primary} 
                />
            </Animated.View>
            <View style={[styles.textContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.text, { color: colors.text }]}>
                    Switch the theme colors here
                </Text>
                <View style={[styles.triangle, { borderBottomColor: colors.card }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        alignItems: 'center',
        zIndex: 1000,
    },
    arrowContainer: {
        marginBottom: 8,
    },
    textContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        maxWidth: 200,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    triangle: {
        position: 'absolute',
        top: -10,
        right: 16,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
});
