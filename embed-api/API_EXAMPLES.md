# Embed API Testing Examples

## Base URL
```
http://localhost:3001
```

## 1. Health Check
```bash
curl http://localhost:3001/health
```

## 2. API Documentation
```bash
curl http://localhost:3001/
```

## 3. Extract Metadata from YouTube Video
```bash
curl "http://localhost:3001/api/extract?url=https%3A//www.youtube.com/watch%3Fv%3DdQw4w9WgXcQ"
```

## 4. Extract Metadata from Generic Website
```bash
curl "http://localhost:3001/api/extract?url=https%3A//github.com"
```

## 5. Generate oEmbed for YouTube Video
```bash
curl "http://localhost:3001/api/oembed?url=https%3A//www.youtube.com/watch%3Fv%3DdQw4w9WgXcQ&format=json&maxwidth=500"
```

## 6. Render HTML Embed for YouTube Video
```bash
curl "http://localhost:3001/api/render?url=https%3A//www.youtube.com/watch%3Fv%3DdQw4w9WgXcQ&width=560&height=315"
```

## 7. Test with Different Platforms

### Instagram Post
```bash
curl "http://localhost:3001/api/extract?url=https%3A//www.instagram.com/p/ABC123/"
```

### Twitter/X Post
```bash
curl "http://localhost:3001/api/extract?url=https%3A//twitter.com/user/status/123456789"
```

### Generic Website with OpenGraph
```bash
curl "http://localhost:3001/api/extract?url=https%3A//www.example.com"
```

## 8. Test Error Handling

### Invalid URL
```bash
curl "http://localhost:3001/api/extract?url=invalid-url"
```

### Missing URL Parameter
```bash
curl "http://localhost:3001/api/extract"
```

## 9. Test with Custom Dimensions
```bash
curl "http://localhost:3001/api/render?url=https%3A//www.youtube.com/watch%3Fv%3DdQw4w9WgXcQ&width=800&height=450&autoplay=false&controls=true"
```

## 10. Browser Testing URLs

You can test these URLs directly in your browser:

- **API Docs**: http://localhost:3001/
- **Health Check**: http://localhost:3001/health
- **YouTube Extract**: http://localhost:3001/api/extract?url=https%3A//www.youtube.com/watch%3Fv%3DdQw4w9WgXcQ
- **YouTube Render**: http://localhost:3001/api/render?url=https%3A//www.youtube.com/watch%3Fv%3DdQw4w9WgXcQ

## Expected Response Formats

### Extract API Response
```json
{
  "success": true,
  "data": {
    "title": "Video Title",
    "description": "Video description",
    "image": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "type": "video",
    "platform": "youtube",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "width": 560,
    "height": 315,
    "author": {
      "name": "Channel Name",
      "url": "https://www.youtube.com/channel/..."
    },
    "provider": {
      "name": "YouTube",
      "url": "https://youtube.com"
    },
    "embedData": {
      "videoId": "dQw4w9WgXcQ",
      "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  },
  "timestamp": "2025-05-26T06:54:39.123Z"
}
```

### oEmbed API Response
```json
{
  "type": "video",
  "version": "1.0",
  "html": "<div class=\"youtube-embed\">...</div>",
  "width": 560,
  "height": 315,
  "title": "Video Title",
  "author_name": "Channel Name",
  "author_url": "https://www.youtube.com/channel/...",
  "provider_name": "YouTube",
  "provider_url": "https://youtube.com",
  "cache_age": 3600,
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
}
```

### Render API Response
Returns HTML content that can be embedded directly in web pages or React Native WebView components.

## Testing Notes

1. The server should be running on port 3001
2. All URLs in query parameters should be URL-encoded
3. The render endpoint returns HTML content with appropriate headers
4. Error responses include helpful error messages and status codes
5. Rate limiting is applied (100 requests per 15 minutes by default)
