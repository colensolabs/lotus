import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const triggerTypewriterHaptic = () => {
  if (Platform.OS !== 'web') {
    try {
      // Use a very light haptic feedback for typewriter effect
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics are not available
      console.log('Haptics not available:', error);
    }
  }
};

export const triggerSelectionHaptic = () => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }
};