import { Router, Request, Response } from 'express';
import { embedService } from '../services/embed-service';
import validator from 'validator';

const router = Router();

interface OEmbedQuery {
  url: string;
  format?: 'json' | 'xml';
  maxwidth?: string;
  maxheight?: string;
}

router.get('/', async (req: Request<{}, any, any, OEmbedQuery>, res: Response) => {
  try {
    const { url, format = 'json', maxwidth, maxheight } = req.query;

    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter: url',
        message: 'Please provide a valid URL to generate oEmbed for',
      });
    }

    if (typeof url !== 'string') {
      return res.status(400).json({
        error: 'Invalid parameter type',
        message: 'URL parameter must be a string',
      });
    }

    // Validate format parameter
    if (format && !['json', 'xml'].includes(format)) {
      return res.status(400).json({
        error: 'Invalid format',
        message: 'Format must be either "json" or "xml"',
      });
    }

    // XML format is not supported yet
    if (format === 'xml') {
      return res.status(501).json({
        error: 'Format not supported',
        message: 'XML format is not currently supported. Please use JSON format.',
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
    let parsedMaxWidth: number | undefined;
    let parsedMaxHeight: number | undefined;

    if (maxwidth) {
      parsedMaxWidth = parseInt(maxwidth, 10);
      if (isNaN(parsedMaxWidth) || parsedMaxWidth < 1 || parsedMaxWidth > 2000) {
        return res.status(400).json({
          error: 'Invalid maxwidth',
          message: 'maxwidth must be a number between 1 and 2000',
        });
      }
    }

    if (maxheight) {
      parsedMaxHeight = parseInt(maxheight, 10);
      if (isNaN(parsedMaxHeight) || parsedMaxHeight < 1 || parsedMaxHeight > 2000) {
        return res.status(400).json({
          error: 'Invalid maxheight',
          message: 'maxheight must be a number between 1 and 2000',
        });
      }
    }

    // Generate oEmbed response
    const oembedData = await embedService.getOEmbed(trimmedUrl, {
      format: 'json',
      maxwidth: parsedMaxWidth,
      maxheight: parsedMaxHeight,
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Return oEmbed response
    res.json(oembedData);

  } catch (error) {
    console.error('oEmbed generation error:', error);

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

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while generating oEmbed. Please try again later.',
    });
  }
});

export default router;
