import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
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
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const hapticCounterRef = useRef(0);

  // Format text with bullet points for better display
  const formatText = (text: string) => {
    return text
      .replace(/^•\s*/gm, '• ')
      .replace(/^\*\s*/gm, '• ')
      .replace(/^\d+\.\s*/gm, '• ');
  };

  useEffect(() => {
    if (isCancelled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setDisplayedText(formatText(text));
      setIsComplete(true);
      onComplete?.();
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    currentIndexRef.current = 0;
    hapticCounterRef.current = 0;

    const formattedText = formatText(text);
    const intervalMs = 1000 / speed;

    intervalRef.current = setInterval(() => {
      if (currentIndexRef.current >= formattedText.length) {
        clearInterval(intervalRef.current!);
        setIsComplete(true);
        onComplete?.();
        return;
      }

      const currentChar = formattedText[currentIndexRef.current];
      const nextText = formattedText.substring(0, currentIndexRef.current + 1);
      
      setDisplayedText(nextText);
      currentIndexRef.current++;
      
      // Trigger haptic feedback every few characters to avoid overwhelming
      if (hapticsEnabled) {
        hapticCounterRef.current++;
        if (hapticCounterRef.current % 3 === 0) { // Every 3rd character
          triggerTypewriterHaptic();
        }
      }

      // Add pause after sentence endings
      if (currentChar === '.' || currentChar === '!' || currentChar === '?') {
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          if (!isCancelled && currentIndexRef.current < formattedText.length) {
            intervalRef.current = setInterval(() => {
              if (currentIndexRef.current >= formattedText.length) {
                clearInterval(intervalRef.current!);
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
        }, Math.random() * 100 + 150); // 150-250ms pause
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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