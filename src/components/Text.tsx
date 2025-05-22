import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { createTextStyle } from '../utils/typography';
import TextScalingManager from '../utils/TextScalingManager';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption' | 'button';
  fontSize?: number;
  children: React.ReactNode;
  maxFontSizeMultiplier?: number;
}

/**
 * Custom Text component that automatically applies the correct font family
 * and line height based on the current language.
 */
export const Text: React.FC<CustomTextProps> = ({
  variant,
  fontSize,
  style,
  children,
  maxFontSizeMultiplier,
  allowFontScaling,
  ...props
}) => {
  const { language } = useLanguage();
  
  // Determine base style based on variant
  let baseStyle = {};
  
  // Set default maxFontSizeMultiplier based on variant if not explicitly provided
  let defaultMaxFontSizeMultiplier = maxFontSizeMultiplier;
  if (defaultMaxFontSizeMultiplier === undefined) {
    // Headers need less scaling than body text
    if (variant === 'h1') {
      defaultMaxFontSizeMultiplier = TextScalingManager.RECOMMENDED_MAX_SCALE.h1;
    } else if (variant === 'h2') {
      defaultMaxFontSizeMultiplier = TextScalingManager.RECOMMENDED_MAX_SCALE.h2;
    } else if (variant === 'h3') {
      defaultMaxFontSizeMultiplier = TextScalingManager.RECOMMENDED_MAX_SCALE.h3;
    } else {
      defaultMaxFontSizeMultiplier = TextScalingManager.RECOMMENDED_MAX_SCALE.body;
    }
  }
  
  if (variant) {
    switch (variant) {
      case 'h1':
        baseStyle = createTextStyle(32, language, { fontWeight: 'bold' });
        break;
      case 'h2':
        baseStyle = createTextStyle(24, language, { fontWeight: 'bold' });
        break;
      case 'h3':
        baseStyle = createTextStyle(20, language, { fontWeight: 'bold' });
        break;
      case 'body1':
        baseStyle = createTextStyle(16, language);
        break;
      case 'body2':
        baseStyle = createTextStyle(14, language);
        break;
      case 'caption':
        baseStyle = createTextStyle(12, language);
        break;
      case 'button':
        baseStyle = createTextStyle(16, language, { fontWeight: 'bold' });
        break;
    }
  } else if (fontSize) {
    // If no variant but fontSize is provided, create style with that fontSize
    baseStyle = createTextStyle(fontSize, language);
  } else {
    // Default style
    baseStyle = createTextStyle(16, language);
  }

  return (
    <RNText
      style={[baseStyle, style]}
      maxFontSizeMultiplier={defaultMaxFontSizeMultiplier}
      allowFontScaling={allowFontScaling !== undefined ? allowFontScaling : true}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
