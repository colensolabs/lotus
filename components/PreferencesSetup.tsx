import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useUserPreferences, AVAILABLE_TOPICS, BUDDHIST_TRADITIONS } from '@/hooks/useUserPreferences';

interface PreferencesSetupProps {
  onComplete?: () => void;
  showSkip?: boolean;
}

export const PreferencesSetup: React.FC<PreferencesSetupProps> = ({
  onComplete,
  showSkip = true,
}) => {
  const { createOrUpdatePreferences } = useUserPreferences();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTradition, setSelectedTradition] = useState<'secular' | 'general_buddhist' | 'theravada' | 'mahayana' | 'tibetan' | 'zen'>('general_buddhist');
  const [isLoading, setIsLoading] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    const result = await createOrUpdatePreferences(selectedTopics, selectedTradition);
    
    setIsLoading(false);
    
    if (result.success) {
      onComplete?.();
    } else {
      Alert.alert('Error', result.error || 'Failed to save preferences');
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Personalize Your Experience</Text>
        <Text style={styles.subtitle}>
          Help us provide guidance that resonates with your interests and spiritual background
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Topics of Interest</Text>
        <Text style={styles.sectionSubtitle}>Select areas where you'd like guidance (optional)</Text>
        
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
        <Text style={styles.sectionSubtitle}>Choose the approach that feels right for you</Text>
        
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
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
        
        {showSkip && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

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
    marginBottom: 32,
    alignItems: 'center',
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
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B6B6B',
    fontSize: 16,
    fontWeight: '500',
  },
});