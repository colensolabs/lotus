import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StreamingSpeed = 'slow' | 'normal' | 'fast';

// Making speed differences more dramatic for testing
const SPEED_MAP: Record<StreamingSpeed, number> = {
  slow: 8,     // 8 characters per second (was 15)
  normal: 25,  // 25 characters per second (was 30)
  fast: 60,    // 60 characters per second (was 50)
};

const STORAGE_KEY = 'streaming_speed';

export const useStreamingSpeed = () => {
  const [speed, setSpeed] = useState<StreamingSpeed>('normal');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSpeed();
    
    // Poll for speed changes every second
    const interval = setInterval(async () => {
      try {
        const savedSpeed = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSpeed && (savedSpeed === 'slow' || savedSpeed === 'normal' || savedSpeed === 'fast')) {
          if (savedSpeed !== speed) {
            console.log('Speed change detected via polling:', savedSpeed);
            setSpeed(savedSpeed as StreamingSpeed);
          }
        }
      } catch (error) {
        console.error('Error polling for speed changes:', error);
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [speed]);

  // Debug effect to track speed changes
  useEffect(() => {
    console.log('Speed state changed in hook:', speed);
  }, [speed]);

  const loadSpeed = async () => {
    try {
      const savedSpeed = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('Loading saved speed from storage:', savedSpeed);
      if (savedSpeed && (savedSpeed === 'slow' || savedSpeed === 'normal' || savedSpeed === 'fast')) {
        setSpeed(savedSpeed as StreamingSpeed);
        console.log('Speed loaded from storage:', savedSpeed);
      } else {
        console.log('No saved speed found, using default:', 'normal');
      }
    } catch (error) {
      console.error('Error loading streaming speed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSpeed = async (newSpeed: StreamingSpeed) => {
    try {
      console.log('Updating speed to:', newSpeed);
      await AsyncStorage.setItem(STORAGE_KEY, newSpeed);
      setSpeed(newSpeed);
      console.log('Streaming speed updated successfully:', { newSpeed, speedValue: SPEED_MAP[newSpeed] });
      console.log('Speed state after update:', speed); // This will show the old value due to closure
    } catch (error) {
      console.error('Error saving streaming speed:', error);
    }
  };

  // Use useMemo to ensure speedValue updates when speed changes
  const speedValue = useMemo(() => {
    const value = SPEED_MAP[speed];
    console.log('Calculating speed value:', { speed, speedValue: value });
    return value;
  }, [speed]);

  return {
    speed,
    speedValue,
    updateSpeed,
    isLoading,
  };
};