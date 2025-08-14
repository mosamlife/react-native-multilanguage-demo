import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width: screenWidth } = Dimensions.get('window');

interface Video {
  id: string;
  title: string;
  url: string;
}

const VIDEOS: Video[] = [
  {
    id: 'video1',
    title: 'Demo Video 1',
    url: 'https://list.sociocircle.org/src/player.html?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DxcKGqUikPQc&width=560&height=315&autoplay=true'
  },
  {
    id: 'video2',
    title: 'Demo Video 2',
    url: 'https://list.sociocircle.org/src/player.html?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ&width=560&height=315&autoplay=false'
  },
  {
    id: 'video3',
    title: 'Demo Video 3',
    url: 'https://list.sociocircle.org/src/player.html?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D9bZkp7q19f0&width=560&height=315&autoplay=false'
  }
];

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    const errorMessage = nativeEvent.description || 'Failed to load video';
    setError(errorMessage);
    setLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
  };

  return (
    <View style={styles.videoCard}>
      <Text style={styles.videoTitle}>{video.title}</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ Failed to load video</Text>
          <Text style={styles.errorDetails}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webViewContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          )}
          
          <WebView
            source={{ uri: video.url }}
            style={styles.webView}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
            mixedContentMode="compatibility"
            allowsFullscreenVideo={true}
            allowsBackForwardNavigationGestures={false}
          />
        </View>
      )}
    </View>
  );
};

interface VideoScreenProps {
  onBack?: () => void;
}

const VideoScreen: React.FC<VideoScreenProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video Player Demo</Text>
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
          Demo videos loaded from sociocircle.org using react-native-webview
        </Text>
        
        {VIDEOS.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Videos are loaded directly from sociocircle.org
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
    marginBottom: 12,
  },
  webViewContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    color: '#fff',
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

export default VideoScreen;
