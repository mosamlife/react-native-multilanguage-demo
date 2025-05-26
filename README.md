# Multi-Language Demo App

A React Native Expo application demonstrating best practices for handling multiple languages with different scripts (Latin, Devanagari, Gujarati, Punjabi) and proper text scaling for accessibility.

## Features

- Support for multiple languages (English, Hindi, Gujarati, Punjabi)
- Script-specific typography with appropriate line heights
- Intelligent text scaling that respects device accessibility settings
- Configurable maximum scale factors to prevent layout issues
- Interactive demo to visualize text scaling behavior

## Problem Solved

This demo app addresses a common issue in multi-language apps: when users increase their device text size, non-Latin scripts like Hindi, Gujarati, and Punjabi often have line height issues that affect readability and layout. Our solution provides script-specific line heights and controlled text scaling to ensure a consistent experience across all languages.

## Key Components

- **Custom Text Component**: Automatically applies the correct font family and line height based on the current language
- **Typography Utilities**: Handles script-specific text styling with appropriate line height multipliers
- **Text Scaling Manager**: Manages device text scaling settings with configurable maximum values
- **Language Context**: Manages the current language and provides language-specific configurations

## Documentation

For detailed information about the multi-language text scaling solution, see:

- [Multi-Language Text Scaling Documentation](docs/multi-language-text-scaling.md)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open the app on your device or simulator

## Testing Text Scaling

To test the text scaling behavior:

1. Change your device's text size in the system settings
2. Observe how the app adapts to different text sizes
3. Use the demo screen to compare different scaling behaviors
4. Try switching between languages to see how different scripts are handled

## License

MIT
