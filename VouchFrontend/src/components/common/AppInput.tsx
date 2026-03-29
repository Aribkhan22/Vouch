import React, { forwardRef } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '@utils/constants';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

const AppInput = forwardRef<TextInput, AppInputProps>(
  // Destructure `style` as `propStyle` so it is NOT inside `...props`.
  // Without this, `{...props}` would spread `style` AFTER the explicit style
  // array and override it — stripping border, background, etc.
  ({ label, error, required, containerStyle, style: propStyle, ...props }, ref) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          style={[
            styles.inputBase,
            props.multiline ? styles.inputMultiline : styles.inputSingleLine,
            error ? styles.inputError : null,
            propStyle,
          ]}
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          {...props}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';
export default AppInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: COLORS.error,
    fontWeight: '700',
  },
  // Base input styles shared by single-line and multiline
  inputBase: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  // Only single-line gets a fixed height
  inputSingleLine: {
    height: 50,
  },
  // Multiline grows freely
  inputMultiline: {
    minHeight: 110,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.error,
  },
});
