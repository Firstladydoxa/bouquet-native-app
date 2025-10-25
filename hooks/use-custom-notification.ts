import { useCallback, useState } from 'react';

interface NotificationState {
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
        text: string;
        onPress: () => void;
        style?: 'default' | 'destructive' | 'cancel';
    }>;
}

const initialState: NotificationState = {
    visible: false,
    type: 'info',
    title: '',
    message: '',
    duration: 0,
    actions: [],
};

export const useCustomNotification = () => {
    const [notification, setNotification] = useState<NotificationState>(initialState);

    const showNotification = useCallback(({
        type = 'info',
        title,
        message,
        duration = 0,
        actions = [],
    }: Omit<NotificationState, 'visible'>) => {
        setNotification({
            visible: true,
            type,
            title,
            message,
            duration,
            actions,
        });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, visible: false }));
    }, []);

    // Convenience methods for different types
    const showSuccess = useCallback((title: string, message?: string, duration = 3000) => {
        showNotification({ type: 'success', title, message, duration });
    }, [showNotification]);

    const showError = useCallback((title: string, message?: string, actions?: NotificationState['actions']) => {
        showNotification({ type: 'error', title, message, actions });
    }, [showNotification]);

    const showWarning = useCallback((title: string, message?: string, actions?: NotificationState['actions']) => {
        showNotification({ type: 'warning', title, message, actions });
    }, [showNotification]);

    const showInfo = useCallback((title: string, message?: string, duration = 5000) => {
        showNotification({ type: 'info', title, message, duration });
    }, [showNotification]);

    const showConfirm = useCallback((
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText = 'Confirm',
        cancelText = 'Cancel'
    ) => {
        const actions = [
            {
                text: cancelText,
                style: 'cancel' as const,
                onPress: onCancel || (() => {}),
            },
            {
                text: confirmText,
                style: 'default' as const,
                onPress: onConfirm,
            },
        ];
        showNotification({ type: 'warning', title, message, actions });
    }, [showNotification]);

    return {
        notification,
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
    };
};

export default useCustomNotification;