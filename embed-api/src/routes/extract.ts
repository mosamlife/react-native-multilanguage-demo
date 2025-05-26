import { Router, Request, Response } from 'express';
import { embedService } from '../services/embed-service';
import validator from 'validator';

const router = Router();

interface ExtractQuery {
  url: string;
}

router.get('/', async (req: Request<{}, any, any, ExtractQuery>, res: Response) => {
  try {
    const { url } = req.query;

    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter: url',
        message: 'Please provide a valid URL to extract metadata from',
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

    // Extract metadata
    const metadata = await embedService.extractMetadata(trimmedUrl);

    // Return successful response
    res.json({
      success: true,
      data: metadata,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Extract metadata error:', error);

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
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while extracting metadata. Please try again later.',
    });
  }
});

export default router;
