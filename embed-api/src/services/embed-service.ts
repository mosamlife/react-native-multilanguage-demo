import { EmbedMetadata, OEmbedResponse, OEmbedOptions, RenderOptions, PlatformParser } from '../types';
import { URLParser } from './url-parser';
import { YouTubeParser } from './parsers/youtube';
import { GenericParser } from './parsers/generic';

export class EmbedService {
  private parsers: PlatformParser[];

  constructor() {
    this.parsers = [
      new YouTubeParser(),
      new GenericParser(), // Keep generic parser last as fallback
    ];
  }

  async extractMetadata(url: string): Promise<EmbedMetadata> {
    if (!URLParser.isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    const normalizedUrl = URLParser.normalizeUrl(url);
    
    // Find the appropriate parser
    const parser = this.findParser(normalizedUrl);
    
    if (!parser) {
      throw new Error('No suitable parser found for URL');
    }

    try {
      const metadata = await parser.extractMetadata(normalizedUrl);
      return {
        ...metadata,
        url: normalizedUrl,
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      
      // Fallback to generic parser if specific parser fails
      if (!(parser instanceof GenericParser)) {
        const genericParser = new GenericParser();
        return await genericParser.extractMetadata(normalizedUrl);
      }
      
      throw error;
    }
  }

  async getOEmbed(url: string, options: OEmbedOptions = {}): Promise<OEmbedResponse> {
    const metadata = await this.extractMetadata(url);
    const parser = this.findParser(url);
    
    if (!parser) {
      throw new Error('No suitable parser found for URL');
    }

    const renderOptions: RenderOptions = {
      width: options.maxwidth,
      height: options.maxheight,
    };

    const html = parser.generateEmbed(metadata, renderOptions);
    
    // Calculate dimensions
    const width = renderOptions.width || metadata.width || 500;
    const height = renderOptions.height || metadata.height || 300;

    const oembedResponse: OEmbedResponse = {
      type: this.mapTypeToOEmbed(metadata.type),
      version: '1.0',
      html,
      width,
      height,
      title: metadata.title,
      author_name: metadata.author?.name,
      author_url: metadata.author?.url,
      provider_name: metadata.provider?.name || 'External Content',
      provider_url: metadata.provider?.url,
      cache_age: 3600, // 1 hour
    };

    // Add thumbnail for video/photo types
    if (metadata.image && (metadata.type === 'video' || metadata.type === 'image')) {
      oembedResponse.thumbnail_url = metadata.image;
      oembedResponse.thumbnail_width = metadata.width;
      oembedResponse.thumbnail_height = metadata.height;
    }

    return oembedResponse;
  }

  async renderEmbed(url: string, options: RenderOptions = {}): Promise<string> {
    const metadata = await this.extractMetadata(url);
    const parser = this.findParser(url);
    
    if (!parser) {
      throw new Error('No suitable parser found for URL');
    }

    return parser.generateEmbed(metadata, options);
  }

  private findParser(url: string): PlatformParser | null {
    for (const parser of this.parsers) {
      if (parser.canHandle(url)) {
        return parser;
      }
    }
    return null;
  }

  private mapTypeToOEmbed(type: string): 'rich' | 'video' | 'photo' | 'link' {
    switch (type) {
      case 'video':
        return 'video';
      case 'image':
        return 'photo';
      case 'article':
      case 'audio':
        return 'rich';
      default:
        return 'link';
    }
  }

  // Utility methods for checking platform support
  isYouTubeUrl(url: string): boolean {
    return URLParser.detectPlatform(url) === 'youtube';
  }

  isInstagramUrl(url: string): boolean {
    return URLParser.detectPlatform(url) === 'instagram';
  }

  isTikTokUrl(url: string): boolean {
    return URLParser.detectPlatform(url) === 'tiktok';
  }

  isLinkedInUrl(url: string): boolean {
    return URLParser.detectPlatform(url) === 'linkedin';
  }

  isTwitterUrl(url: string): boolean {
    return URLParser.detectPlatform(url) === 'twitter';
  }

  getSupportedPlatforms(): string[] {
    return ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'generic'];
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; parsers: number; timestamp: string }> {
    return {
      status: 'healthy',
      parsers: this.parsers.length,
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const embedService = new EmbedService();
