import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';

interface VideoState {
  videoId: string;
  playerId: string;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  isVisible: boolean;
  wasManuallyPaused: boolean; // Track if user manually paused
  shouldAutoPlay: boolean; // Track if video should auto-play when visible
}

interface VideoContextType {
  // Current video state
  currentVideo: VideoState | null;
  
  // Video management
  registerVideo: (videoId: string, playerId: string) => void;
  unregisterVideo: (videoId: string) => void;
  
  // Playback control
  playVideo: (videoId: string) => void;
  pauseVideo: (videoId: string, isManual?: boolean) => void;
  stopVideo: (videoId: string) => void;
  
  // State updates
  updateVideoState: (videoId: string, state: Partial<VideoState>) => void;
  setVideoVisibility: (videoId: string, isVisible: boolean) => void;
  
  // Settings
  autoPlayEnabled: boolean;
  setAutoPlayEnabled: (enabled: boolean) => void;
  autoPauseOnScroll: boolean;
  setAutoPauseOnScroll: (enabled: boolean) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

interface VideoProviderProps {
  children: React.ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [videos, setVideos] = useState<Map<string, VideoState>>(new Map());
  const [currentVideo, setCurrentVideo] = useState<VideoState | null>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [autoPauseOnScroll, setAutoPauseOnScroll] = useState(true);
  
  const videoRefs = useRef<Map<string, any>>(new Map());
  const appStateRef = useRef(AppState.currentState);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App came to foreground');
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background - pause all videos
        console.log('App went to background - pausing all videos');
        pauseAllVideos();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const registerVideo = useCallback((videoId: string, playerId: string) => {
    setVideos(prev => {
      // Check if video is already registered to prevent duplicate registrations
      if (prev.has(videoId)) {
        return prev;
      }
      
      const videoState: VideoState = {
        videoId,
        playerId,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        duration: 0,
        isVisible: false,
        wasManuallyPaused: false,
        shouldAutoPlay: autoPlayEnabled,
      };

      const newMap = new Map(prev);
      newMap.set(videoId, videoState);
      console.log(`Registered video: ${videoId}`);
      return newMap;
    });
  }, [autoPlayEnabled]);

  const unregisterVideo = useCallback((videoId: string) => {
    setVideos(prev => {
      if (!prev.has(videoId)) {
        return prev;
      }
      
      const newMap = new Map(prev);
      newMap.delete(videoId);
      console.log(`Unregistered video: ${videoId}`);
      return newMap;
    });
    
    videoRefs.current.delete(videoId);
    
    // Clear current video if it's the one being unregistered
    setCurrentVideo(current => {
      if (current?.videoId === videoId) {
        return null;
      }
      return current;
    });
  }, []);

  const pauseAllVideos = useCallback(() => {
    videos.forEach((video) => {
      if (video.isPlaying) {
        const webViewRef = videoRefs.current.get(video.videoId);
        if (webViewRef) {
          webViewRef.postMessage(JSON.stringify({ type: 'pause' }));
        }
      }
    });
  }, [videos]);

  const playVideo = useCallback((videoId: string) => {
    const video = videos.get(videoId);
    if (!video) return;

    // Pause any currently playing video (except the one we want to play)
    videos.forEach((otherVideo, otherVideoId) => {
      if (otherVideoId !== videoId && otherVideo.isPlaying) {
        const otherWebViewRef = videoRefs.current.get(otherVideoId);
        if (otherWebViewRef) {
          otherWebViewRef.postMessage(JSON.stringify({ type: 'pause' }));
        }
        // Update other video state
        setVideos(prev => {
          const newMap = new Map(prev);
          const updatedOtherVideo = { ...otherVideo, isPlaying: false, isPaused: true };
          newMap.set(otherVideoId, updatedOtherVideo);
          return newMap;
        });
      }
    });

    // Play the requested video
    const webViewRef = videoRefs.current.get(videoId);
    if (webViewRef) {
      webViewRef.postMessage(JSON.stringify({ type: 'play' }));
    }

    // Update state - reset manual pause flag when playing
    const updatedVideo = { 
      ...video, 
      isPlaying: true, 
      isPaused: false,
      wasManuallyPaused: false,
      shouldAutoPlay: true
    };
    setVideos(prev => new Map(prev.set(videoId, updatedVideo)));
    setCurrentVideo(updatedVideo);
    
    console.log(`Playing video: ${videoId}`);
  }, [videos]);

  const pauseVideo = useCallback((videoId: string, isManual: boolean = false) => {
    const video = videos.get(videoId);
    if (!video) return;

    const webViewRef = videoRefs.current.get(videoId);
    if (webViewRef) {
      webViewRef.postMessage(JSON.stringify({ type: 'pause' }));
    }

    // Update state - track if this was a manual pause
    const updatedVideo = { 
      ...video, 
      isPlaying: false, 
      isPaused: true,
      wasManuallyPaused: isManual || video.wasManuallyPaused,
      shouldAutoPlay: isManual ? false : video.shouldAutoPlay
    };
    setVideos(prev => new Map(prev.set(videoId, updatedVideo)));
    
    setCurrentVideo(current => {
      if (current?.videoId === videoId) {
        return updatedVideo;
      }
      return current;
    });
    
    console.log(`Paused video: ${videoId} (manual: ${isManual})`);
  }, [videos]);

