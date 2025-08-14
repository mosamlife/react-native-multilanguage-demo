import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import SocialMediaEmbed, { SocialPlatform } from '../components/SocialMediaEmbed';

const { width: screenWidth } = Dimensions.get('window');

interface SocialMediaDemo {
  id: string;
  platform: SocialPlatform;
  url: string;
  title: string;
  description: string;
}

const SOCIAL_MEDIA_DEMOS: SocialMediaDemo[] = [
  {
    id: 'youtube1',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE',
    description: 'PSY - GANGNAM STYLE (강남스타일) M/V - Most viewed video'
  },
  {
    id: 'youtube2',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito',
    description: 'Luis Fonsi - Despacito ft. Daddy Yankee'
  },
  {
    id: 'youtube3',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
    title: 'Smash Mouth - All Star',
    description: 'Smash Mouth - All Star (Official Music Video)'
  },
  {
    id: 'youtube4',
    platform: 'youtube',
    url: 'https://youtu.be/9bZkp7q19f0',
    title: 'Gangnam Style (youtu.be format)',
    description: 'Same video using youtu.be short URL format'
  },
  {
    id: 'youtube5',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
    title: 'HEYYEYAAEYAAAEYAEYAA',
    description: 'He-Man version - Popular meme video'
  },
  {
    id: 'youtube_shorts1',
    platform: 'youtube-shorts',
    url: 'https://youtube.com/shorts/9bZkp7q19f0',
    title: 'YouTube Shorts Demo 1',
    description: 'Gangnam Style as YouTube Shorts format'
  },
  {
    id: 'youtube_shorts2',
    platform: 'youtube-shorts',
    url: 'https://youtube.com/shorts/kJQP7kiw5Fk',
    title: 'YouTube Shorts Demo 2',
    description: 'Despacito as YouTube Shorts format'
  },
  {
    id: 'youtube_shorts3',
    platform: 'youtube-shorts',
    url: 'https://youtube.com/shorts/BBT-RSb5nss',
    title: 'YouTube Shorts Demo 3',
    description: 'Custom YouTube Short requested by user'
  },
  {
    id: 'instagram1',
    platform: 'instagram',
    url: 'https://www.instagram.com/p/CUbHfhpswxt/',
    title: 'Instagram Post Demo',
    description: 'Instagram post with captions enabled'
  },
  {
    id: 'tiktok1',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@epicgardening/video/7055411162212633903',
    title: 'TikTok Video Demo',
    description: 'Gardening tips TikTok video'
  },
  {
    id: 'twitter1',
    platform: 'twitter',
    url: 'https://twitter.com/reactjs/status/1566470204556517376',
    title: 'X (Twitter) Post Demo',
    description: 'React.js official Twitter post'
  }
];

interface SocialMediaCardProps {
  demo: SocialMediaDemo;
  onEmbedLoad: (platform: string) => Promise<void>;
  onEmbedError: (error: string) => Promise<void>;
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({ demo, onEmbedLoad, onEmbedError }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate appropriate dimensions based on platform
  const getEmbedDimensions = () => {
    const maxWidth = Math.min(screenWidth - 60, 400);
    
    switch (demo.platform) {
      case 'youtube':
        // Standard YouTube aspect ratio 16:9
        return {
          width: maxWidth,
          height: Math.round(maxWidth * 9 / 16), // 16:9 aspect ratio
        };
      case 'youtube-shorts':
        // YouTube Shorts are vertical (9:16 aspect ratio)
        return {
          width: Math.min(maxWidth, 315),
          height: 500, // Fixed height for Shorts
        };
      case 'instagram':
        return {
          width: Math.min(maxWidth, 328),
          height: undefined, // Let Instagram determine height
        };
      case 'tiktok':
        return {
          width: Math.min(maxWidth, 325),
          height: undefined, // Let TikTok determine height
        };
      default:
        return {
          width: maxWidth,
          height: undefined,
        };
    }
  };

  const { width: embedWidth, height: embedHeight } = getEmbedDimensions();

  return (
    <View style={styles.demoCard}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.demoTitle}>{demo.title}</Text>
          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>{demo.platform.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.demoDescription}>{demo.description}</Text>
        <Text style={styles.expandText}>
          {isExpanded ? '▼ Tap to collapse' : '▶ Tap to expand'}
        </Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={[
          styles.embedContainer,
          embedHeight ? { minHeight: embedHeight + 50 } : null // Add padding for platform indicator
        ]}>
          <SocialMediaEmbed
            platform={demo.platform}
            url={demo.url}
            width={embedWidth}
            height={embedHeight}
            onEmbedLoad={onEmbedLoad}
            onEmbedError={onEmbedError}
            dom={{
              style: { borderRadius: 8 },
              scrollEnabled: false,
              matchContents: demo.platform !== 'youtube' && demo.platform !== 'youtube-shorts', // Let YouTube use fixed dimensions
            }}
          />
        </View>
      )}
    </View>
  );
};

interface SocialMediaScreenProps {
  onBack?: () => void;
}

const SocialMediaScreen: React.FC<SocialMediaScreenProps> = ({ onBack }) => {
  const [loadedEmbeds, setLoadedEmbeds] = useState<string[]>([]);
  const [errorEmbeds, setErrorEmbeds] = useState<string[]>([]);

  const handleEmbedLoad = async (platform: string) => {
    console.log(`✅ ${platform} embed loaded successfully`);
    setLoadedEmbeds(prev => [...prev.filter(p => p !== platform), platform]);
  };

  const handleEmbedError = async (error: string) => {
    console.error(`❌ Embed error: ${error}`);
    const platform = error.split(' ')[3]; // Extract platform from error message
    if (platform) {
      setErrorEmbeds(prev => [...prev.filter(p => p !== platform), platform]);
    }
    
    Alert.alert(
      'Embed Error',
      error,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getStatusIcon = (platform: SocialPlatform) => {
    if (loadedEmbeds.includes(platform)) return '✅';
    if (errorEmbeds.includes(platform)) return '❌';
    return '⏳';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Media Embeds</Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🌐 DOM Components Demo</Text>
          <Text style={styles.infoDescription}>
            These social media embeds are powered by Expo's DOM components feature, 
            using the 'use dom' directive with react-social-media-embed library.
          </Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Embed Status:</Text>
            {SOCIAL_MEDIA_DEMOS.map(demo => (
              <Text key={demo.id} style={styles.statusItem}>
                {getStatusIcon(demo.platform)} {demo.platform}: {demo.title}
              </Text>
            ))}
          </View>
        </View>
        
        {SOCIAL_MEDIA_DEMOS.map((demo) => (
          <SocialMediaCard
            key={demo.id}
            demo={demo}
            onEmbedLoad={handleEmbedLoad}
            onEmbedError={handleEmbedError}
          />
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>🚀 Technology Stack</Text>
          <Text style={styles.footerText}>
            • Expo DOM Components ('use dom' directive){'\n'}
            • react-social-media-embed library{'\n'}
            • Native React Native UI{'\n'}
            • WebView bridge for communication
          </Text>
          
          <Text style={styles.footerNote}>
            DOM components run in a separate JavaScript context and communicate 
            with the native side through an asynchronous bridge.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 20,
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  statusItem: {
    fontSize: 12,
    color: '#657786',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  demoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  platformBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  platformText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  demoDescription: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 8,
  },
  expandText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  embedContainer: {
    backgroundColor: '#f8f9fa',
    minHeight: 250,
    paddingBottom: 10,
  },
  footer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 20,
    marginBottom: 12,
  },
  footerNote: {
    fontSize: 12,
    color: '#a0a0a0',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default SocialMediaScreen;
