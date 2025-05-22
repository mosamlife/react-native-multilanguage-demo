import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import Text from './Text';
import TextScalingManager from '../utils/TextScalingManager';
import { useLanguage } from '../contexts/LanguageContext';
import { getScriptForLanguage, getLineHeight } from '../utils/typography';

interface TextScalingDemoProps {
  sampleText: string;
}

/**
 * Component that demonstrates text scaling behavior
 * Shows device text scaling info and allows simulation of different scale factors
 */
const TextScalingDemo: React.FC<TextScalingDemoProps> = ({ sampleText }) => {
  const { language } = useLanguage();
  const [simulatedScale, setSimulatedScale] = useState(1.0);
  
  // Get actual device scaling info
  const scalingInfo = TextScalingManager.getScalingInfo();
  
  // Calculate metrics for the current language and scale
  const script = getScriptForLanguage(language);
  const baseFontSize = 16;
  const scaledFontSize = Math.round(baseFontSize * simulatedScale);
  const lineHeight = getLineHeight(scaledFontSize, script);
  
  // Calculate what the constrained scale would be for the simulated value
  // Apply the recommended max scale for body text
  const maxScale = TextScalingManager.RECOMMENDED_MAX_SCALE.body;
  const constrainedScale = Math.min(simulatedScale, maxScale);
  const constrainedFontSize = Math.round(baseFontSize * constrainedScale);
  const constrainedLineHeight = getLineHeight(constrainedFontSize, script);

  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.sectionTitle}>
        Text Scaling Settings
      </Text>
      
      {/* Device info section */}
      <View style={styles.infoContainer}>
        <Text variant="body2" style={styles.infoTitle}>Device Settings</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform:</Text>
          <Text style={styles.infoValue}>{Platform.OS}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device Scale Factor:</Text>
          <Text style={styles.infoValue}>{scalingInfo.deviceScale.toFixed(2)}x</Text>
        </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Is Large Scale:</Text>
        <Text style={styles.infoValue}>{scalingInfo.isLargeScale ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Normalized Scale:</Text>
        <Text style={styles.infoValue}>{scalingInfo.normalizedScale.toFixed(2)}x</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Pixel Ratio:</Text>
        <Text style={styles.infoValue}>{scalingInfo.pixelRatio.toFixed(2)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Max Scale (Body):</Text>
        <Text style={styles.infoValue}>
          {scalingInfo.recommendedMaxScales.body.toFixed(1)}x
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Max Allowed Scale:</Text>
        <Text style={styles.infoValue}>
          {scalingInfo.maxAllowedScale.toFixed(1)}x
        </Text>
      </View>
      </View>
      
      {/* Simulation section */}
      <View style={styles.simulationContainer}>
        <Text variant="body2" style={styles.infoTitle}>Scale Simulation</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0.5x</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={3.0}
            step={0.1}
            value={simulatedScale}
            onValueChange={setSimulatedScale}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#CCCCCC"
          />
          <Text style={styles.sliderLabel}>3.0x</Text>
        </View>
        <Text style={styles.scaleValue}>
          Simulated Scale: {simulatedScale.toFixed(1)}x
        </Text>
      </View>
      
      {/* Comparison section */}
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonColumn}>
          <Text style={styles.comparisonTitle}>Unconstrained</Text>
          <View style={styles.textContainer}>
            <Text style={{ fontSize: scaledFontSize }} maxFontSizeMultiplier={999}>
              {sampleText}
            </Text>
          </View>
          <View style={styles.metricsContainer}>
            <Text style={styles.metricsText}>
              Font: {scaledFontSize}px
            </Text>
            <Text style={styles.metricsText}>
              Line Height: {lineHeight}px
            </Text>
            <Text style={styles.metricsText}>
              Ratio: {(lineHeight / scaledFontSize).toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.comparisonColumn}>
          <Text style={styles.comparisonTitle}>Constrained</Text>
          <View style={styles.textContainer}>
            <Text style={{ fontSize: constrainedFontSize }} maxFontSizeMultiplier={maxScale}>
              {sampleText}
            </Text>
          </View>
          <View style={styles.metricsContainer}>
            <Text style={styles.metricsText}>
              Font: {constrainedFontSize}px
            </Text>
            <Text style={styles.metricsText}>
              Line Height: {constrainedLineHeight}px
            </Text>
            <Text style={styles.metricsText}>
              Ratio: {(constrainedLineHeight / constrainedFontSize).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Maximum scale behavior */}
      <View style={styles.maxedOutContainer}>
        <Text variant="h3" style={styles.sectionTitle}>
          Maximum Scale Behavior
        </Text>
        <Text style={styles.maxedOutDescription}>
          When device scale is above {scalingInfo.maxAllowedScale.toFixed(1)}x, 
          it will be capped at {scalingInfo.maxAllowedScale.toFixed(1)}x to prevent layout issues.
        </Text>
        
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonTitle}>Unlimited Scaling</Text>
            <View style={styles.textContainer}>
              <Text 
                style={{ fontSize: baseFontSize }} 
                maxFontSizeMultiplier={999}
                allowFontScaling={true}
              >
                {sampleText}
              </Text>
            </View>
            <Text style={styles.comparisonSubtitle}>
              maxFontSizeMultiplier={999}
            </Text>
          </View>
          
          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonTitle}>Capped Scaling</Text>
            <View style={styles.textContainer}>
              <Text 
                style={{ fontSize: baseFontSize }} 
                maxFontSizeMultiplier={scalingInfo.maxAllowedScale}
              >
                {sampleText}
              </Text>
            </View>
            <Text style={styles.comparisonSubtitle}>
              maxFontSizeMultiplier={scalingInfo.maxAllowedScale.toFixed(1)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.note, styles.maxedOutNote]}>
          {scalingInfo.deviceScale > scalingInfo.maxAllowedScale 
            ? `Your device scale (${scalingInfo.deviceScale.toFixed(1)}x) exceeds the maximum allowed (${scalingInfo.maxAllowedScale.toFixed(1)}x). Scaling is capped.`
            : "Increase your device text size to see this behavior in action."}
        </Text>
      </View>
      
      {/* Configuration section */}
      <View style={styles.configContainer}>
        <Text variant="h3" style={styles.sectionTitle}>
          Configure Max Scale
        </Text>
        <Text style={styles.configDescription}>
          Adjust the maximum allowed scale factor:
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>1.0x</Text>
          <Slider
            style={styles.slider}
            minimumValue={1.0}
            maximumValue={3.0}
            step={0.1}
            value={scalingInfo.maxAllowedScale}
            onValueChange={(value) => {
              TextScalingManager.setMaxAllowedScale(value);
              // Force re-render to update the UI
              setSimulatedScale(simulatedScale);
            }}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#CCCCCC"
          />
          <Text style={styles.sliderLabel}>3.0x</Text>
        </View>
        <Text style={styles.configValue}>
          Max Allowed Scale: {scalingInfo.maxAllowedScale.toFixed(1)}x
        </Text>
        <Text style={styles.configNote}>
          Changes will apply to all text in the app
        </Text>
      </View>
      
      <Text style={styles.note}>
        Note: Change your device text size in system settings to see how the app adapts.
        Text components use maxFontSizeMultiplier to limit scaling.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: 'bold',
  },
  simulationContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    width: 40,
    textAlign: 'center',
  },
  scaleValue: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  comparisonContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  comparisonColumn: {
    flex: 1,
    padding: 5,
  },
  comparisonTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  comparisonSubtitle: {
    fontSize: 10,
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
    minHeight: 120,
  },
  metricsContainer: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  metricsText: {
    fontSize: 10,
    color: '#666',
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },
  maxedOutContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f0f8ff', // Light blue background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cce0ff',
  },
  maxedOutDescription: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  maxedOutNote: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  configContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f5fff5', // Light green background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccffcc',
  },
  configDescription: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  configValue: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  configNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default TextScalingDemo;
