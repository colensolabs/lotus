import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'react-native';
import { Check, Save, ArrowLeft } from 'lucide-react-native';
import { useUserPreferences, AVAILABLE_TOPICS, BUDDHIST_TRADITIONS } from '@/hooks/useUserPreferences';
import { router } from 'expo-router';

export default function PreferencesScreen() {
  const { preferences, isLoading, createOrUpdatePreferences } = useUserPreferences();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTradition, setSelectedTradition] = useState<'secular' | 'general_buddhist' | 'theravada' | 'mahayana' | 'tibetan' | 'zen'>('general_buddhist');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setSelectedTopics(preferences.topics_of_interest || []);
      setSelectedTradition(preferences.buddhist_tradition);
    }
  }, [preferences]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const result = await createOrUpdatePreferences(selectedTopics, selectedTradition);
    
    setIsSaving(false);
    
    if (result.success) {
      Alert.alert('Success', 'Your preferences have been saved', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to save preferences');
    }
  };

  const handleExit = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <ArrowLeft size={24} color="#D4AF37" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <Image source={require('../../assets/images/logo2.jpg')} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>Your Preferences</Text>
        <Text style={styles.subtitle}>
          Customize your guidance experience based on your interests and spiritual background
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Topics of Interest</Text>
        <Text style={styles.sectionSubtitle}>
          Select areas where you'd like personalized guidance ({selectedTopics.length} selected)
        </Text>
        
        <View style={styles.topicsGrid}>
          {AVAILABLE_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[
                styles.topicChip,
                selectedTopics.includes(topic) && styles.topicChipSelected
              ]}
              onPress={() => toggleTopic(topic)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.topicChipText,
                selectedTopics.includes(topic) && styles.topicChipTextSelected
              ]}>
                {topic}
              </Text>
              {selectedTopics.includes(topic) && (
                <Check size={16} color="#FFFFFF" strokeWidth={2} style={styles.topicCheckIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buddhist Tradition</Text>
        <Text style={styles.sectionSubtitle}>Choose the approach that resonates with you</Text>
        
        <View style={styles.traditionsContainer}>
          {BUDDHIST_TRADITIONS.map((tradition) => (
            <TouchableOpacity
              key={tradition.value}
              style={[
                styles.traditionCard,
                selectedTradition === tradition.value && styles.traditionCardSelected
              ]}
              onPress={() => setSelectedTradition(tradition.value)}
              activeOpacity={0.7}
            >
              <View style={styles.traditionHeader}>
                <Text style={[
                  styles.traditionTitle,
                  selectedTradition === tradition.value && styles.traditionTitleSelected
                ]}>
                  {tradition.label}
                </Text>
                {selectedTradition === tradition.value && (
                  <View style={styles.traditionCheckContainer}>
                    <Check size={16} color="#FFFFFF" strokeWidth={2} />
                  </View>
                )}
              </View>
              <Text style={[
                styles.traditionDescription,
                selectedTradition === tradition.value && styles.traditionDescriptionSelected
              ]}>
                {tradition.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Save size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.exitButtonSecondary}
          onPress={handleExit}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.exitButtonText}>Back to Settings</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F1E8',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B6B6B',
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
    position: 'relative',
  },
  exitButton: {
    position: 'absolute',
    top: 0,
    left: 24,
    zIndex: 1,
    padding: 8,
  },
  iconContainer: {
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
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 16,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 8,
  },
  topicChipSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  topicChipText: {
    fontSize: 14,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  topicChipTextSelected: {
    color: '#FFFFFF',
  },
  topicCheckIcon: {
    marginLeft: 6,
  },
  traditionsContainer: {
    gap: 12,
  },
  traditionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  traditionCardSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  traditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  traditionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  traditionTitleSelected: {
    color: '#FFFFFF',
  },
  traditionCheckContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  traditionDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  traditionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actions: {
    paddingHorizontal: 24,
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exitButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  exitButtonText: {
    color: '#6B6B6B',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});