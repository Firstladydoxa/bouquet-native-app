import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useThemeColors } from '../../hooks/use-themed-styles';

const { width: screenWidth } = Dimensions.get('window');

export interface CustomNotificationProps {
    visible: boolean;
    type?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose: () => void;
    actions?: Array<{
        text: string;
        onPress: () => void;
        style?: 'default' | 'destructive' | 'cancel';
    }>;
}

const CustomNotification: React.FC<CustomNotificationProps> = ({
    visible,
    type = 'info',
    title,
    message,
    duration = 0, // 0 means manual close only
    onClose,
    actions = [],
}) => {
    const colors = useThemeColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const styles = createStyles(colors);

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-close after duration if specified
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);

                return () => clearTimeout(timer);
            }
        } else {
            // Reset animations when not visible
            fadeAnim.setValue(0);
            slideAnim.setValue(-50);
            scaleAnim.setValue(0.9);
        }
    }, [visible, duration]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const getIconName = (): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'close-circle';
            case 'warning':
                return 'warning';
            case 'info':
            default:
                return 'information-circle';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return colors.success || '#4CAF50';
            case 'error':
                return colors.error || '#F44336';
            case 'warning':
                return colors.warning || '#FF9800';
            case 'info':
            default:
                return colors.info || colors.primary || '#2196F3';
        }
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <Animated.View 
                    style={[
                        styles.overlay,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.notificationContainer,
                                {
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.content}>
                                <View style={styles.header}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name={getIconName()}
                                            size={24}
                                            color={getIconColor()}
                                        />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.title}>{title}</Text>
                                        {message && (
                                            <Text style={styles.message}>{message}</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={handleClose}
                                        style={styles.closeButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={20}
                                            color={colors.textLight}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {actions.length > 0 && (
                                    <View style={styles.actionsContainer}>
                                        {actions.map((action: {
                                            text: string;
                                            onPress: () => void;
                                            style?: 'default' | 'destructive' | 'cancel';
                                        }, index: number) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.actionButton,
                                                    action.style === 'destructive' && styles.destructiveButton,
                                                    action.style === 'cancel' && styles.cancelButton,
                                                ]}
                                                onPress={() => {
                                                    action.onPress();
                                                    handleClose();
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.actionButtonText,
                                                        action.style === 'destructive' && styles.destructiveButtonText,
                                                        action.style === 'cancel' && styles.cancelButtonText,
                                                    ]}
                                                >
                                                    {action.text}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40, // Added bottom padding to prevent touching container border
    },
    notificationContainer: {
        backgroundColor: colors.card || colors.background || '#FFFFFF',
        borderRadius: 18, // Increased from 16
        maxWidth: screenWidth - 32, // Decreased margins for larger container
        minWidth: screenWidth * 0.85, // Increased from 0.8
        shadowColor: colors.shadow || '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    content: {
        padding: 24, // Increased from 20
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginRight: 14, // Increased from 12
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20, // Increased from 18
        fontWeight: '600',
        color: colors.text || '#000000',
        marginBottom: 6, // Increased from 4
        lineHeight: 24, // Added for better spacing
    },
    message: {
        fontSize: 16, // Increased from 14
        color: colors.textLight || '#666666',
        lineHeight: 22, // Increased from 20
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24, // Increased from 20
        gap: 14, // Increased from 12
        paddingBottom: 4, // Added padding at bottom of actions
    },
    actionButton: {
        paddingHorizontal: 18, // Increased from 16
        paddingVertical: 10, // Increased from 8
        backgroundColor: colors.primary || '#007AFF',
        borderRadius: 10, // Increased from 8
        minWidth: 90, // Increased from 80
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16, // Increased from 14
        fontWeight: '500',
    },
    destructiveButton: {
        backgroundColor: '#F44336',
    },
    destructiveButtonText: {
        color: '#FFFFFF',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border || '#E0E0E0',
    },
    cancelButtonText: {
        color: colors.text || '#000000',
    },
});

export default CustomNotification;