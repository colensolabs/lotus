import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notifications_enabled';

export const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null); // Start with null to indicate loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSetting = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSetting !== null) {
        setIsEnabled(JSON.parse(savedSetting));
      } else {
        setIsEnabled(true); // Default to true if no saved setting
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      setIsEnabled(true); // Default to true on error
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
      setIsEnabled(enabled);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  return {
    isEnabled,
    updateSetting,
    isLoading,
  };
};
