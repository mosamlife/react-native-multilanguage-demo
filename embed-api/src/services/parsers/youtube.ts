import axios from 'axios';
import { EmbedMetadata, PlatformParser, RenderOptions, YouTubeVideoInfo } from '../../types';
import { URLParser } from '../url-parser';

export class YouTubeParser implements PlatformParser {
  private static readonly OEMBED_ENDPOINT = 'https://www.youtube.com/oembed';
  private static readonly THUMBNAIL_BASE = 'https://img.youtube.com/vi';

  canHandle(url: string): boolean {
    return URLParser.detectPlatform(url) === 'youtube';
  }

  async extractMetadata(url: string): Promise<EmbedMetadata> {
    const videoId = URLParser.extractYouTubeVideoId(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    try {
      // Try oEmbed first for official data
      const oembedData = await this.fetchOEmbedData(url);
      
      if (oembedData) {
        return {
          title: oembedData.title,
          description: `Watch "${oembedData.title}" by ${oembedData.author_name}`,
          image: oembedData.thumbnail_url,
          type: 'video',
          platform: 'youtube',
          url,
          width: oembedData.width,
          height: oembedData.height,
          author: {
            name: oembedData.author_name,
            url: oembedData.author_url,
          },
          provider: {
            name: 'YouTube',
            url: 'https://youtube.com',
          },
          embedData: {
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
          },
        };
      }

      // Fallback to basic metadata extraction
      return await this.extractBasicVideoInfo(videoId, url);
    } catch (error) {
      console.error('Error extracting YouTube metadata:', error);
      
      // Return minimal metadata as fallback
      return {
        title: 'YouTube Video',
        description: 'Watch this video on YouTube',
        image: this.getThumbnailUrl(videoId),
        type: 'video',
        platform: 'youtube',
        url,
        provider: {
          name: 'YouTube',
          url: 'https://youtube.com',
        },
        embedData: {
          videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        },
      };
    }
  }

  generateEmbed(metadata: EmbedMetadata, options: RenderOptions = {}): string {
    const { videoId, embedUrl } = metadata.embedData || {};
    
    if (!videoId || !embedUrl) {
      return this.generateLinkPreview(metadata);
    }

    const width = options.width || metadata.width || 560;
    const height = options.height || metadata.height || 315;
    const autoplay = options.autoplay ? 1 : 0;
    const controls = options.controls !== false ? 1 : 0;
    const playerId = `youtube-player-${videoId}-${Date.now()}`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.escapeHtml(metadata.title || 'YouTube Video')}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000;
          }
          .youtube-container {
            position: relative;
            width: 100%;
            max-width: ${width}px;
            margin: 0 auto;
            background: #000;
          }
          .youtube-player-wrapper {
            position: relative;
            padding-bottom: ${(height / width * 100).toFixed(2)}%;
            height: 0;
            overflow: hidden;
            background: #000;
          }
          #${playerId} {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          .video-info {
            padding: 12px;
            background: #fff;
          }
          .video-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
            font-size: 16px;
            line-height: 1.3;
          }
          .video-author {
            color: #666;
            font-size: 14px;
          }
          .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 14px;
          }
          .thumbnail-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${metadata.image}');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: opacity 0.3s ease;
          }
          .play-button {
            width: 68px;
            height: 48px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }
          .play-button:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.1);
          }
          .play-icon {
            width: 0;
            height: 0;
            border-left: 16px solid #ff0000;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            margin-left: 4px;
          }
        </style>
      </head>
      <body>
        <div class="youtube-container">
          <div class="youtube-player-wrapper">
            <div id="${playerId}"></div>
            <div id="loading-${playerId}" class="loading-overlay">
              Loading YouTube Player...
            </div>
            <div id="thumbnail-${playerId}" class="thumbnail-overlay" onclick="initializePlayer()">
              <div class="play-button">
                <div class="play-icon"></div>
              </div>
            </div>
          </div>
          ${metadata.title || metadata.author?.name ? `
            <div class="video-info">
              ${metadata.title ? `<div class="video-title">${this.escapeHtml(metadata.title)}</div>` : ''}
              ${metadata.author?.name ? `<div class="video-author">by ${this.escapeHtml(metadata.author.name)}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <script>
          let player;
          let playerReady = false;
          let shouldAutoplay = ${autoplay === 1 ? 'true' : 'false'};
          let apiLoaded = false;

          // Load YouTube IFrame API
          function loadYouTubeAPI() {
            if (window.YT && window.YT.Player) {
              apiLoaded = true;
              if (shouldAutoplay) {
                initializePlayer();
              }
              return;
            }

            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          }

          // YouTube API ready callback
          function onYouTubeIframeAPIReady() {
            apiLoaded = true;
            if (shouldAutoplay) {
              initializePlayer();
            }
          }

          // Initialize YouTube player
          function initializePlayer() {
            if (!apiLoaded) {
              loadYouTubeAPI();
              return;
            }

            if (player) {
              player.playVideo();
              return;
            }

            // Hide thumbnail overlay
            const thumbnail = document.getElementById('thumbnail-${playerId}');
            if (thumbnail) {
              thumbnail.style.opacity = '0';
              setTimeout(() => {
                thumbnail.style.display = 'none';
              }, 300);
            }

            // Show loading
            const loading = document.getElementById('loading-${playerId}');
            if (loading) {
              loading.style.display = 'flex';
            }

            player = new YT.Player('${playerId}', {
              height: '${height}',
              width: '${width}',
              videoId: '${videoId}',
              playerVars: {
                autoplay: 1,
                controls: ${controls},
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1,
                origin: window.location.origin
              },
              events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
              }
            });
          }

          // Player ready callback
          function onPlayerReady(event) {
            playerReady = true;
            
            // Hide loading
            const loading = document.getElementById('loading-${playerId}');
            if (loading) {
              loading.style.display = 'none';
            }

            // Send ready event to React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'youtube_player_ready',
                videoId: '${videoId}',
                playerId: '${playerId}'
              }));
            }

            // Auto-play if requested
            if (shouldAutoplay) {
              event.target.playVideo();
            }
          }

          // Player state change callback
          function onPlayerStateChange(event) {
            const states = {
              '-1': 'unstarted',
              '0': 'ended',
              '1': 'playing',
              '2': 'paused',
              '3': 'buffering',
              '5': 'cued'
            };

            const state = states[event.data] || 'unknown';

            // Send state change to React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'youtube_player_state_change',
                videoId: '${videoId}',
                playerId: '${playerId}',
                state: state,
                stateCode: event.data
              }));
            }

            // Handle specific states
            if (event.data === YT.PlayerState.PLAYING) {
              // Video started playing
              console.log('YouTube video started playing');
            } else if (event.data === YT.PlayerState.PAUSED) {
              // Video paused
              console.log('YouTube video paused');
            } else if (event.data === YT.PlayerState.ENDED) {
              // Video ended
              console.log('YouTube video ended');
            }
          }

          // Player error callback
          function onPlayerError(event) {
            console.error('YouTube player error:', event.data);
            
            // Send error to React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'youtube_player_error',
                videoId: '${videoId}',
                playerId: '${playerId}',
                error: event.data
              }));
            }
          }

          // Expose player control functions
          window.playVideo = function() {
            if (player && playerReady) {
              player.playVideo();
            }
          };

          window.pauseVideo = function() {
            if (player && playerReady) {
              player.pauseVideo();
            }
          };

          window.stopVideo = function() {
            if (player && playerReady) {
              player.stopVideo();
            }
          };

          window.seekTo = function(seconds) {
            if (player && playerReady) {
              player.seekTo(seconds, true);
            }
          };

          window.setVolume = function(volume) {
            if (player && playerReady) {
              player.setVolume(volume);
            }
          };

          window.getPlayerState = function() {
            if (player && playerReady) {
              return player.getPlayerState();
            }
            return -1;
          };

          window.getCurrentTime = function() {
            if (player && playerReady) {
              return player.getCurrentTime();
            }
            return 0;
          };

          window.getDuration = function() {
            if (player && playerReady) {
              return player.getDuration();
            }
            return 0;
          };

          // Load API on page load
          loadYouTubeAPI();

          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              
              switch(data.type) {
                case 'play':
                  window.playVideo();
                  break;
                case 'pause':
                  window.pauseVideo();
                  break;
                case 'stop':
                  window.stopVideo();
                  break;
                case 'seek':
                  window.seekTo(data.seconds);
                  break;
                case 'volume':
                  window.setVolume(data.volume);
                  break;
              }
            } catch (e) {
              console.error('Error handling message:', e);
            }
          });
        </script>
      </body>
      </html>
    `;
  }

  private async fetchOEmbedData(url: string): Promise<any> {
    try {
      const oembedUrl = `${YouTubeParser.OEMBED_ENDPOINT}?url=${encodeURIComponent(url)}&format=json`;
      const response = await axios.get(oembedUrl, {
        timeout: 5000,
      });
      
      return response.data;
    } catch (error) {
      console.warn('YouTube oEmbed request failed:', error);
      return null;
    }
  }

  private async extractBasicVideoInfo(videoId: string, url: string): Promise<EmbedMetadata> {
    // This is a fallback method that extracts basic info without API keys
    // In a production environment, you might want to use YouTube Data API v3
    
    return {
      title: 'YouTube Video',
      description: 'Watch this video on YouTube',
      image: this.getThumbnailUrl(videoId),
      type: 'video',
      platform: 'youtube',
      url,
      width: 560,
      height: 315,
      provider: {
        name: 'YouTube',
        url: 'https://youtube.com',
      },
      embedData: {
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      },
    };
  }

  private getThumbnailUrl(videoId: string, quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'): string {
    return `${YouTubeParser.THUMBNAIL_BASE}/${videoId}/${quality}.jpg`;
  }

  private generateLinkPreview(metadata: EmbedMetadata): string {
    return `
      <div class="youtube-link-preview" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 500px; margin: 0 auto;">
        ${metadata.image ? `
          <div style="position: relative;">
            <img src="${metadata.image}" alt="${this.escapeHtml(metadata.title || 'YouTube Video')}" style="width: 100%; height: auto; display: block;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        ` : ''}
        <div style="padding: 16px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
            <a href="${metadata.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
              ${this.escapeHtml(metadata.title || 'YouTube Video')}
            </a>
          </h3>
          ${metadata.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.4;">${this.escapeHtml(metadata.description)}</p>` : ''}
          <div style="display: flex; align-items: center; color: #666; font-size: 12px;">
            <span>YouTube</span>
            ${metadata.author?.name ? ` • ${this.escapeHtml(metadata.author.name)}` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
