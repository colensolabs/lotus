import { useEffect } from 'react';
import { useHapticSettings } from './useHapticSettings';
import { useNotifications } from './useNotifications';
import { usePrivacySettings } from './usePrivacySettings';

/**
 * Hook to preload all settings in the background
 * This ensures settings are ready when user navigates to settings screen
 */
export const useSettingsPreloader = () => {
  const hapticSettings = useHapticSettings();
  const notificationSettings = useNotifications();
  const privacySettings = usePrivacySettings();

  // This hook doesn't return anything - it just ensures the settings are loaded
  // The individual hooks will handle their own state management

  return {
    isHapticLoading: hapticSettings.isLoading,
    isNotificationsLoading: notificationSettings.isLoading,
    isPrivacyLoading: privacySettings.isLoading,
    isAllSettingsLoaded: !hapticSettings.isLoading && !notificationSettings.isLoading && !privacySettings.isLoading,
  };
};
