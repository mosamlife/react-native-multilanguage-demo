import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLanguage, LANGUAGES, SupportedLanguage } from '../contexts/LanguageContext';
import Text from './Text';

interface LanguageSelectorProps {
  style?: any;
  mode?: 'dropdown' | 'buttons';
}

/**
 * Language selector component that allows users to switch between supported languages.
 * Provides two modes: dropdown (default) and buttons.
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style, mode = 'dropdown' }) => {
  const { language, setLanguage } = useLanguage();

  // Render as buttons
  if (mode === 'buttons') {
    return (
      <View style={[styles.buttonContainer, style]}>
        {Object.entries(LANGUAGES).map(([code, config]) => (
          <TouchableOpacity
            key={code}
            style={[
              styles.button,
              language === code ? styles.activeButton : null,
            ]}
            onPress={() => setLanguage(code as SupportedLanguage)}
          >
            <Text
              style={[
                styles.buttonText,
                language === code ? styles.activeButtonText : null,
              ]}
            >
              {config.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Render as dropdown (default)
  return (
    <View style={[styles.pickerContainer, style]}>
      <Picker
        selectedValue={language}
        style={styles.picker}
        onValueChange={(value) => setLanguage(value as SupportedLanguage)}
      >
        {Object.entries(LANGUAGES).map(([code, config]) => (
          <Picker.Item key={code} label={config.name} value={code} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: '100%',
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#333',
  },
  activeButtonText: {
    color: '#fff',
  },
});

export default LanguageSelector;
