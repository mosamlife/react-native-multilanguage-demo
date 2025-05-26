import axios from 'axios';
import * as cheerio from 'cheerio';
import { EmbedMetadata } from '../types';

export class MetadataExtractor {
  private static readonly USER_AGENT = 'Mozilla/5.0 (compatible; EmbedBot/1.0; +https://example.com/bot)';
  private static readonly TIMEOUT = 10000; // 10 seconds

  static async extractOpenGraph(url: string): Promise<Partial<EmbedMetadata>> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: this.TIMEOUT,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);
      
      const metadata: Partial<EmbedMetadata> = {
        url,
        platform: 'generic',
        type: 'link',
      };

      // Extract OpenGraph tags
      metadata.title = this.extractMetaContent($, [
        'og:title',
        'twitter:title',
        'title'
      ]) || $('title').first().text().trim();

      metadata.description = this.extractMetaContent($, [
        'og:description',
        'twitter:description',
        'description'
      ]) || undefined;

      metadata.image = this.extractMetaContent($, [
        'og:image',
        'twitter:image',
        'twitter:image:src'
      ]) || undefined;

      // Determine content type
      const ogType = this.extractMetaContent($, ['og:type']);
      if (ogType) {
        switch (ogType.toLowerCase()) {
          case 'video':
          case 'video.movie':
          case 'video.episode':
          case 'video.tv_show':
          case 'video.other':
            metadata.type = 'video';
            break;
          case 'music':
          case 'music.song':
          case 'music.album':
          case 'music.playlist':
            metadata.type = 'audio';
            break;
          case 'article':
          case 'blog':
          case 'news':
            metadata.type = 'article';
            break;
          default:
            metadata.type = 'link';
        }
      }

      // Extract video dimensions if available
      const width = this.extractMetaContent($, ['og:video:width', 'twitter:player:width']);
      const height = this.extractMetaContent($, ['og:video:height', 'twitter:player:height']);
      
      if (width) metadata.width = parseInt(width, 10);
      if (height) metadata.height = parseInt(height, 10);

      // Extract author information
      const authorName = this.extractMetaContent($, [
        'og:site_name',
        'twitter:site',
        'author'
      ]);
      
      if (authorName) {
        metadata.author = {
          name: authorName.replace('@', ''),
        };
      }

      // Make image URL absolute
      if (metadata.image && !metadata.image.startsWith('http')) {
        const baseUrl = new URL(url);
        metadata.image = new URL(metadata.image, baseUrl.origin).toString();
      }

      return metadata;
    } catch (error) {
      console.error('Error extracting OpenGraph metadata:', error);
      return {
        url,
        platform: 'generic',
        type: 'link',
        title: this.getDomainFromUrl(url),
      };
    }
  }

  static async extractTwitterCards(url: string): Promise<Partial<EmbedMetadata>> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
        timeout: this.TIMEOUT,
      });

      const $ = cheerio.load(response.data);
      
      const metadata: Partial<EmbedMetadata> = {
        url,
        platform: 'generic',
        type: 'link',
      };

      // Extract Twitter Card tags
      metadata.title = this.extractMetaContent($, ['twitter:title']) || $('title').first().text().trim();
      metadata.description = this.extractMetaContent($, ['twitter:description']) || undefined;
      metadata.image = this.extractMetaContent($, ['twitter:image', 'twitter:image:src']) || undefined;

      const cardType = this.extractMetaContent($, ['twitter:card']);
      if (cardType) {
        switch (cardType.toLowerCase()) {
          case 'player':
            metadata.type = 'video';
            break;
          case 'summary_large_image':
          case 'summary':
            metadata.type = 'article';
            break;
          default:
            metadata.type = 'link';
        }
      }

      return metadata;
    } catch (error) {
      console.error('Error extracting Twitter Card metadata:', error);
      return {
        url,
        platform: 'generic',
        type: 'link',
        title: this.getDomainFromUrl(url),
      };
    }
  }

  static async extractJSONLD(url: string): Promise<any[]> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
        timeout: this.TIMEOUT,
      });

      const $ = cheerio.load(response.data);
      const jsonLdScripts = $('script[type="application/ld+json"]');
      const jsonLdData: any[] = [];

      jsonLdScripts.each((_, element) => {
        try {
          const content = $(element).html();
          if (content) {
            const data = JSON.parse(content);
            jsonLdData.push(data);
          }
        } catch (parseError) {
          console.warn('Error parsing JSON-LD:', parseError);
        }
      });

      return jsonLdData;
    } catch (error) {
      console.error('Error extracting JSON-LD:', error);
      return [];
    }
  }

  private static extractMetaContent($: cheerio.CheerioAPI, selectors: string[]): string | null {
    for (const selector of selectors) {
      // Try meta property first
      let content = $(`meta[property="${selector}"]`).attr('content');
      if (content) return content.trim();

      // Try meta name
      content = $(`meta[name="${selector}"]`).attr('content');
      if (content) return content.trim();

      // Try meta itemprop
      content = $(`meta[itemprop="${selector}"]`).attr('content');
      if (content) return content.trim();
    }
    return null;
  }

  private static getDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  static async extractBasicMetadata(url: string): Promise<EmbedMetadata> {
    // Try OpenGraph first, fallback to Twitter Cards
    const ogMetadata = await this.extractOpenGraph(url);
    
    if (!ogMetadata.title || !ogMetadata.description) {
      const twitterMetadata = await this.extractTwitterCards(url);
      
      // Merge metadata, preferring OpenGraph but filling gaps with Twitter Cards
      return {
        title: ogMetadata.title || twitterMetadata.title || this.getDomainFromUrl(url),
        description: ogMetadata.description || twitterMetadata.description,
        image: ogMetadata.image || twitterMetadata.image,
        type: ogMetadata.type || twitterMetadata.type || 'link',
        platform: 'generic',
        url,
        author: ogMetadata.author,
        width: ogMetadata.width,
        height: ogMetadata.height,
      } as EmbedMetadata;
    }

    return ogMetadata as EmbedMetadata;
  }
}
