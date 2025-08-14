import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, AppState, TouchableOpacity } from 'react-native';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { VideoProvider } from './src/contexts/VideoContext';
import { FeedScreen } from './src/screens/FeedScreen';
import DemoScreen from './src/screens/DemoScreen';
import VideoScreen from './src/screens/VideoScreen';
import EmbedVideoScreen from './src/screens/EmbedVideoScreen';
import SocialMediaScreen from './src/screens/SocialMediaScreen';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import TextScalingManager from './src/utils/TextScalingManager';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

type Screen = 'feed' | 'demo' | 'video' | 'embed' | 'social';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');

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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'demo':
        return <DemoScreen />;
      case 'video':
        return <VideoScreen onBack={() => setCurrentScreen('feed')} />;
      case 'embed':
        return <EmbedVideoScreen onBack={() => setCurrentScreen('feed')} />;
      case 'social':
        return <SocialMediaScreen onBack={() => setCurrentScreen('feed')} />;
      default:
        return <FeedScreen />;
    }
  };

  const renderNavigation = () => {
    if (currentScreen === 'video' || currentScreen === 'embed' || currentScreen === 'social') {
      return null; // Video and social screens have their own back buttons
    }

    return (
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'feed' && styles.activeNavButton]}
          onPress={() => setCurrentScreen('feed')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'feed' && styles.activeNavButtonText]}>
            Feed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'demo' && styles.activeNavButton]}
          onPress={() => setCurrentScreen('demo')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'demo' && styles.activeNavButtonText]}>
            Demo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentScreen('video')}
        >
          <Text style={styles.navButtonText}>
            Videos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentScreen('embed')}
        >
          <Text style={styles.navButtonText}>
            Embed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentScreen('social')}
        >
          <Text style={styles.navButtonText}>
            Social
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LanguageProvider>
      <VideoProvider>
        <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          {renderNavigation()}
          {renderScreen()}
        </SafeAreaView>
      </VideoProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeNavButton: {
    backgroundColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#657786',
  },
  activeNavButtonText: {
    color: '#fff',
  },
});
