import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackColor?: { false: string; true: string };
  thumbColor?: string;
  disabled?: boolean;
  style?: any;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  trackColor = { false: '#E8E8E8', true: '#D4AF37' },
  thumbColor = '#FEFEFE',
  disabled = false,
  style,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set initial position without animation
    translateX.setValue(value ? 20 : 0);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Only animate if this is not the initial load
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: value ? 20 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [value, isInitialized]);

  const handlePress = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        {
          backgroundColor: value ? trackColor.true : trackColor.false,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbColor,
            transform: [
              { translateX },
              { scale },
            ],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 51,
    height: 31,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.22,
    elevation: 3,
  },
});
