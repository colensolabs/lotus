import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Bot as Lotus, Bell, Heart, MessageCircle, CircleHelp as HelpCircle, Star, Vibrate } from 'lucide-react-native';
import { useStreamingSpeed, StreamingSpeed } from '@/hooks/useStreamingSpeed';
import { useHapticSettings } from '@/hooks/useHapticSettings';
import { triggerSelectionHaptic } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { speed, updateSpeed } = useStreamingSpeed();
  const { isEnabled: hapticsEnabled, updateSetting: updateHaptics } = useHapticSettings();
  const { profile, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [saveConversations, setSaveConversations] = useState(false);

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
            onPress={() => updateSpeed(speedOption.value)}
            activeOpacity={0.7}
          >
            {speed === speedOption.value && triggerSelectionHaptic()}
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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.replace('/(auth)/login');
    }
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
          <Text style={styles.profileTitle}>{profile?.display_name || 'User'}</Text>
          <Text style={styles.profileSubtitle}>{profile?.email}</Text>
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
        
        <SettingsRow
          icon={<Vibrate size={20} color="#D4AF37" strokeWidth={1.5} />}
          title="Haptic Feedback"
          subtitle="Feel the typewriter effect"
          rightElement={
            <Switch
              value={hapticsEnabled}
              onValueChange={(value) => {
                updateHaptics(value);
                if (value) triggerSelectionHaptic();
              }}
              trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
              thumbColor="#FEFEFE"
            />
          }
          showArrow={false}
        />
        
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

        <SettingsRow
          icon={<MessageCircle size={20} color="#D4AF37" strokeWidth={1.5} />}
          title="Privacy"
          subtitle="Save conversations locally"
          rightElement={
            <Switch
              value={saveConversations}
              onValueChange={setSaveConversations}
              trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
              thumbColor="#FEFEFE"
            />
          }
          showArrow={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingsRow
          icon={<Heart size={20} color="#F4A593" strokeWidth={1.5} />}
          title="Connect with Teachers"
          subtitle="Get personal guidance"
          onPress={() => {}}
        />

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

        <SettingsRow
          icon={<HelpCircle size={20} color="#F4A593" strokeWidth={1.5} />}
          title="Sign Out"
          subtitle="Log out of your account"
          onPress={handleSignOut}
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