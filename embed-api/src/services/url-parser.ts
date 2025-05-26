import { Platform } from '../types';

export class URLParser {
  private static readonly PLATFORM_PATTERNS: Record<Platform, RegExp[]> = {
    youtube: [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^"&?\/\s]{11})/i,
    ],
    instagram: [
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i,
    ],
    tiktok: [
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
      /(?:https?:\/\/)?vm\.tiktok\.com\/([A-Za-z0-9]+)/i,
    ],
    linkedin: [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/posts\/[^\/]+\/([A-Za-z0-9_-]+)/i,
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/pulse\/[^\/]+\/([A-Za-z0-9_-]+)/i,
    ],
    twitter: [
      /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/i,
    ],
    generic: [
      /^https?:\/\/.+/i,
    ],
  };

  static detectPlatform(url: string): Platform {
    // Check specific platforms first
    for (const [platform, patterns] of Object.entries(this.PLATFORM_PATTERNS)) {
      if (platform === 'generic') continue;
      
      for (const pattern of patterns) {
        if (pattern.test(url)) {
          return platform as Platform;
        }
      }
    }
    
    // Default to generic if no specific platform matches
    return 'generic';
  }

  static isEmbeddable(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  static normalizeUrl(url: string): string {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      
      // Remove tracking parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'ref', 'source', 'campaign_id'
      ];
      
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  static extractYouTubeVideoId(url: string): string | null {
    const patterns = this.PLATFORM_PATTERNS.youtube;
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  static extractInstagramPostId(url: string): string | null {
    const pattern = this.PLATFORM_PATTERNS.instagram[0];
    const match = url.match(pattern);
    return match ? match[1] : null;
  }

  static extractTikTokVideoId(url: string): string | null {
    const patterns = this.PLATFORM_PATTERNS.tiktok;
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  static extractLinkedInPostId(url: string): string | null {
    const patterns = this.PLATFORM_PATTERNS.linkedin;
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  static extractTwitterTweetId(url: string): string | null {
    const pattern = this.PLATFORM_PATTERNS.twitter[0];
    const match = url.match(pattern);
    return match ? match[1] : null;
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static getDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }

  static isSameDomain(url1: string, url2: string): boolean {
    const domain1 = this.getDomain(url1);
    const domain2 = this.getDomain(url2);
    return domain1 !== null && domain2 !== null && domain1 === domain2;
  }
}
