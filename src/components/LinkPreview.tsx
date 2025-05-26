import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { EmbedMetadata } from '../services/embedApi';

interface LinkPreviewProps {
  metadata: EmbedMetadata | null;
  loading?: boolean;
  error?: string;
  onPress?: () => void;
  onRemove?: () => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  metadata,
  loading = false,
  error,
  onPress,
  onRemove,
  style,
}) => {
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading preview...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!metadata) {
    return null;
  }

  const isVideo = metadata.type === 'video';
  const isYouTube = metadata.platform === 'youtube';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Remove button */}
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Platform indicator */}
      <View style={styles.platformIndicator}>
        <Text style={styles.platformText}>
          {isVideo ? '🎥' : '🔗'} {metadata.provider?.name || metadata.platform}
        </Text>
      </View>

      {/* Image/Thumbnail */}
      {metadata.image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: metadata.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {isVideo && (
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶️</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {metadata.title}
        </Text>

        {/* Description */}
        {metadata.description && (
          <Text style={styles.description} numberOfLines={3}>
            {metadata.description}
          </Text>
        )}

        {/* Author */}
        {metadata.author?.name && (
          <Text style={styles.author}>
            By {metadata.author.name}
          </Text>
        )}

        {/* URL */}
        <Text style={styles.url} numberOfLines={1}>
          {metadata.url}
        </Text>

        {/* Video duration or dimensions */}
        {isVideo && metadata.width && metadata.height && (
          <Text style={styles.dimensions}>
            {metadata.width} × {metadata.height}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#657786',
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  platformIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 5,
  },
  platformText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 24,
    marginLeft: 4, // Slight offset for visual centering
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 20,
    marginBottom: 8,
  },
  author: {
    fontSize: 13,
    color: '#1da1f2',
    marginBottom: 4,
    fontWeight: '500',
  },
  url: {
    fontSize: 12,
    color: '#657786',
    marginBottom: 4,
  },
  dimensions: {
    fontSize: 12,
    color: '#657786',
    fontStyle: 'italic',
  },
});
