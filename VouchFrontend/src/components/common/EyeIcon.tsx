import React from 'react';
import { Text } from 'react-native';

interface EyeIconProps {
  visible: boolean;
  size?: number;
}

/**
 * 🙈 = password hidden (hands on eyes)
 * 🐵 = password visible (no hands)
 */
export default function EyeIcon({ visible, size = 22 }: EyeIconProps) {
  return (
    <Text style={{ fontSize: size, lineHeight: size + 4 }}>
      {visible ? '🐵' : '🙈'}
    </Text>
  );
}
