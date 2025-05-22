import { PixelRatio, Platform, Dimensions } from 'react-native';
import { SupportedLanguage } from '../contexts/LanguageContext';
import TextScalingManager from './TextScalingManager';

// Get device dimensions
const { width, height } = Dimensions.get('window');
const screenWidth = Math.min(width, height);
const screenHeight = Math.max(width, height);

// Base scale factor for different device sizes
const scale = screenWidth / 375; // based on iPhone 8 as baseline

/**
 * Scale font size based on screen size only
 * Accessibility scaling is handled by the Text component using maxFontSizeMultiplier
 */
export const scaleFontSize = (size: number): number => {
  // Apply screen size scaling only
  const screenScaledSize = size * scale;
  
  // Round to nearest pixel based on platform
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(screenScaledSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(screenScaledSize)) - 2;
};

/**
 * Script-specific line height multipliers
 * These values are carefully tuned for each script to ensure proper text rendering
 */
const lineHeightMultipliers: Record<string, number> = {
  latin: 1.25,      // For English (Plus Jakarta Sans)
  devanagari: 1.5,  // For Hindi (Noto Sans Devanagari)
  gujarati: 1.45,   // For Gujarati (Noto Sans Gujarati)
  gurmukhi: 1.45,   // For Punjabi (Noto Sans Gurmukhi)
};

/**
 * Calculate appropriate line height based on font size and script
 */
export const getLineHeight = (
  fontSize: number,
  script: 'latin' | 'devanagari' | 'gujarati' | 'gurmukhi'
): number => {
  const multiplier = lineHeightMultipliers[script] || lineHeightMultipliers.latin;
  return Math.ceil(fontSize * multiplier);
};

/**
 * Map language code to script type
 */
export const getScriptForLanguage = (
  language: SupportedLanguage
): 'latin' | 'devanagari' | 'gujarati' | 'gurmukhi' => {
  const scriptMap: Record<SupportedLanguage, 'latin' | 'devanagari' | 'gujarati' | 'gurmukhi'> = {
    en: 'latin',
    hi: 'devanagari',
    gu: 'gujarati',
    pa: 'gurmukhi',
  };
  return scriptMap[language] || 'latin';
};

/**
 * Get font family for a specific language
 */
export const getFontFamily = (language: SupportedLanguage): string => {
  const fontMap: Record<SupportedLanguage, string> = {
    en: 'PlusJakartaSans',
    hi: 'NotoSansDevanagari',
    gu: 'NotoSansGujarati',
    pa: 'NotoSansGurmukhi',
  };
  return fontMap[language] || 'PlusJakartaSans';
};

/**
 * Generate complete text style with appropriate font family and line height
 */
export const createTextStyle = (
  fontSize: number,
  language: SupportedLanguage,
  additionalStyles = {}
) => {
  const script = getScriptForLanguage(language);
  const fontFamily = getFontFamily(language);
  const scaledFontSize = scaleFontSize(fontSize);
  
  return {
    fontSize: scaledFontSize,
    fontFamily,
    lineHeight: getLineHeight(scaledFontSize, script),
    ...additionalStyles,
  };
};

/**
 * Predefined text styles for different purposes
 */
export const createTypography = (language: SupportedLanguage) => {
  return {
    h1: createTextStyle(32, language, { fontWeight: 'bold' }),
    h2: createTextStyle(24, language, { fontWeight: 'bold' }),
    h3: createTextStyle(20, language, { fontWeight: 'bold' }),
    body1: createTextStyle(16, language),
    body2: createTextStyle(14, language),
    caption: createTextStyle(12, language),
    button: createTextStyle(16, language, { fontWeight: 'bold' }),
  };
};
