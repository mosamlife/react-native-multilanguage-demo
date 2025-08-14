import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { EmbedWebView } from '../components/EmbedWebView';
import { embedApiService, EmbedMetadata } from '../services/embedApi';

interface Video {
  id: string;
  title: string;
  url: string;
}

const VIDEOS: Video[] = [
  {
    id: 'video1',
    title: 'Demo Video 1 (EmbedWebView)',
    url: 'https://list.sociocircle.org/src/player.html?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DxcKGqUikPQc&width=560&height=315&autoplay=true'
  },
  {
    id: 'video2',
    title: 'Demo Video 2 (EmbedWebView)',
    url: 'https://list.sociocircle.org/src/player.html?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ&width=560&height=315&autoplay=false'
  },
  {
    id: 'video3',
    title: 'Demo Video 3 (EmbedWebView)',
    url: 'https://list.sociocircle.org/src/player.html?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D9bZkp7q19f0&width=560&height=315&autoplay=false'
  }
];

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [metadata, setMetadata] = useState<EmbedMetadata | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideoData();
  }, [video.url]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create mock metadata for sociocircle URLs since the embed API might not support them
      const mockMetadata: EmbedMetadata = {
        title: video.title,
        description: 'Video loaded from sociocircle.org',
        type: 'video',
        platform: 'sociocircle',
        url: video.url,
        width: 560,
        height: 315,
        provider: {
          name: 'Sociocircle',
          url: 'https://sociocircle.org'
        }
      };

      // Create simple HTML content that embeds the sociocircle URL in an iframe
      const htmlContent = `
        <div style="width: 100%; height: 100%; margin: 0; padding: 0;">
          <iframe 
            src="${video.url}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style="border-radius: 8px;"
          ></iframe>
        </div>
      `;

      setMetadata(mockMetadata);
      setHtmlContent(htmlContent);
      setLoading(false);
    } catch (err) {
      console.error('Error loading video data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadVideoData();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    Alert.alert(
      'Video Error',
      `Failed to load ${video.title}: ${errorMessage}`,
      [
        { text: 'Retry', onPress: handleRetry },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const handleLoad = () => {
    console.log(`Video loaded: ${video.title}`);
  };

  if (loading) {
    return (
      <View style={styles.videoCard}>
        <Text style={styles.videoTitle}>{video.title}</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video data...</Text>
        </View>
      </View>
    );
  }

  if (error || !metadata || !htmlContent) {
    return (
      <View style={styles.videoCard}>
        <Text style={styles.videoTitle}>{video.title}</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ Failed to load video</Text>
          <Text style={styles.errorDetails}>{error || 'Unknown error'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.videoCard}>
      <Text style={styles.videoTitle}>{video.title}</Text>
      <Text style={styles.videoDescription}>
        Using EmbedWebView component • Platform: {metadata.platform}
      </Text>
      
      <EmbedWebView
        metadata={metadata}
        htmlContent={htmlContent}
        style={styles.embedWebView}
        autoplay={video.url.includes('autoplay=true')}
        onError={handleError}
        onLoad={handleLoad}
        instanceId={video.id}
      />
    </View>
  );
};

interface EmbedVideoScreenProps {
  onBack?: () => void;
}

const EmbedVideoScreen: React.FC<EmbedVideoScreenProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EmbedWebView Demo</Text>
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
        <Text style={styles.description}>
          Same videos loaded using the existing EmbedWebView component
        </Text>
        
        {VIDEOS.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Videos loaded through EmbedWebView component with sociocircle.org URLs
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
  description: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 12,
  },
  embedWebView: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  loadingText: {
    color: '#657786',
    fontSize: 14,
  },
  errorContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 20,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
  },
});

export default EmbedVideoScreen;
