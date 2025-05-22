import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, AppState } from 'react-native';
import { LanguageProvider } from './src/contexts/LanguageContext';
import DemoScreen from './src/screens/DemoScreen';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import TextScalingManager from './src/utils/TextScalingManager';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          'PlusJakartaSans': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
          'NotoSansDevanagari': require('./assets/fonts/NotoSansDevanagari-Regular.ttf'),
          'NotoSansGujarati': require('./assets/fonts/NotoSansGujarati-Regular.ttf'),
          'NotoSansGurmukhi': require('./assets/fonts/NotoSansGurmukhi-Regular.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Listen for app state changes to reset the text scaling cache
  // This ensures we detect changes to the device's text scaling settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App has come to the foreground
        TextScalingManager.resetCache();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <LanguageProvider>
      <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <DemoScreen />
      </SafeAreaView>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
