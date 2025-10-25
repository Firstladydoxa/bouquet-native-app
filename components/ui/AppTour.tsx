import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const TOUR_COMPLETED_KEY = '@rhapsody_tour_completed';
const STEP_DURATION = 20000; // 20 seconds per step

interface TourStep {
    id: number;
    title: string;
    description: string;
    targetPosition: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
    targetSize: {
        width: number;
        height: number;
    };
    tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 1,
        title: 'Menu Navigation',
        description: 'Tap this menu icon to open the sidebar navigation and explore all available sections.',
        targetPosition: { top: 50, left: 16 },
        targetSize: { width: 40, height: 40 },
        tooltipPosition: 'bottom',
    },
    {
        id: 2,
        title: 'Bottom Tabs',
        description: 'Use these tabs at the bottom to quickly navigate between Home, Explore, Settings, and Subscriptions.',
        targetPosition: { bottom: 0, left: 0 },
        targetSize: { width: width, height: 65 },
        tooltipPosition: 'top',
    },
    {
        id: 3,
        title: 'Theme Customization',
        description: 'Click this widget to switch the app theme colors and personalize your experience.',
        targetPosition: { top: height / 2 - 22, right: 16 },
        targetSize: { width: 44, height: 44 },
        tooltipPosition: 'left',
    },
    {
        id: 4,
        title: 'Sign Out',
        description: 'Tap here whenever you want to log out of your account.',
        targetPosition: { top: 50, right: 16 },
        targetSize: { width: 40, height: 40 },
        tooltipPosition: 'bottom',
    },
];

export const AppTour: React.FC = () => {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isChecking, setIsChecking] = useState(true);
    
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        checkTourStatus();
    }, []);

    useEffect(() => {
        if (visible) {
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Pulse animation for highlight
            Animated.loop(
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
            ).start();

            // Auto-advance to next step after STEP_DURATION
            const timer = setTimeout(() => {
                handleNext();
            }, STEP_DURATION);

            return () => clearTimeout(timer);
        }
    }, [visible, currentStep]);

    const checkTourStatus = async () => {
        // Always show tour - no longer checking AsyncStorage
        setTimeout(() => {
            setVisible(true);
            setIsChecking(false);
        }, 1000);
    };

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const handleSkip = () => {
        completeTour();
    };

    const completeTour = async () => {
        // No longer saving to AsyncStorage - tour shows every time
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
        });
    };

    if (isChecking || !visible) {
        return null;
    }

    const step = TOUR_STEPS[currentStep];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                {/* Dark Overlay */}
                <View style={styles.overlay} />

                {/* Highlighted Area (Cutout) */}
                <Animated.View
                    style={[
                        styles.highlightBox,
                        {
                            ...step.targetPosition,
                            width: step.targetSize.width,
                            height: step.targetSize.height,
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                >
                    <View style={styles.highlightBorder} />
                </Animated.View>

                {/* Tooltip */}
                <View
                    style={[
                        styles.tooltip,
                        getTooltipPosition(step),
                        { backgroundColor: colors.card, borderColor: colors.primary },
                    ]}
                >
                    <View style={[styles.tooltipHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.stepIndicator, { color: colors.primary }]}>
                            Step {currentStep + 1} of {TOUR_STEPS.length}
                        </Text>
                        <TouchableOpacity onPress={handleSkip} style={[styles.skipButton, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.skipButtonText, { color: '#FFFFFF' }]}>Skip</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tooltipContent}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons 
                                name={getStepIcon(currentStep)} 
                                size={32} 
                                color={colors.primary} 
                            />
                        </View>
                        <Text style={[styles.tooltipTitle, { color: colors.text }]}>
                            {step.title}
                        </Text>
                        <Text style={[styles.tooltipDescription, { color: colors.textLight }]}>
                            {step.description}
                        </Text>
                    </View>

                    <View style={styles.tooltipFooter}>
                        <View style={styles.progressDots}>
                            {TOUR_STEPS.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: index === currentStep 
                                                ? colors.primary 
                                                : colors.border,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                                onPress={handleNext}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentStep < TOUR_STEPS.length - 1 ? 'Next' : 'Finish'}
                                </Text>
                                <Ionicons 
                                    name={currentStep < TOUR_STEPS.length - 1 ? "arrow-forward" : "checkmark"} 
                                    size={20} 
                                    color="#FFFFFF" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tooltip Arrow */}
                    <View
                        style={[
                            styles.tooltipArrow,
                            getArrowStyle(step.tooltipPosition, colors.card),
                        ]}
                    />
                </View>
            </Animated.View>
        </Modal>
    );
};

const getStepIcon = (step: number): any => {
    const icons = ['menu', 'apps', 'color-palette', 'log-out'];
    return icons[step] || 'information-circle';
};

const getTooltipPosition = (step: TourStep): any => {
    const padding = 20;
    const tooltipWidth = width - 40;
    const safeTop = 60; // Minimum top position to avoid status/header bars

    switch (step.tooltipPosition) {
        case 'bottom':
            return {
                top: Math.max(safeTop, (step.targetPosition.top || 0) + step.targetSize.height + padding),
                left: 20,
                width: tooltipWidth,
            };
        case 'top':
            // For bottom targets, position tooltip above with safe spacing
            if (step.targetPosition.bottom !== undefined) {
                return {
                    bottom: step.targetPosition.bottom + step.targetSize.height + padding,
                    left: 20,
                    width: tooltipWidth,
                };
            }
            return {
                bottom: height - (step.targetPosition.top || 0) + padding,
                left: 20,
                width: tooltipWidth,
            };
        case 'left':
            return {
                top: Math.max(safeTop, (step.targetPosition.top || 0)),
                right: (step.targetPosition.right || 0) + step.targetSize.width + padding,
                width: 250,
            };
        case 'right':
            return {
                top: (step.targetPosition.top || 0),
                left: (step.targetPosition.left || 0) + step.targetSize.width + padding,
                width: 250,
            };
        default:
            return {};
    }
};

const getArrowStyle = (position: string, color: string): any => {
    const arrowSize = 12;
    const base = {
        position: 'absolute' as const,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid' as const,
    };

    switch (position) {
        case 'bottom':
            return {
                ...base,
                top: -arrowSize,
                left: 30,
                borderLeftWidth: arrowSize,
                borderRightWidth: arrowSize,
                borderBottomWidth: arrowSize,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
            };
        case 'top':
            return {
                ...base,
                bottom: -arrowSize,
                left: 30,
                borderLeftWidth: arrowSize,
                borderRightWidth: arrowSize,
                borderTopWidth: arrowSize,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: color,
            };
        case 'left':
            return {
                ...base,
                right: -arrowSize,
                top: 30,
                borderTopWidth: arrowSize,
                borderBottomWidth: arrowSize,
                borderLeftWidth: arrowSize,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: color,
            };
        case 'right':
            return {
                ...base,
                left: -arrowSize,
                top: 30,
                borderTopWidth: arrowSize,
                borderBottomWidth: arrowSize,
                borderRightWidth: arrowSize,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderRightColor: color,
            };
        default:
            return base;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    highlightBox: {
        position: 'absolute',
        backgroundColor: 'transparent',
        borderRadius: 8,
        overflow: 'hidden',
    },
    highlightBorder: {
        flex: 1,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    tooltip: {
        position: 'absolute',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 2,
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: '600',
    },
    skipButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tooltipContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    tooltipTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    tooltipDescription: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    tooltipFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tooltipArrow: {
        // Arrow styles are dynamically calculated
    },
});
