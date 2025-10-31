import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

/**
 * TokenRefreshWidget Component
 * Monitors token expiration and prompts user to refresh their session
 * Shows a modal when the token is about to expire or has expired
 */
const TokenRefreshWidget: React.FC = () => {
  const colors = useThemeColors();
  const { user, tokenExpiresAt, refreshToken, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const styles = createStyles(colors);  // Check token expiration status
  useEffect(() => {
    if (!tokenExpiresAt || !user) {
      setShowModal(false);
      return;
    }

    const checkExpiration = () => {
      const now = new Date();
      const expiresAt = new Date(tokenExpiresAt);
      const timeDiff = expiresAt.getTime() - now.getTime();
      
      // Show warning 5 minutes before expiration
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeDiff <= 0) {
        // Token has expired
        setIsExpired(true);
        setShowModal(true);
        setTimeRemaining('Expired');
      } else if (timeDiff <= fiveMinutes) {
        // Token will expire soon
        setIsExpired(false);
        setShowModal(true);
        
        // Calculate remaining time
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setShowModal(false);
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 10 seconds
    const interval = setInterval(checkExpiration, 10000);

    return () => clearInterval(interval);
  }, [tokenExpiresAt, user]);

  const handleRefreshToken = async () => {
    setRefreshing(true);
    
    try {
      console.log('[TokenRefresh] Refreshing authentication token...');
      await refreshToken();
      console.log('[TokenRefresh] Token refreshed successfully');
      
      setShowModal(false);
    } catch (error: any) {
      console.error('[TokenRefresh] Failed to refresh token:', error);
      
      // If refresh fails, sign out the user
      alert('Session refresh failed. Please sign in again.');
      await signOut();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowModal(false);
    } catch (error) {
      console.error('[TokenRefresh] Error signing out:', error);
    }
  };

  if (!showModal || !user) {
    return null;
  }

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!isExpired) {
          setShowModal(false);
        }
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={isExpired 
              ? ['#EF4444', '#DC2626'] 
              : ['#F59E0B', '#D97706']
            }
            style={styles.iconContainer}
          >
            <Ionicons 
              name={isExpired ? "alert-circle" : "time"} 
              size={48} 
              color="#FFFFFF" 
            />
          </LinearGradient>

          <Text style={styles.title}>
            {isExpired ? 'Session Expired' : 'Session Expiring Soon'}
          </Text>

          <Text style={styles.message}>
            {isExpired 
              ? 'Your session has expired. Please refresh to continue using the app.'
              : `Your session will expire in ${timeRemaining}. Refresh now to stay signed in.`
            }
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshToken}
              disabled={refreshing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {refreshing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.refreshButtonText}>Refresh Session</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {!isExpired && (
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={refreshing}
                activeOpacity={0.8}
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isExpired && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setShowModal(false)}
              disabled={refreshing}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card || '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text || '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: colors.textLight || '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  refreshButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: colors.error || '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  dismissButtonText: {
    color: colors.textLight || '#666666',
    fontSize: 14,
  },
});

export default TokenRefreshWidget;
