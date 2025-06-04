export interface EmbedMetadata {
  title: string;
  description?: string;
  image?: string;
  type: 'video' | 'photo' | 'link' | 'rich';
  platform: string;
  url: string;
  width?: number;
  height?: number;
  author?: {
    name: string;
    url?: string;
  };
  provider?: {
    name: string;
    url: string;
  };
  embedData?: {
    videoId?: string;
    embedUrl?: string;
  };
}

export interface EmbedApiResponse {
  success: boolean;
  data: EmbedMetadata;
  timestamp: string;
}

export interface OEmbedResponse {
  type: string;
  version: string;
  html: string;
  width: number;
  height: number;
  title: string;
  author_name?: string;
  author_url?: string;
  provider_name: string;
  provider_url: string;
  cache_age: number;
  thumbnail_url?: string;
}

class EmbedApiService {
  private baseUrl = 'http://192.168.1.48:3001';

  async extractMetadata(url: string): Promise<EmbedMetadata> {
    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await fetch(`${this.baseUrl}/api/extract?url=${encodedUrl}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extract metadata');
      }

      const data: EmbedApiResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      throw error;
    }
  }

  async getOEmbed(url: string, maxwidth?: number, maxheight?: number): Promise<OEmbedResponse> {
    try {
      const encodedUrl = encodeURIComponent(url);
      let apiUrl = `${this.baseUrl}/api/oembed?url=${encodedUrl}&format=json`;
      
      if (maxwidth) {
        apiUrl += `&maxwidth=${maxwidth}`;
      }
      if (maxheight) {
        apiUrl += `&maxheight=${maxheight}`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get oEmbed data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting oEmbed data:', error);
      throw error;
    }
  }

  async renderEmbed(
    url: string, 
    options?: {
      width?: number;
      height?: number;
      autoplay?: boolean;
      controls?: boolean;
      theme?: 'light' | 'dark';
    }
  ): Promise<string> {
    try {
      const encodedUrl = encodeURIComponent(url);
      let apiUrl = `${this.baseUrl}/api/render?url=${encodedUrl}`;
      
      if (options?.width) {
        apiUrl += `&width=${options.width}`;
      }
      if (options?.height) {
        apiUrl += `&height=${options.height}`;
      }
      if (options?.autoplay !== undefined) {
        apiUrl += `&autoplay=${options.autoplay}`;
      }
      if (options?.controls !== undefined) {
        apiUrl += `&controls=${options.controls}`;
      }
      if (options?.theme) {
        apiUrl += `&theme=${options.theme}`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to render embed');
      }

      return await response.text();
    } catch (error) {
      console.error('Error rendering embed:', error);
      throw error;
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const embedApiService = new EmbedApiService();
