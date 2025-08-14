'use dom';

import React from 'react';
import { 
  YouTubeEmbed, 
  InstagramEmbed, 
  TikTokEmbed, 
  XEmbed,
  FacebookEmbed,
  LinkedInEmbed,
  PinterestEmbed
} from 'react-social-media-embed';

export type SocialPlatform = 'youtube' | 'youtube-shorts' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin' | 'pinterest';

interface SocialMediaEmbedProps {
  platform: SocialPlatform;
  url: string;
  width?: number;
  height?: number;
  dom?: import('expo/dom').DOMProps;
  onEmbedLoad?: (platform: string) => Promise<void>;
  onEmbedError?: (error: string) => Promise<void>;
}

export default function SocialMediaEmbed({
  platform,
  url,
  width = 325,
  height,
  onEmbedLoad,
  onEmbedError,
}: SocialMediaEmbedProps) {
  
  const handleLoad = () => {
    console.log(`${platform} embed loaded successfully`);
    onEmbedLoad?.(platform);
  };

  const handleError = (error: any) => {
    const errorMessage = `Failed to load ${platform} embed: ${error?.message || 'Unknown error'}`;
    console.error(errorMessage);
    onEmbedError?.(errorMessage);
  };

  const renderEmbed = () => {
    try {
      switch (platform) {
        case 'youtube':
          return (
            <YouTubeEmbed
              url={url}
              width={width}
              height={height || 315}
              youTubeProps={{
                onReady: handleLoad,
                onError: handleError,
                loading: 'lazy',
                opts: {
                  playerVars: {
                    autoplay: 1, // Don't autoplay - show thumbnail instead
                    rel: 0, // Don't show related videos
                    modestbranding: 1, // Minimal YouTube branding
                    controls: 1, // Show player controls
                  },
                },
              }}
            />
          );

        case 'youtube-shorts':
          // For YouTube Shorts, we'll use a custom iframe approach
          // since react-social-media-embed doesn't handle Shorts well
          const shortsVideoId = url.match(/shorts\/([a-zA-Z0-9_-]+)/)?.[1];
          if (!shortsVideoId) {
            throw new Error('Invalid YouTube Shorts URL');
          }
          
          return (
            <div style={{
              width: width,
              height: height || 500,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <iframe
                width={Math.min(width, 315)}
                height={height || 500}
                src={`https://www.youtube.com/embed/${shortsVideoId}?autoplay=0&mute=0&controls=1&loop=0`}
                title="YouTube Shorts video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
                style={{
                  borderRadius: '8px',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            </div>
          );

        case 'instagram':
          return (
            <InstagramEmbed
              url={url}
              width={width}
              captioned
            />
          );

        case 'tiktok':
          return (
            <TikTokEmbed
              url={url}
              width={width}
            />
          );

        case 'twitter':
          return (
            <XEmbed
              url={url}
              width={width}
            />
          );

        case 'facebook':
          return (
            <FacebookEmbed
              url={url}
              width={width}
            />
          );

        case 'linkedin':
          return (
            <LinkedInEmbed
              url={url}
              postUrl={url}
              width={width}
              height={height || 570}
            />
          );

        case 'pinterest':
          return (
            <PinterestEmbed
              url={url}
              width={width}
              height={height || 467}
            />
          );

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      handleError(error);
      return (
        <div style={{
          width: width,
          height: height || 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e1e8ed',
          borderRadius: '8px',
          color: '#657786',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Failed to load {platform} embed</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      margin: '8px 0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: width,
        position: 'relative'
      }}>
        {/* Platform indicator */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '8px',
          backgroundColor: '#007AFF',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '600',
          textTransform: 'uppercase',
          zIndex: 10,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {platform}
        </div>
        
        {/* Embed content */}
        <div style={{ paddingTop: '16px' }}>
          {renderEmbed()}
        </div>
      </div>
    </div>
  );
}
