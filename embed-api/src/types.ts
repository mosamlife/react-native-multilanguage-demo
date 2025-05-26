export interface EmbedMetadata {
  title?: string;
  description?: string;
  image?: string;
  type: 'video' | 'image' | 'article' | 'audio' | 'link';
  platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'generic';
  url: string;
  embedData?: any;
  width?: number;
  height?: number;
  duration?: number;
  author?: {
    name?: string;
    url?: string;
    avatar?: string;
  };
  provider?: {
    name: string;
    url: string;
  };
}

export interface OEmbedResponse {
  type: 'rich' | 'video' | 'photo' | 'link';
  version: '1.0';
  html?: string;
  width?: number;
  height?: number;
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export interface OEmbedOptions {
  maxwidth?: number;
  maxheight?: number;
  format?: 'json' | 'xml';
}

export interface RenderOptions {
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  theme?: 'light' | 'dark';
}

export interface PlatformParser {
  canHandle(url: string): boolean;
  extractMetadata(url: string): Promise<EmbedMetadata>;
  generateEmbed(metadata: EmbedMetadata, options?: RenderOptions): string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'generic';

export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  author: string;
  channelUrl: string;
}

export interface InstagramPostInfo {
  postId: string;
  caption: string;
  thumbnail: string;
  author: string;
  authorUrl: string;
  type: 'photo' | 'video' | 'carousel';
}

export interface TikTokVideoInfo {
  videoId: string;
  description: string;
  thumbnail: string;
  author: string;
  authorUrl: string;
  duration: number;
}

export interface LinkedInPostInfo {
  postId: string;
  title: string;
  description: string;
  author: string;
  authorUrl: string;
  type: 'post' | 'article';
}

export interface TwitterPostInfo {
  tweetId: string;
  text: string;
  author: string;
  authorUrl: string;
  authorAvatar: string;
  createdAt: string;
  mediaUrls?: string[];
}
