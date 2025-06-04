import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Post } from '../services/postStorage';
import { LinkPreview } from './LinkPreview';
import { EmbedWebView } from './EmbedWebView';
import { embedApiService } from '../services/embedApi';
import { useVideo } from '../contexts/VideoContext';

interface PostItemProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  style?: any;
  isVisible?: boolean;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  onDelete,
  onEdit,
  style,
  isVisible = true,
}) => {
  const [showFullEmbed, setShowFullEmbed] = useState(false);
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  const [loadingEmbed, setLoadingEmbed] = useState(false);
  
  const { autoPlayEnabled, setVideoVisibility } = useVideo();

  const isYouTubeVideo = post.embedMetadata?.platform === 'youtube' && post.embedMetadata?.type === 'video';
  const videoId = post.embedMetadata?.embedData?.videoId;
  
  // Create unique instance ID for this post's embed
  const uniqueInstanceId = `post-${post.id}`;

  // Handle visibility changes for auto-pause functionality
  useEffect(() => {
    if (isYouTubeVideo && videoId) {
      // Use the unique player ID that combines video ID and instance ID
      const uniquePlayerId = `${videoId}-post-${post.id}`;
      setVideoVisibility(uniquePlayerId, isVisible);
    }
  }, [isVisible, isYouTubeVideo, videoId, post.id, setVideoVisibility]);

  // Auto-load YouTube videos if auto-play is enabled
  useEffect(() => {
    if (isYouTubeVideo && autoPlayEnabled && isVisible && !showFullEmbed && !embedHtml) {
      handlePreviewPress();
    }
  }, [isYouTubeVideo, autoPlayEnabled, isVisible, showFullEmbed, embedHtml]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handlePreviewPress = async () => {
    if (!post.embedMetadata || !post.url) return;

    if (post.embedMetadata.type === 'link') {
      // For regular links, just open in browser
      Linking.openURL(post.url);
      return;
    }

    // For videos and rich content, load the full embed
    if (!showFullEmbed) {
      try {
        setLoadingEmbed(true);
        const html = await embedApiService.renderEmbed(post.url, {
          width: 350,
          height: 200,
          autoplay: isYouTubeVideo && autoPlayEnabled,
          controls: true,
        });
        setEmbedHtml(html);
        setShowFullEmbed(true);
      } catch (error) {
        console.error('Error loading embed:', error);
        Alert.alert('Error', 'Failed to load embed content');
      } finally {
        setLoadingEmbed(false);
      }
    } else {
      setShowFullEmbed(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(post.id),
        },
      ]
    );
  };

  const handleLongPress = () => {
    Alert.alert(
      'Post Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => onEdit?.(post) },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const renderVideoPreview = () => {
    if (!isYouTubeVideo) {
      return (
        <LinkPreview
          metadata={post.embedMetadata!}
          onPress={handlePreviewPress}
          style={styles.preview}
        />
      );
    }

    // For YouTube videos, show enhanced preview with play button
    return (
      <TouchableOpacity
        style={styles.youtubePreview}
        onPress={handlePreviewPress}
        activeOpacity={0.8}
      >
        <View style={styles.youtubeThumbnailContainer}>
          {post.embedMetadata?.image && (
            <View style={styles.youtubeThumbnail}>
              <Text style={styles.thumbnailPlaceholder}>🎥</Text>
            </View>
          )}
          <View style={styles.youtubePlayButton}>
            <Text style={styles.playButtonText}>▶</Text>
          </View>
        </View>
        <View style={styles.youtubeInfo}>
          <Text style={styles.youtubeTitle} numberOfLines={2}>
            {post.embedMetadata?.title || 'YouTube Video'}
          </Text>
          <Text style={styles.youtubeAuthor} numberOfLines={1}>
            {post.embedMetadata?.author?.name || 'YouTube'} • {autoPlayEnabled ? 'Auto-play enabled' : 'Tap to play'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onLongPress={handleLongPress}
      activeOpacity={0.95}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>You</Text>
            <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.content}>
        <Text style={styles.text}>{post.text}</Text>
        
        {/* URL Display (if different from embedded URL) */}
        {post.url && !post.embedMetadata && (
          <TouchableOpacity
            style={styles.urlContainer}
            onPress={() => Linking.openURL(post.url!)}
          >
            <Text style={styles.urlText} numberOfLines={1}>
              🔗 {post.url}
            </Text>
          </TouchableOpacity>
        )}

        {/* Embed Preview */}
        {post.embedMetadata && !showFullEmbed && renderVideoPreview()}

        {/* Full Embed */}
        {showFullEmbed && embedHtml && post.embedMetadata && (
          <View style={styles.embedContainer}>
            <View style={styles.embedHeader}>
              <Text style={styles.embedTitle}>
                {post.embedMetadata.type === 'video' ? '🎥' : '🔗'} {post.embedMetadata.title}
              </Text>
              <TouchableOpacity
                onPress={() => setShowFullEmbed(false)}
                style={styles.collapseButton}
              >
                <Text style={styles.collapseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <EmbedWebView
              metadata={post.embedMetadata}
              htmlContent={embedHtml}
              autoplay={isYouTubeVideo && autoPlayEnabled}
              instanceId={uniqueInstanceId}
              style={styles.webView}
              onError={(error) => {
                console.error('WebView error:', error);
                setShowFullEmbed(false);
                Alert.alert('Error', 'Failed to display embed content');
              }}
            />
          </View>
        )}

        {/* Loading Embed */}
        {loadingEmbed && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {isYouTubeVideo ? 'Loading YouTube player...' : 'Loading embed...'}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {post.updatedAt !== post.createdAt && 'Edited • '}
          {post.embedMetadata?.platform && `${post.embedMetadata.platform} • `}
          {isYouTubeVideo && isVisible && 'Video visible • '}
          Tap and hold for options
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
  },
  timestamp: {
    fontSize: 12,
    color: '#657786',
    marginTop: 2,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f7f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#657786',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#14171a',
    marginBottom: 8,
  },
  urlContainer: {
    backgroundColor: '#f7f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  urlText: {
    fontSize: 14,
    color: '#1da1f2',
  },
  preview: {
    marginBottom: 8,
  },
  youtubePreview: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  youtubeThumbnailContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  thumbnailPlaceholder: {
    fontSize: 48,
    color: '#666',
  },
  youtubePlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  playButtonText: {
    fontSize: 20,
    color: '#ff0000',
    marginLeft: 3,
  },
  youtubeInfo: {
    padding: 12,
    backgroundColor: '#fff',
  },
  youtubeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 4,
  },
  youtubeAuthor: {
    fontSize: 14,
    color: '#657786',
  },
  embedContainer: {
    marginBottom: 8,
  },
  embedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f7f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  embedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14171a',
    flex: 1,
  },
  collapseButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseButtonText: {
    color: '#657786',
    fontSize: 10,
    fontWeight: 'bold',
  },
  webView: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f7f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  loadingText: {
    color: '#657786',
    fontSize: 14,
  },
  footer: {
    paddingTop: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#aab8c2',
    fontStyle: 'italic',
  },
});
