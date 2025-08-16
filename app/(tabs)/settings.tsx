import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Bot as Lotus, Bell, Heart, MessageCircle, CircleHelp as HelpCircle, Star, Vibrate, User, Settings as SettingsIcon, Shield } from 'lucide-react-native';
import { LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStreamingSpeed, StreamingSpeed } from '@/hooks/useStreamingSpeed';
import { useHapticSettings } from '@/hooks/useHapticSettings';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useConversations } from '@/hooks/useConversations';
import { triggerSelectionHaptic } from '@/utils/haptics';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

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
      { value: 'slow', label: 'Slow', description: '~15 chars/sec' },
      { value: 'normal', label: 'Normal', description: '~30 chars/sec' },
      { value: 'fast', label: 'Fast', description: '~50 chars/sec' },
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

  // Separate component for haptic toggle to isolate it
  const HapticToggle = () => {
    const { isEnabled: hapticsEnabled, updateSetting: updateHaptics } = useHapticSettings();
    
    return (
      <SettingsRow
        icon={<Vibrate size={20} color="#D4AF37" strokeWidth={1.5} />}
        title="Haptic Feedback"
        subtitle="Feel the typewriter effect"
        rightElement={
          <Switch
            value={hapticsEnabled}
            onValueChange={updateHaptics}
            trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
            thumbColor="#FEFEFE"
          />
        }
        showArrow={false}
      />
    );
  };

  // Separate component for notifications toggle to isolate it
  const NotificationsToggle = () => {
    const [notifications, setNotifications] = useState(true);
    
    return (
      <SettingsRow
        icon={<Bell size={20} color="#D4AF37" strokeWidth={1.5} />}
        title="Notifications"
        subtitle="Daily wisdom and reminders"
        rightElement={
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
            thumbColor="#FEFEFE"
          />
        }
        showArrow={false}
      />
    );
  };

    // Separate component for privacy toggle to isolate it
  const PrivacyToggle = () => {
    const { preferences: userPrefs, updateSaveConversations } = useUserPreferences();
    const { conversations } = useConversations();
    const { user } = useAuth();
    
    // Calculate the correct switch value directly from preferences (like haptic toggle)
    const switchValue = !(userPrefs?.save_conversations ?? false);
    
    const handlePrivacyToggle = async (newValue: boolean) => {
      console.log('Privacy toggle clicked:', { newValue, currentPrefs: userPrefs?.save_conversations });
      
      if (newValue) {
        // Switch is ON - Turn privacy ON (don't save conversations)
        if (conversations.length > 0) {
          Alert.alert(
            'Delete Existing Conversations?',
            `You have ${conversations.length} saved conversations. Turning on privacy will delete all existing conversations and prevent future conversations from being saved. This cannot be undone.`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete All',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const { error } = await supabase
                      .from('conversations')
                      .update({ is_archived: true })
                      .eq('user_id', user?.id);

                    if (error) throw error;
                    await updateSaveConversations(false);
                    console.log('Privacy enabled - conversations deleted');
                  } catch (error) {
                    console.error('Error deleting conversations:', error);
                    Alert.alert('Error', 'Failed to delete conversations');
                  }
                },
              },
            ]
          );
        } else {
          await updateSaveConversations(false);
          console.log('Privacy enabled - no conversations to delete');
        }
      } else {
        // Switch is OFF - Turn privacy OFF (save conversations)
        await updateSaveConversations(true);
        console.log('Privacy disabled - conversations will be saved');
      }
    };
    
    return (
      <SettingsRow
        icon={<Shield size={20} color="#D4AF37" strokeWidth={1.5} />}
        title="Privacy Mode"
        subtitle="Toggle OFF to save conversations, ON to delete them"
        rightElement={
          <Switch
            value={switchValue}
            onValueChange={handlePrivacyToggle}
            trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
            thumbColor="#FEFEFE"
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
  }) => (
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
        {rightElement}
      </View>
    </TouchableOpacity>
  );

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
          onPress={() => {}}
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
          Lotus Guide v1.0{'\n'}
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