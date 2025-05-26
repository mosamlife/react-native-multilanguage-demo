import { EmbedMetadata, PlatformParser, RenderOptions } from '../../types';
import { MetadataExtractor } from '../metadata';

export class GenericParser implements PlatformParser {
  canHandle(url: string): boolean {
    // Generic parser handles all URLs as fallback
    return true;
  }

  async extractMetadata(url: string): Promise<EmbedMetadata> {
    try {
      const metadata = await MetadataExtractor.extractBasicMetadata(url);
      return {
        ...metadata,
        platform: 'generic',
        provider: {
          name: this.getDomainFromUrl(url),
          url: this.getBaseUrl(url),
        },
      };
    } catch (error) {
      console.error('Error extracting generic metadata:', error);
      
      // Return minimal metadata as fallback
      return {
        title: this.getDomainFromUrl(url),
        description: 'Visit this link to view the content',
        type: 'link',
        platform: 'generic',
        url,
        provider: {
          name: this.getDomainFromUrl(url),
          url: this.getBaseUrl(url),
        },
      };
    }
  }

  generateEmbed(metadata: EmbedMetadata, options: RenderOptions = {}): string {
    const maxWidth = options.width || 500;
    
    return `
      <div class="generic-embed" style="border: 1px solid #e1e5e9; border-radius: 8px; overflow: hidden; max-width: ${maxWidth}px; margin: 0 auto; background: #fff;">
        ${metadata.image ? `
          <div style="position: relative; overflow: hidden;">
            <img 
              src="${metadata.image}" 
              alt="${this.escapeHtml(metadata.title || 'Link preview')}" 
              style="width: 100%; height: 200px; object-fit: cover; display: block;"
              onerror="this.style.display='none'"
            >
          </div>
        ` : ''}
        <div style="padding: 16px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d2129; line-height: 1.3;">
            <a 
              href="${metadata.url}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="text-decoration: none; color: inherit; hover: text-decoration: underline;"
            >
              ${this.escapeHtml(metadata.title || 'Untitled')}
            </a>
          </h3>
          ${metadata.description ? `
            <p style="margin: 0 0 12px 0; color: #65676b; font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${this.escapeHtml(metadata.description)}
            </p>
          ` : ''}
          <div style="display: flex; align-items: center; color: #65676b; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
            ${this.getFaviconUrl(metadata.url) ? `
              <img 
                src="${this.getFaviconUrl(metadata.url)}" 
                alt="" 
                style="width: 16px; height: 16px; margin-right: 8px; border-radius: 2px;"
                onerror="this.style.display='none'"
              >
            ` : ''}
            <span>${this.escapeHtml(metadata.provider?.name || this.getDomainFromUrl(metadata.url))}</span>
            ${metadata.author?.name ? ` • ${this.escapeHtml(metadata.author.name)}` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private getDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  private getBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return url;
    }
  }

  private getFaviconUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return null;
    }
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
