import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { EmbedMetadata } from '../services/embedApi';
import { useVideoPlayer } from '../contexts/VideoContext';

interface EmbedWebViewProps {
  metadata: EmbedMetadata;
  htmlContent: string;
  style?: any;
  autoplay?: boolean;
  onError?: (error: string) => void;
  onLoad?: () => void;
  // Add unique instance ID to differentiate between multiple instances of same video
  instanceId?: string;
}

const { width: screenWidth } = Dimensions.get('window');

// Generate unique instance ID if not provided
let instanceCounter = 0;

export const EmbedWebView: React.FC<EmbedWebViewProps> = ({
  metadata,
  htmlContent,
  style,
  autoplay = false,
  onError,
  onLoad,
  instanceId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewHeight, setWebViewHeight] = useState(200);
  const webViewRef = useRef<WebView>(null);

  const isVideo = metadata.type === 'video';
  const isYouTube = metadata.platform === 'youtube';
  const videoId = metadata.embedData?.videoId || '';
  
  // Create unique instance ID for this embed
  const uniqueInstanceId = useMemo(() => {
    if (instanceId) return instanceId;
    instanceCounter++;
    return `instance-${instanceCounter}`;
  }, [instanceId]);
  
  // Create unique player ID combining video ID and instance ID
  const uniquePlayerId = useMemo(() => {
    if (!videoId) return 'dummy';
    return `${videoId}-${uniqueInstanceId}`;
  }, [videoId, uniqueInstanceId]);

  // Always call the hook - this fixes the "rendered fewer hooks" error
  const videoPlayerHook = useVideoPlayer(
    isYouTube && videoId ? uniquePlayerId : 'dummy', 
    isYouTube && videoId ? uniquePlayerId : 'dummy'
  );

  // Only use the hook results if this is actually a YouTube video
  const handlePlayerMessage = isYouTube && videoId ? videoPlayerHook.handlePlayerMessage : null;
  const setVideoRef = isYouTube && videoId ? videoPlayerHook.setVideoRef : null;

  const defaultHeight = isVideo ? 200 : 150;

  // Calculate aspect ratio for videos
  const aspectRatio = metadata.width && metadata.height 
    ? metadata.width / metadata.height 
    : 16 / 9;

  const calculatedHeight = Math.min(
    screenWidth / aspectRatio,
    400 // Max height
  );

  const finalHeight = isVideo ? calculatedHeight : webViewHeight;

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoad?.();
    
    // Set video ref after WebView loads for YouTube videos
    if (isYouTube && setVideoRef && webViewRef.current) {
      setVideoRef(webViewRef.current);
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    const errorMessage = nativeEvent.description || 'Failed to load content';
    setError(errorMessage);
    setLoading(false);
    onError?.(errorMessage);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Handle YouTube player messages
      if (isYouTube && handlePlayerMessage) {
        if (data.type?.startsWith('youtube_player')) {
          handlePlayerMessage(data);
          return;
        }
      }
      
      // Handle height updates from the WebView
      if (data.type === 'height' && data.height) {
        setWebViewHeight(Math.min(data.height, 400));
      }
      
      // Handle video events
      if (data.type === 'video') {
        console.log('Video event:', data.event);
      }

      // Handle navigation requests
      if (data.type === 'navigation' && data.url) {
        console.log('Navigation requested:', data.url);
        // Could open in browser or handle differently
      }
    } catch (e) {
      // Ignore parsing errors
    }
  };

  const injectedJavaScript = `
    (function() {
      // Function to send height to React Native
      function sendHeight() {
        const height = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'height',
            height: height
          }));
        }
      }

      // Send initial height
      setTimeout(sendHeight, 100);
      
      // Listen for resize events
      window.addEventListener('resize', sendHeight);
      
      // Listen for video events if it's a video embed
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.addEventListener('loadedmetadata', sendHeight);
        video.addEventListener('play', () => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'video',
              event: 'play'
            }));
          }
        });
        video.addEventListener('pause', () => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'video',
              event: 'pause'
            }));
          }
        });
      });

      // Prevent external navigation
      document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (target && target.href && !target.href.startsWith('javascript:')) {
          e.preventDefault();
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'navigation',
              url: target.href
            }));
          }
        }
      });

      // For YouTube videos, ensure proper communication
      ${isYouTube ? `
        // Override console.log to capture YouTube API logs
        const originalLog = console.log;
        console.log = function(...args) {
          originalLog.apply(console, args);
          if (args[0] && typeof args[0] === 'string' && args[0].includes('YouTube')) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'youtube_log',
                message: args.join(' ')
              }));
            }
          }
        };
      ` : ''}

      true; // Required for injected JavaScript
    })();
  `;

  // Memoize webView source to prevent unnecessary re-renders
  const webViewSource = useMemo(() => {
    if (isYouTube) {
      return {
        html: htmlContent,
        baseUrl: 'https://localhost',
      };
    }
    
    return {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.4;
              color: #333;
              background: transparent;
            }
            
            img, video, iframe {
              max-width: 100%;
              height: auto;
            }
            
            iframe {
              border: none;
              border-radius: 8px;
            }
            
            .embed-container {
              width: 100%;
              overflow: hidden;
            }
            
            .video-container {
              position: relative;
              width: 100%;
              height: 0;
              padding-bottom: ${(1 / aspectRatio) * 100}%;
            }
            
            .video-container iframe,
            .video-container video {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 8px;
            }
            
            a {
              color: #1da1f2;
              text-decoration: none;
            }
            
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="embed-container">
            ${htmlContent}
          </div>
        </body>
        </html>
      `,
      baseUrl: 'https://localhost',
    };
  }, [isYouTube, htmlContent, aspectRatio]);

  if (error) {
    return (
      <View style={[styles.container, { height: defaultHeight }, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ Failed to load embed</Text>
          <Text style={styles.errorDetails}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: finalHeight }, style]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>
            {isYouTube ? 'Loading YouTube player...' : 'Loading embed...'}
          </Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={webViewSource}
        style={styles.webView}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={!autoplay && !isYouTube}
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  webView: {
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    color: '#657786',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff5f5',
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
});
