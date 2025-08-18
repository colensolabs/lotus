import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Bot as feelbetter, Bell, Heart, MessageCircle, CircleHelp as HelpCircle, Star, Vibrate, User, Settings as SettingsIcon, Shield } from 'lucide-react-native';
import { LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStreamingSpeed, StreamingSpeed } from '@/hooks/useStreamingSpeed';
import { useHapticSettings } from '@/hooks/useHapticSettings';
import { useNotifications } from '@/hooks/useNotifications';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { useAuth } from '@/hooks/useAuth';
import { triggerSelectionHaptic } from '@/utils/haptics';
import { supabase } from '@/lib/supabase';
import { CustomSwitch } from '@/components/CustomSwitch';

export default function SettingsScreen() {
  const { speed, updateSpeed } = useStreamingSpeed();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<{ display_name: string | null; email: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to auth metadata
        setUserProfile({
          display_name: user.user_metadata?.display_name || null,
          email: user.email || ''
        });
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback to auth metadata
      setUserProfile({
        display_name: user.user_metadata?.display_name || null,
        email: user.email || ''
      });
    }
  };



    const StreamingSpeedSelector = () => {
    const speeds: { value: StreamingSpeed; label: string; description: string }[] = [
      { value: 'slow', label: 'Slow', description: '~8 chars/sec' },
      { value: 'normal', label: 'Normal', description: '~25 chars/sec' },
      { value: 'fast', label: 'Fast', description: '~60 chars/sec' },
    ];

    return (
      <View style={styles.speedSelectorContainer}>
        {speeds.map((speedOption) => (
          <TouchableOpacity
            key={speedOption.value}
            style={[
              styles.speedOption,
              speed === speedOption.value && styles.speedOptionSelected
            ]}
            onPress={() => {
              updateSpeed(speedOption.value);
              if (speed !== speedOption.value) {
                triggerSelectionHaptic();
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.speedOptionLabel,
              speed === speedOption.value && styles.speedOptionLabelSelected
            ]}>
              {speedOption.label}
            </Text>
            <Text style={[
              styles.speedOptionDescription,
              speed === speedOption.value && styles.speedOptionDescriptionSelected
            ]}>
              {speedOption.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Haptic Feedback Toggle
  const HapticToggle = () => {
    const { isEnabled: hapticsEnabled, isLoading, updateSetting: updateHaptics } = useHapticSettings();
    
    const handleHapticToggle = (value: boolean) => {
      triggerSelectionHaptic();
      updateHaptics(value);
    };
    
    // Don't render until loading is complete
    if (isLoading || hapticsEnabled === null) {
      return (
        <SettingsRow
          icon={<Vibrate size={20} color="#D4AF37" strokeWidth={1.5} />}
          title="Haptic Feedback"
          subtitle="Feel the typewriter effect"
          rightElement={
            <View style={{ width: 51, height: 31, backgroundColor: '#E8E8E8', borderRadius: 16 }} />
          }
          showArrow={false}
        />
      );
    }
    
    return (
      <SettingsRow
        icon={<Vibrate size={20} color="#D4AF37" strokeWidth={1.5} />}
        title="Haptic Feedback"
        subtitle="Feel the typewriter effect"
        rightElement={
          <CustomSwitch
            value={hapticsEnabled}
            onValueChange={handleHapticToggle}
            trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
            thumbColor="#FEFEFE"
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        }
        showArrow={false}
      />
    );
  };

  // Notifications Toggle
  const NotificationsToggle = () => {
    const { isEnabled: notificationsEnabled, isLoading, updateSetting: updateNotifications } = useNotifications();
    
    const handleNotificationsToggle = (value: boolean) => {
      triggerSelectionHaptic();
      updateNotifications(value);
    };
    
    // Don't render until loading is complete
    if (isLoading || notificationsEnabled === null) {
      return (
        <SettingsRow
          icon={<Bell size={20} color="#D4AF37" strokeWidth={1.5} />}
          title="Notifications"
          subtitle="Daily wisdom and reminders"
          rightElement={
            <View style={{ width: 51, height: 31, backgroundColor: '#E8E8E8', borderRadius: 16 }} />
          }
          showArrow={false}
        />
      );
    }
    
    return (
      <SettingsRow
        icon={<Bell size={20} color="#D4AF37" strokeWidth={1.5} />}
        title="Notifications"
        subtitle="Daily wisdom and reminders"
        rightElement={
          <CustomSwitch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
            thumbColor="#FEFEFE"
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        }
        showArrow={false}
      />
    );
  };

  // Privacy Toggle
  const PrivacyToggle = () => {
    const { isPrivacyEnabled, isLoading, updatePrivacySetting } = usePrivacySettings();
    
    const handlePrivacyToggle = (value: boolean) => {
      triggerSelectionHaptic();
      updatePrivacySetting(value);
    };
    
    // Don't render until loading is complete
    if (isLoading || isPrivacyEnabled === null) {
      return (
        <SettingsRow
          icon={<Shield size={20} color="#D4AF37" strokeWidth={1.5} />}
          title="Privacy Mode"
          subtitle="When ON, conversations are not saved"
          rightElement={
            <View style={{ width: 51, height: 31, backgroundColor: '#E8E8E8', borderRadius: 16 }} />
          }
          showArrow={false}
        />
      );
    }
    
    return (
      <SettingsRow
        icon={<Shield size={20} color="#D4AF37" strokeWidth={1.5} />}
        title="Privacy Mode"
        subtitle="When ON, conversations are not saved"
        rightElement={
          <CustomSwitch
            value={isPrivacyEnabled}
            onValueChange={handlePrivacyToggle}
            trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
            thumbColor="#FEFEFE"
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        }
        showArrow={false}
      />
    );
  };

  const SettingsRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    showArrow = true 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => {
    // If there's a rightElement (like a Switch), don't wrap in TouchableOpacity
    // to avoid interfering with the Switch's touch handling
    if (rightElement) {
      return (
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconContainer}>
              {icon}
            </View>
            <View style={styles.settingsTextContainer}>
              <Text style={styles.settingsTitle}>{title}</Text>
              {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
            </View>
          </View>
          <View style={styles.settingsRowRight}>
            {rightElement}
          </View>
        </View>
      );
    }

    // For rows without rightElement, use TouchableOpacity for navigation
    return (
      <TouchableOpacity 
        style={styles.settingsRow} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingsRowLeft}>
          <View style={styles.settingsIconContainer}>
            {icon}
          </View>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.settingsRowRight}>
          {showArrow && <Text style={styles.arrow}>›</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image source={require('../../assets/images/logo2.jpg')} style={styles.avatarImage} />
          </View>
          <Text style={styles.profileTitle}>
            {userProfile?.display_name || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.profileSubtitle}>{userProfile?.email || user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingsRowCustom}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconContainer}>
              <MessageCircle size={20} color="#D4AF37" strokeWidth={1.5} />
            </View>
            <View style={styles.settingsTextContainer}>
              <Text style={styles.settingsTitle}>Streaming Speed</Text>
              <Text style={styles.settingsSubtitle}>How fast messages appear</Text>
            </View>
          </View>
        </View>
        <StreamingSpeedSelector />
        
        <HapticToggle />
        <NotificationsToggle />
        <PrivacyToggle />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personalization</Text>
        
        <SettingsRow
          icon={<User size={20} color="#D4AF37" strokeWidth={1.5} />}
          title="Topics & Tradition"
          subtitle="Customize your guidance experience"
          onPress={() => router.push('/preferences')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingsRow
          icon={<MessageCircle size={20} color="#F4A593" strokeWidth={1.5} />}
          title="Community"
          subtitle="Join our mindful community"
          onPress={() => {}}
        />

        <SettingsRow
          icon={<Star size={20} color="#F4A593" strokeWidth={1.5} />}
          title="Rate App"
          subtitle="Help others find peace"
          onPress={() => {}}
        />

        <SettingsRow
          icon={<HelpCircle size={20} color="#F4A593" strokeWidth={1.5} />}
          title="Help & Feedback"
          subtitle="Get support or share thoughts"
          onPress={() => router.push('/feedback')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingsRow
          icon={<LogOut size={20} color="#F87171" strokeWidth={1.5} />}
          title="Sign Out"
          subtitle="Log out of your account"
          onPress={logout}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          feel better v1.0{'\n'}
          Made with compassion for your journey
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  settingsRowRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 18,
  },
  settingsRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  speedSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  speedOption: {
    flex: 1,
    backgroundColor: '#F9F7F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speedOptionSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#B8941F',
  },
  speedOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  speedOptionLabelSelected: {
    color: '#FFFFFF',
  },
  speedOptionDescription: {
    fontSize: 11,
    color: '#6B6B6B',
  },
  speedOptionDescriptionSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
});