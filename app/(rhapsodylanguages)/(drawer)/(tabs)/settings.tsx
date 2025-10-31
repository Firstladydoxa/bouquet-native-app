import { useAuth } from '@/contexts';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TabType = 'profile' | 'settings';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { user, signOut, updateUser } = useAuth();
  const { subscriptionDetails, hasSubscription, hasAccess } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstname || '',
    lastName: user?.lastname || '',
    email: user?.email || '',
  });

  const handleSaveProfile = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      setIsSaving(true);
      
      // TODO: Replace with actual API call when backend endpoint is available
      // For now, we'll update the local state and show a success message
      await updateUser({
        firstname: profileData.firstName.trim(),
        lastname: profileData.lastName.trim(),
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by the auth context
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const handlePasswordReset = () => {
    Alert.alert(
      'Reset Password',
      'A password reset link will be sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Reset Link', onPress: () => Alert.alert('Email Sent', 'Check your email for instructions.') },
      ]
    );
  };

  const renderTabButton = (tab: TabType, title: string) => {
    const isActive = activeTab === tab;
    const tabColor = tab === 'profile' ? colors.primary : colors.secondary;
    
    return (
      <TouchableOpacity
        style={[
          styles.tab, 
          isActive && { borderBottomWidth: 2, borderBottomColor: tabColor }
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[
          styles.tabText, 
          isActive && { color: tabColor, fontWeight: '600' }
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* User Info Section */}
      <View style={styles.profileSection}>
        <View style={styles.userHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.firstname?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userFullName, { color: colors.text }]}>
              {user?.firstname} {user?.lastname}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textLight }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Personal Information Section */}
      <View style={styles.profileSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: isEditing ? colors.background : colors.card, 
                borderColor: colors.border, 
                color: colors.text 
              }
            ]}
            value={profileData.firstName}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
            editable={isEditing}
            placeholder="Enter your first name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: isEditing ? colors.background : colors.card, 
                borderColor: colors.border, 
                color: colors.text 
              }
            ]}
            value={profileData.lastName}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
            editable={isEditing}
            placeholder="Enter your last name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border, 
                color: colors.textLight 
              }
            ]}
            value={profileData.email}
            editable={false}
            placeholder="Email address"
            placeholderTextColor={colors.textLight}
          />
          <Text style={[styles.helpText, { color: colors.textLight }]}>
            Email cannot be changed. Contact support for email updates.
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setProfileData({
                    firstName: user?.firstname || '',
                    lastName: user?.lastname || '',
                    email: user?.email || '',
                  });
                }}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.saveButton, 
                  { backgroundColor: colors.primary },
                  isSaving && { opacity: 0.7 }
                ]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Text style={styles.saveButtonText}>Saving...</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton, { borderColor: colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Subscription Information Section */}
      <View style={styles.profileSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Subscription</Text>
        <View style={[styles.subscriptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.subscriptionHeader}>
            <Ionicons 
              name={hasSubscription ? "diamond" : "gift"} 
              size={24} 
              color={hasSubscription ? "#FF6B35" : colors.primary} 
            />
            <View style={styles.subscriptionInfo}>
              <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
                {subscriptionDetails?.category ? 
                  `${subscriptionDetails.category.charAt(0).toUpperCase() + subscriptionDetails.category.slice(1)} Plan` : 
                  'Free Plan'
                }
              </Text>
              <Text style={[styles.subscriptionStatus, { 
                color: subscriptionDetails?.status === 'active' ? '#10B981' : colors.textLight 
              }]}>
                {subscriptionDetails?.status || 'active'}
              </Text>
            </View>
          </View>
          
          {subscriptionDetails?.end && (
            <Text style={[styles.subscriptionDetail, { color: colors.textLight }]}>
              Expires: {new Date(subscriptionDetails.end).toLocaleDateString()}
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.subscriptionButton, { borderColor: colors.primary }]}
            onPress={() => {
              // TODO: Navigate to subscription management
              Alert.alert('Coming Soon', 'Subscription management features will be available soon.');
            }}
          >
            <Text style={[styles.subscriptionButtonText, { color: colors.primary }]}>
              {hasSubscription ? 'Manage Subscription' : 'Upgrade Plan'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.profileSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handlePasswordReset}
        >
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={[styles.securityButtonText, { color: colors.text }]}>Reset Password</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text style={[styles.securityButtonText, { color: "#EF4444" }]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      {/* App Preferences Section */}
      <View style={styles.profileSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>
        
        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}
          onPress={() => Alert.alert('Coming Soon', 'Theme preferences will be available soon.')}
        >
          <Ionicons name="color-palette" size={20} color={colors.primary} />
          <Text style={[styles.securityButtonText, { color: colors.text }]}>Theme Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}
          onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon.')}
        >
          <Ionicons name="notifications" size={20} color={colors.primary} />
          <Text style={[styles.securityButtonText, { color: colors.text }]}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Language preferences will be available soon.')}
        >
          <Ionicons name="language" size={20} color={colors.primary} />
          <Text style={[styles.securityButtonText, { color: colors.text }]}>Language Preferences</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.profileSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support & Information</Text>
        
        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}
          onPress={() => Alert.alert('Help & Support', 'For support, please contact us at support@rhapsodylanguages.com')}
        >
          <Ionicons name="help-circle" size={20} color={colors.primary} />
          <Text style={[styles.securityButtonText, { color: colors.text }]}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}
          onPress={() => Alert.alert('Privacy Policy', 'Privacy policy information will be available soon.')}
        >
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={[styles.securityButtonText, { color: colors.text }]}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert('Terms of Service', 'Terms of service information will be available soon.')}
        >
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={[styles.securityButtonText, { color: colors.text }]}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* App Information Section */}
      <View style={styles.profileSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Information</Text>
        <View style={[styles.subscriptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.subscriptionDetail, { color: colors.text, marginBottom: 8 }]}>
            Version: 1.0.0
          </Text>
          <Text style={[styles.subscriptionDetail, { color: colors.textLight, marginBottom: 0 }]}>
            © 2024 Rhapsody Languages. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>Manage your account and preferences</Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {renderTabButton('profile', 'Profile')}
        {renderTabButton('settings', 'Settings')}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' ? renderProfileTab() : renderSettingsTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 24,
  },
  profileSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  actionButtons: {
    marginTop: 24,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  editButton: {
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  securityButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  comingSoonText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  // New styles for enhanced profile UI
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userFullName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  subscriptionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subscriptionStatus: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  subscriptionDetail: {
    fontSize: 14,
    marginBottom: 12,
  },
  subscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
  },
  subscriptionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
