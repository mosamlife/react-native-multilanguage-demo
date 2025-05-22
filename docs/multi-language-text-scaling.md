# Multi-Language Text Scaling Solution

## Problem Statement

When developing a React Native application that supports multiple languages with different scripts (Latin, Devanagari, Gujarati, Punjabi), we encountered line height issues when users increased their device text size. This was particularly problematic for non-Latin scripts like Hindi, Gujarati, and Punjabi, which have different typographic requirements compared to English text.

The specific issues included:

- Line height inconsistencies between different scripts
- Text overlapping or being cut off when device text scaling was increased
- Poor readability for non-Latin scripts when using default line heights
- Layout issues when device text scaling was set to maximum values

## Solution Overview

We implemented a comprehensive text scaling solution that:

1. Applies appropriate line heights for each script/language
2. Handles device text scaling in a controlled manner
3. Caps text scaling at configurable maximum values to prevent layout issues
4. Provides a consistent text appearance across all supported languages

## Key Components

### 1. Typography Utilities (`typography.ts`)

This module handles script-specific text styling:

```typescript
// Script-specific line height multipliers
const lineHeightMultipliers: Record<string, number> = {
  latin: 1.25,      // For English (Plus Jakarta Sans)
  devanagari: 1.5,  // For Hindi (Noto Sans Devanagari)
  gujarati: 1.45,   // For Gujarati (Noto Sans Gujarati)
  gurmukhi: 1.45,   // For Punjabi (Noto Sans Gurmukhi)
};
```

- **Line Height Calculation**: Each script has a specific multiplier that determines the appropriate line height based on font size.
- **Font Family Mapping**: Maps each language to its appropriate font family.
- **Text Style Creation**: Generates complete text styles with the correct font family and line height for each language.

### 2. Text Scaling Manager (`TextScalingManager.ts`)

This utility manages device text scaling settings:

```typescript
// Maximum allowed scale factor (configurable)
static MAX_ALLOWED_SCALE = Platform.OS === 'ios' ? 2.0 : 1.8;

// Get a normalized scale factor that caps at MAX_ALLOWED_SCALE
static getNormalizedScale(): number {
  if (this._normalizedScale === null) {
    const deviceScale = this.getDeviceScale();
    this._normalizedScale = Math.min(deviceScale, this.MAX_ALLOWED_SCALE);
  }
  return this._normalizedScale;
}
```

- **Normalized Scaling**: Instead of completely disabling font scaling when the user maxes out their device settings, we cap it at a configurable maximum value.
- **Recommended Max Scales**: Different text variants (headings, body text) have different maximum scale factors.
- **Runtime Configuration**: The maximum allowed scale can be adjusted at runtime.

### 3. Custom Text Component (`Text.tsx`)

Our custom Text component automatically applies the correct styling based on language:

```typescript
// Set default maxFontSizeMultiplier based on variant
if (defaultMaxFontSizeMultiplier === undefined) {
  if (variant === 'h1') {
    defaultMaxFontSizeMultiplier = TextScalingManager.RECOMMENDED_MAX_SCALE.h1;
  } else if (variant === 'h2') {
    defaultMaxFontSizeMultiplier = TextScalingManager.RECOMMENDED_MAX_SCALE.h2;
  } // ...and so on
}
```

- **Language-Aware Styling**: Uses the current language to apply the appropriate font family and line height.
- **Variant-Based Scaling**: Different text variants (h1, h2, body, etc.) have different maximum scaling factors.
- **Controlled Font Scaling**: Uses `maxFontSizeMultiplier` to limit how much the text can scale based on device settings.

### 4. Language Context (`LanguageContext.tsx`)

Manages the current language and provides language-specific configurations:

```typescript
export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: { code: 'en', name: 'English', fontFamily: 'PlusJakartaSans', script: 'latin' },
  hi: { code: 'hi', name: 'हिन्दी', fontFamily: 'NotoSansDevanagari', script: 'devanagari' },
  // ...other languages
};
```

- **Language Configuration**: Defines supported languages with their scripts and font families.
- **Language Switching**: Allows changing the app language and persists the selection.

## How Dynamic Line Height Calculation Works

1. **Script Detection**: When text is rendered, we first identify which script is being used based on the current language.

2. **Base Font Size Determination**: The base font size is determined by the text variant (h1, h2, body, etc.) or explicitly provided.

3. **Line Height Calculation**: The line height is calculated using the script-specific multiplier:
   ```typescript
   const multiplier = lineHeightMultipliers[script] || lineHeightMultipliers.latin;
   return Math.ceil(fontSize * multiplier);
   ```

4. **Device Scale Consideration**: When the user increases their device text size:
   - The font size scales according to the device settings, but capped at our maximum value
   - The line height scales proportionally, maintaining the correct ratio for the script

5. **Maximum Scale Capping**: Instead of disabling scaling completely when the user sets very large text sizes, we cap the scaling at a reasonable maximum:
   ```typescript
   const normalizedScale = Math.min(deviceScale, MAX_ALLOWED_SCALE);
   ```

## Benefits of This Approach

1. **Consistent Typography**: Maintains appropriate typography across all supported languages.

2. **Accessibility Support**: Respects the user's text size preferences while preventing layout issues.

3. **Script-Specific Handling**: Different scripts have different typographic needs, and our solution addresses these differences.

4. **Configurable Limits**: Maximum scaling values can be adjusted based on specific app needs or user preferences.

5. **Graceful Degradation**: When users set extremely large text sizes, the app still maintains usability by capping at reasonable maximums rather than breaking layouts.

## Demo Component

The `TextScalingDemo` component provides a visual demonstration of how text scaling works:

- Shows device scaling information
- Allows simulating different scale factors
- Compares unconstrained vs. constrained scaling
- Demonstrates the maximum scale behavior
- Provides a UI to configure the maximum allowed scale

## Implementation Steps

If you want to implement this solution in your own React Native app, follow these steps:

1. **Add Required Fonts**:
   - Place font files in the `assets/fonts/` directory
   - Include fonts for all supported languages/scripts

2. **Create Typography Utilities**:
   - Define script-specific line height multipliers
   - Create helper functions for font family mapping and line height calculation

3. **Implement Text Scaling Manager**:
   - Create a utility to handle device text scaling
   - Define maximum scale constraints
   - Implement normalized scaling

4. **Create a Custom Text Component**:
   - Apply appropriate styling based on language
   - Use maxFontSizeMultiplier to control scaling
   - Apply script-specific line heights

5. **Set Up Language Context**:
   - Define supported languages and their configurations
   - Create a context provider for language switching

6. **Use the Custom Text Component**:
   - Replace all instances of React Native's Text component with your custom one
   - Apply appropriate text variants (h1, h2, body, etc.)

## Conclusion

This comprehensive solution ensures that text in all supported languages displays correctly, with appropriate line heights, while still respecting user accessibility preferences for text scaling. By implementing script-specific line heights and controlled text scaling, we've created a robust system that works well across different languages and device settings.
