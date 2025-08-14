import { useEffect } from 'react';
import { Platform } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, we don't need to wait for framework ready
      if (typeof window !== 'undefined' && window.frameworkReady) {
        window.frameworkReady();
      }
    }
    // For native platforms, the framework is ready by default
  });
}
