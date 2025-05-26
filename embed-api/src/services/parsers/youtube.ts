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

    const embedParams = new URLSearchParams({
      autoplay: autoplay.toString(),
      controls: controls.toString(),
      rel: '0',
      modestbranding: '1',
    });

    const finalEmbedUrl = `${embedUrl}?${embedParams.toString()}`;

    return `
      <div class="youtube-embed" style="position: relative; width: 100%; max-width: ${width}px; margin: 0 auto;">
        <div style="position: relative; padding-bottom: ${(height / width * 100).toFixed(2)}%; height: 0; overflow: hidden;">
          <iframe 
            src="${finalEmbedUrl}"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            title="${this.escapeHtml(metadata.title || 'YouTube Video')}"
          ></iframe>
        </div>
        ${metadata.title ? `<div style="margin-top: 8px; font-weight: bold; color: #333;">${this.escapeHtml(metadata.title)}</div>` : ''}
        ${metadata.author?.name ? `<div style="margin-top: 4px; color: #666; font-size: 14px;">by ${this.escapeHtml(metadata.author.name)}</div>` : ''}
      </div>
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
