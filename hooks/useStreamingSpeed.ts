import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StreamingSpeed = 'slow' | 'normal' | 'fast';

const SPEED_MAP: Record<StreamingSpeed, number> = {
  slow: 15,
  normal: 30,
  fast: 50,
};

const STORAGE_KEY = 'streaming_speed';

export const useStreamingSpeed = () => {
  const [speed, setSpeed] = useState<StreamingSpeed>('normal');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSpeed();
  }, []);

  const loadSpeed = async () => {
    try {
      const savedSpeed = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSpeed && (savedSpeed === 'slow' || savedSpeed === 'normal' || savedSpeed === 'fast')) {
        setSpeed(savedSpeed as StreamingSpeed);
      }
    } catch (error) {
      console.error('Error loading streaming speed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSpeed = async (newSpeed: StreamingSpeed) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newSpeed);
      setSpeed(newSpeed);
    } catch (error) {
      console.error('Error saving streaming speed:', error);
    }
  };

  const getSpeedValue = () => SPEED_MAP[speed];

  return {
    speed,
    speedValue: getSpeedValue(),
    updateSpeed,
    isLoading,
  };
};