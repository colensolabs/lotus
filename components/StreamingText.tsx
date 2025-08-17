import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import { triggerTypewriterHaptic } from '@/utils/haptics';

interface StreamingTextProps {
  text: string;
  speed: number; // characters per second
  onComplete?: () => void;
  onCancel?: () => void;
  isCancelled?: boolean;
  hapticsEnabled?: boolean;
  style?: any;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed,
  onComplete,
  onCancel,
  isCancelled = false,
  hapticsEnabled = false,
  style,
}) => {
  // Debug logging for received speed
  console.log('StreamingText received speed:', { speed, speedType: typeof speed });
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);
  const hapticCounterRef = useRef(0);
  const previousSpeedRef = useRef(speed);

  // Track speed changes
  useEffect(() => {
    if (previousSpeedRef.current !== speed) {
      console.log('Speed changed from', previousSpeedRef.current, 'to', speed);
      previousSpeedRef.current = speed;
    }
  }, [speed]);

  // Format text with bullet points for better display
  const formatText = (text: string) => {
    return text
      .replace(/^•\s*/gm, '• ')
      .replace(/^\*\s*/gm, '• ')
      .replace(/^\d+\.\s*/gm, '• ');
  };

  // Clear interval helper
  const clearCurrentInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start streaming with current speed
  const startStreaming = () => {
    clearCurrentInterval();
    
    if (isCancelled) {
      setDisplayedText(formatText(text));
      setIsComplete(true);
      onComplete?.();
      return;
    }

    // Reset state
    setDisplayedText('');
    setIsComplete(false);
    currentIndexRef.current = 0;
    hapticCounterRef.current = 0;

    const formattedText = formatText(text);
    const intervalMs = 1000 / speed;

    console.log('Starting streaming with speed:', speed, 'intervalMs:', intervalMs);

    intervalRef.current = setInterval(() => {
      if (currentIndexRef.current >= formattedText.length) {
        clearCurrentInterval();
        setIsComplete(true);
        onComplete?.();
        return;
      }

      const currentChar = formattedText[currentIndexRef.current];
      const nextText = formattedText.substring(0, currentIndexRef.current + 1);
      
      setDisplayedText(nextText);
      currentIndexRef.current++;
      
      // Trigger haptic feedback every few characters
      if (hapticsEnabled) {
        hapticCounterRef.current++;
        if (hapticCounterRef.current % 3 === 0) {
          triggerTypewriterHaptic();
        }
      }

      // Add pause after sentence endings
      if (currentChar === '.' || currentChar === '!' || currentChar === '?') {
        clearCurrentInterval();
        setTimeout(() => {
          if (!isCancelled && currentIndexRef.current < formattedText.length) {
            intervalRef.current = setInterval(() => {
              if (currentIndexRef.current >= formattedText.length) {
                clearCurrentInterval();
                setIsComplete(true);
                onComplete?.();
                return;
              }

              const nextText = formattedText.substring(0, currentIndexRef.current + 1);
              setDisplayedText(nextText);
              currentIndexRef.current++;
              
              if (hapticsEnabled) {
                hapticCounterRef.current++;
                if (hapticCounterRef.current % 3 === 0) {
                  triggerTypewriterHaptic();
                }
              }
            }, intervalMs);
          }
        }, Math.random() * 100 + 150);
      }
    }, intervalMs);
  };

  // Effect to handle text and speed changes
  useEffect(() => {
    console.log('StreamingText effect triggered with speed:', speed);
    startStreaming();

    return () => {
      clearCurrentInterval();
    };
  }, [text, speed, isCancelled, hapticsEnabled]);

  return (
    <Text style={style}>
      {displayedText}
      {!isComplete && !isCancelled && (
        <Text style={styles.cursor}>|</Text>
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  cursor: {
    opacity: 0.7,
    color: '#D4AF37',
  },
});