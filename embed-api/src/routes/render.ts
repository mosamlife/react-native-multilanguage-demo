import { Router, Request, Response } from 'express';
import { embedService } from '../services/embed-service';
import validator from 'validator';

const router = Router();

interface RenderQuery {
  url: string;
  width?: string;
  height?: string;
  autoplay?: string;
  controls?: string;
  theme?: 'light' | 'dark';
}

router.get('/', async (req: Request<{}, any, any, RenderQuery>, res: Response) => {
  try {
    const { url, width, height, autoplay, controls, theme } = req.query;

    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter: url',
        message: 'Please provide a valid URL to render embed for',
      });
    }

    if (typeof url !== 'string') {
      return res.status(400).json({
        error: 'Invalid parameter type',
        message: 'URL parameter must be a string',
      });
    }

    // Trim and validate URL
    const trimmedUrl = url.trim();
    
    if (!validator.isURL(trimmedUrl, {
      protocols: ['http', 'https'],
      require_protocol: false,
    })) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP or HTTPS URL',
      });
    }

    // Parse and validate dimensions
    let parsedWidth: number | undefined;
    let parsedHeight: number | undefined;

    if (width) {
      parsedWidth = parseInt(width, 10);
      if (isNaN(parsedWidth) || parsedWidth < 1 || parsedWidth > 2000) {
        return res.status(400).json({
          error: 'Invalid width',
          message: 'Width must be a number between 1 and 2000',
        });
      }
    }

    if (height) {
      parsedHeight = parseInt(height, 10);
      if (isNaN(parsedHeight) || parsedHeight < 1 || parsedHeight > 2000) {
        return res.status(400).json({
          error: 'Invalid height',
          message: 'Height must be a number between 1 and 2000',
        });
      }
    }

    // Parse boolean parameters
    const parsedAutoplay = autoplay === 'true' || autoplay === '1';
    const parsedControls = controls !== 'false' && controls !== '0';

    // Validate theme parameter
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        error: 'Invalid theme',
        message: 'Theme must be either "light" or "dark"',
      });
    }

    // Generate HTML embed
    const html = await embedService.renderEmbed(trimmedUrl, {
      width: parsedWidth,
      height: parsedHeight,
      autoplay: parsedAutoplay,
      controls: parsedControls,
      theme: theme || 'light',
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Return HTML embed
    res.send(html);

  } catch (error) {
    console.error('Render embed error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid URL')) {
        return res.status(400).json({
          error: 'Invalid URL',
          message: error.message,
        });
      }

      if (error.message.includes('timeout')) {
        return res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process. Please try again.',
        });
      }

      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return res.status(404).json({
          error: 'URL not accessible',
          message: 'The provided URL could not be accessed or does not exist.',
        });
      }

      if (error.message.includes('No suitable parser')) {
        return res.status(422).json({
          error: 'Unsupported content',
          message: 'The provided URL contains content that cannot be embedded.',
        });
      }
    }

    // Generic error response - return HTML error page
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Embed Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
          }
          .error-container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .error-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #e74c3c;
          }
          .error-message {
            color: #666;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <div class="error-title">Embed Error</div>
          <div class="error-message">
            An error occurred while generating the embed. Please try again later.
          </div>
        </div>
      </body>
      </html>
    `;

    res.status(500).send(errorHtml);
  }
});

export default router;
