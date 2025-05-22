import { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { useFonts as useExpoFonts } from 'expo-font';

/**
 * Custom hook to load fonts and track loading state
 * @returns Object containing loading state and any error that occurred
 */
export const useFonts = () => {
  const [error, setError] = useState<Error | null>(null);
  
  // Using the built-in useFonts hook from expo-font
  const [fontsLoaded] = useExpoFonts({
    'PlusJakartaSans': require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'NotoSansDevanagari': require('../../assets/fonts/NotoSansDevanagari-Regular.ttf'),
    'NotoSansGujarati': require('../../assets/fonts/NotoSansGujarati-Regular.ttf'),
    'NotoSansGurmukhi': require('../../assets/fonts/NotoSansGurmukhi-Regular.ttf'),
  });

  return { isLoaded: fontsLoaded, error };
};

export default useFonts;
