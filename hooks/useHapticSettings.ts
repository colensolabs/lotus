import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'haptic_feedback_enabled';

export const useHapticSettings = () => {
  const [isEnabled, setIsEnabled] = useState(true); // Default to true (ON)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSetting = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSetting !== null) {
        setIsEnabled(JSON.parse(savedSetting));
      }
    } catch (error) {
      console.error('Error loading haptic settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
      setIsEnabled(enabled);
    } catch (error) {
      console.error('Error saving haptic settings:', error);
    }
  };

  return {
    isEnabled,
    updateSetting,
    isLoading,
  };
};