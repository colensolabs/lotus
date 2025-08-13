import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Bot as Lotus, Moon, Bell, Heart, MessageCircle, CircleHelp as HelpCircle, Star } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saveConversations, setSaveConversations] = useState(false);

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
          <Text style={styles.profileTitle}>Lotus Guide</Text>
          <Text style={styles.profileSubtitle}>Your Buddhist companion</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
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
          icon={<Moon size={20} color="#D4AF37" strokeWidth={1.5} />}
          title="Dark Mode"
          subtitle="Easier on the eyes"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
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
});