  const stopVideo = useCallback((videoId: string) => {
    const video = videos.get(videoId);
    if (!video) return;

    const webViewRef = videoRefs.current.get(videoId);
    if (webViewRef) {
      webViewRef.postMessage(JSON.stringify({ type: 'stop' }));
    }

    // Update state - reset all flags when stopping
    const updatedVideo = { 
      ...video, 
      isPlaying: false, 
      isPaused: false, 
      currentTime: 0,
      wasManuallyPaused: false,
      shouldAutoPlay: autoPlayEnabled
    };
    setVideos(prev => new Map(prev.set(videoId, updatedVideo)));
    
    setCurrentVideo(current => {
      if (current?.videoId === videoId) {
        return null;
      }
      return current;
    });
    
    console.log(`Stopped video: ${videoId}`);
  }, [videos, autoPlayEnabled]);

  const updateVideoState = useCallback((videoId: string, stateUpdate: Partial<VideoState>) => {
    setVideos(prev => {
      const video = prev.get(videoId);
      if (!video) return prev;

      const updatedVideo = { ...video, ...stateUpdate };
      const newMap = new Map(prev);
      newMap.set(videoId, updatedVideo);
      return newMap;
    });
    
    setCurrentVideo(current => {
      if (current?.videoId === videoId) {
        return { ...current, ...stateUpdate };
      }
      return current;
    });
  }, []);

  const setVideoVisibility = useCallback((videoId: string, isVisible: boolean) => {
    const video = videos.get(videoId);
    if (!video) return;

    // Only update if visibility actually changed
    if (video.isVisible === isVisible) return;

    console.log(`Video ${videoId} visibility: ${isVisible}, wasManuallyPaused: ${video.wasManuallyPaused}, shouldAutoPlay: ${video.shouldAutoPlay}`);

    if (isVisible) {
      // Video became visible
      // Only auto-play if:
      // 1. Auto-play is enabled globally
      // 2. Video should auto-play (not manually paused)
      // 3. Video is not currently playing
      if (autoPlayEnabled && video.shouldAutoPlay && !video.wasManuallyPaused && !video.isPlaying) {
        console.log(`Auto-playing video ${videoId} as it became visible`);
        playVideo(videoId);
      }
    } else {
      // Video became invisible
      // Auto-pause when video goes out of view (but don't mark as manual pause)
      if (autoPauseOnScroll && video.isPlaying) {
        console.log(`Auto-pausing video ${videoId} as it went out of view`);
        pauseVideo(videoId, false); // false = not manual pause
      }
    }

    // Update visibility state
    updateVideoState(videoId, { isVisible });
  }, [videos, autoPlayEnabled, autoPauseOnScroll, playVideo, pauseVideo, updateVideoState]);

  // Store WebView refs for communication
  const setVideoRef = useCallback((videoId: string, ref: any) => {
    if (ref) {
      videoRefs.current.set(videoId, ref);
    } else {
      videoRefs.current.delete(videoId);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<VideoContextType>(() => ({
    currentVideo,
    registerVideo,
    unregisterVideo,
    playVideo,
    pauseVideo,
    stopVideo,
    updateVideoState,
    setVideoVisibility,
    autoPlayEnabled,
    setAutoPlayEnabled,
    autoPauseOnScroll,
    setAutoPauseOnScroll,
  }), [
    currentVideo,
    registerVideo,
    unregisterVideo,
    playVideo,
    pauseVideo,
    stopVideo,
    updateVideoState,
    setVideoVisibility,
    autoPlayEnabled,
    setAutoPlayEnabled,
    autoPauseOnScroll,
    setAutoPauseOnScroll,
  ]);

  // Add setVideoRef to context for internal use
  (contextValue as any).setVideoRef = setVideoRef;

  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

// Hook for video components to register themselves
export const useVideoPlayer = (videoId: string, playerId: string) => {
  const { registerVideo, unregisterVideo, updateVideoState, setVideoRef, pauseVideo } = useVideo() as any;

  // Memoize the registration to prevent re-registration on every render
  const stableVideoId = useMemo(() => videoId, [videoId]);
  const stablePlayerId = useMemo(() => playerId, [playerId]);

  useEffect(() => {
    if (!stableVideoId || !stablePlayerId || stableVideoId === 'dummy') return;
    
    registerVideo(stableVideoId, stablePlayerId);
    
    return () => {
      unregisterVideo(stableVideoId);
    };
  }, [stableVideoId, stablePlayerId, registerVideo, unregisterVideo]);

  const handlePlayerMessage = useCallback((message: any) => {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      switch (data.type) {
        case 'youtube_player_ready':
          console.log(`YouTube player ready: ${stableVideoId}`);
          break;
          
        case 'youtube_player_state_change':
          const isPlaying = data.state === 'playing';
          const isPaused = data.state === 'paused';
          
          // If user manually paused (not auto-pause), mark it
          if (isPaused && data.userInitiated) {
            console.log(`User manually paused video: ${stableVideoId}`);
            pauseVideo(stableVideoId, true); // true = manual pause
          } else {
            updateVideoState(stableVideoId, {
              isPlaying,
              isPaused,
            });
          }
          
          console.log(`Video ${stableVideoId} state changed to: ${data.state}`);
          break;
          
        case 'youtube_player_error':
          console.error(`YouTube player error for ${stableVideoId}:`, data.error);
          break;
      }
    } catch (error) {
      console.error('Error handling video message:', error);
    }
  }, [stableVideoId, updateVideoState, pauseVideo]);

  const setVideoRefCallback = useCallback((ref: any) => {
    setVideoRef(stableVideoId, ref);
  }, [stableVideoId, setVideoRef]);

  return useMemo(() => ({
    handlePlayerMessage,
    setVideoRef: setVideoRefCallback,
  }), [handlePlayerMessage, setVideoRefCallback]);
};
