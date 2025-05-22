import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as Localization from 'expo-localization';
import { MMKV } from 'react-native-mmkv';

// Storage for persisting language preference
const storage = new MMKV();
const STORAGE_KEY = 'appLanguage';

// Define the supported languages and their configurations
export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'pa';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  fontFamily: string;
  script: 'latin' | 'devanagari' | 'gujarati' | 'gurmukhi';
}

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: { code: 'en', name: 'English', fontFamily: 'PlusJakartaSans', script: 'latin' },
  hi: { code: 'hi', name: 'हिन्दी', fontFamily: 'NotoSansDevanagari', script: 'devanagari' },
  gu: { code: 'gu', name: 'ગુજરાતી', fontFamily: 'NotoSansGujarati', script: 'gujarati' },
  pa: { code: 'pa', name: 'ਪੰਜਾਬੀ', fontFamily: 'NotoSansGurmukhi', script: 'gurmukhi' },
};

// Sample texts for each language
export const SAMPLE_TEXTS: Record<SupportedLanguage, string> = {
  en: 'Hello World! Welcome to the multilingual demo app.',
  hi: 'नमस्ते दुनिया! बहुभाषी डेमो ऐप में आपका स्वागत है।',
  gu: 'હેલ્લો વર્લ્ડ! બહુભાષી ડેમો એપ્લિકેશનમાં આપનું સ્વાગત છે.',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨਿਆ! ਬਹੁਭਾਸ਼ੀ ਡੈਮੋ ਐਪ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।',
};

// Sample texts with emojis
export const EMOJI_SAMPLE_TEXTS: Record<SupportedLanguage, string> = {
  en: 'Hello! 😊 I love traveling ✈️ and eating delicious food 🍕🍔🍦',
  hi: 'नमस्ते! 😊 मुझे यात्रा करना ✈️ और स्वादिष्ट भोजन खाना पसंद है 🍕🍔🍦',
  gu: 'નમસ્તે! 😊 મને મુસાફરી કરવી ✈️ અને સ્વાદિષ્ટ ભોજન ખાવાનું પસંદ છે 🍕🍔🍦',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! 😊 ਮੈਨੂੰ ਯਾਤਰਾ ਕਰਨਾ ✈️ ਅਤੇ ਸੁਆਦੀ ਭੋਜਨ ਖਾਣਾ ਪਸੰਦ ਹੈ 🍕🍔🍦',
};

// Define the context type
interface LanguageContextType {
  language: SupportedLanguage;
  languageConfig: LanguageConfig;
  setLanguage: (lang: SupportedLanguage) => void;
  isRTL: boolean;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  languageConfig: LANGUAGES.en,
  setLanguage: () => {},
  isRTL: false,
});

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    // Load saved language or use system language
    const loadLanguage = async () => {
      const savedLanguage = storage.getString(STORAGE_KEY) as SupportedLanguage | undefined;
      
      if (savedLanguage && LANGUAGES[savedLanguage]) {
        setLanguageState(savedLanguage);
      } else {
        // Try to use system language, fallback to English
        const systemLanguage = Localization.locale.split('-')[0] as SupportedLanguage;
        setLanguageState(LANGUAGES[systemLanguage] ? systemLanguage : 'en');
      }
    };

    loadLanguage();
  }, []);

  // Save language preference when it changes
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    storage.set(STORAGE_KEY, lang);
  };

  // Get the current language configuration
  const languageConfig = LANGUAGES[language] || LANGUAGES.en;
  
  // Check if the language is RTL (for future support)
  const isRTL = false; // None of our current languages are RTL, but we can add this for future

  return (
    <LanguageContext.Provider value={{ language, languageConfig, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext);
