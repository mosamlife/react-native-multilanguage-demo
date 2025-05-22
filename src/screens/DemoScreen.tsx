import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useLanguage, SAMPLE_TEXTS, EMOJI_SAMPLE_TEXTS, SupportedLanguage } from '../contexts/LanguageContext';
import Text from '../components/Text';
import LanguageSelector from '../components/LanguageSelector';
import TextScalingDemo from '../components/TextScalingDemo';
import { createTextStyle, getLineHeight, getScriptForLanguage } from '../utils/typography';

/**
 * Main demo screen that showcases different text styles and line height adjustments
 */
const DemoScreen: React.FC = () => {
  const { language } = useLanguage();
  const [showComparison, setShowComparison] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Sample text for the current language
  const sampleText = SAMPLE_TEXTS[language];
  const emojiSampleText = EMOJI_SAMPLE_TEXTS[language];
  
  // Get script and calculate dynamic line height
  const script = getScriptForLanguage(language);
  const dynamicLineHeight = getLineHeight(fontSize, script);
  
  // Sample text for all languages
  const allLanguagesSample = (
    <View style={styles.allLanguagesContainer}>
      {Object.entries(SAMPLE_TEXTS).map(([lang, text]) => (
        <View key={lang} style={styles.languageSample}>
          <Text variant="caption" style={styles.languageLabel}>
            {lang.toUpperCase()}:
          </Text>
          <Text style={styles.sampleText}>
            {text}
          </Text>
        </View>
      ))}
    </View>
  );

  // Emoji demo section
  const emojiDemo = (
    <View style={styles.emojiContainer}>
      <Text variant="h3" style={styles.sectionTitle}>Emoji Support</Text>
      <View style={styles.textContainer}>
        <Text fontSize={fontSize}>
          {emojiSampleText}
        </Text>
      </View>
    </View>
  );

  // Line height comparison section
  const lineHeightComparison = showComparison && (
    <View style={styles.comparisonContainer}>
      <Text variant="h3" style={styles.sectionTitle}>Line Height Comparison</Text>
      
      <View style={styles.comparisonRow}>
        <View style={styles.comparisonColumn}>
          <Text style={styles.comparisonTitle}>With Dynamic Line Height</Text>
          <View style={styles.textContainer}>
            <Text fontSize={fontSize}>{sampleText}</Text>
          </View>
          <Text style={styles.comparisonSubtitle}>
            Line height: {dynamicLineHeight}px ({(dynamicLineHeight / fontSize).toFixed(2)}x)
          </Text>
        </View>
        
        <View style={styles.comparisonColumn}>
          <Text style={styles.comparisonTitle}>Fixed Line Height (1.2)</Text>
          <View style={styles.textContainer}>
            <Text style={{ fontSize, lineHeight: fontSize * 1.2 }}>{sampleText}</Text>
          </View>
          <Text style={styles.comparisonSubtitle}>
            Line height: {Math.round(fontSize * 1.2)}px (1.20x)
          </Text>
        </View>
      </View>
    </View>
  );

  // Font size adjustment
  const fontSizeAdjustment = (
    <View style={styles.fontSizeContainer}>
      <Text variant="h3" style={styles.sectionTitle}>Font Size Adjustment</Text>
      <View style={styles.fontSizeControls}>
        <TouchableOpacity 
          style={styles.fontSizeButton} 
          onPress={() => setFontSize(Math.max(8, fontSize - 2))}
        >
          <Text style={styles.fontSizeButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.fontSizeValue}>{fontSize}px</Text>
        <TouchableOpacity 
          style={styles.fontSizeButton} 
          onPress={() => setFontSize(Math.min(32, fontSize + 2))}
        >
          <Text style={styles.fontSizeButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.fontSizeSample}>
        <Text fontSize={fontSize}>{sampleText}</Text>
      </View>
      <Text style={styles.fontSizeInfo}>
        Dynamic line height: {dynamicLineHeight}px ({(dynamicLineHeight / fontSize).toFixed(2)}x)
      </Text>
    </View>
  );

  // Typography showcase
  const typographyShowcase = (
    <View style={styles.typographyContainer}>
      <Text variant="h3" style={styles.sectionTitle}>Typography Showcase</Text>
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="body1">Body 1: {sampleText}</Text>
      <Text variant="body2">Body 2: {sampleText}</Text>
      <Text variant="caption">Caption: {sampleText}</Text>
      <Text variant="button">Button Text</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h2" style={styles.header}>
          Multilingual Text Demo
        </Text>
        
        <LanguageSelector mode="buttons" />
        
        <View style={styles.switchContainer}>
          <Text>Show Line Height Comparison</Text>
          <Switch
            value={showComparison}
            onValueChange={setShowComparison}
          />
        </View>
        
        <TextScalingDemo sampleText={sampleText} />
        {emojiDemo}
        {lineHeightComparison}
        {fontSizeAdjustment}
        {typographyShowcase}
        {allLanguagesSample}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  emojiContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  comparisonContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
  },
  comparisonColumn: {
    flex: 1,
    padding: 5,
  },
  comparisonTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  comparisonSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    color: '#666',
  },
  textContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    minHeight: 100,
  },
  fontSizeContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  fontSizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fontSizeValue: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontSizeSample: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  fontSizeInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    color: '#666',
  },
  typographyContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  allLanguagesContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  languageSample: {
    marginBottom: 15,
  },
  languageLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sampleText: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
});

export default DemoScreen;
