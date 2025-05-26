# Post Embed Functionality

This React Native app now includes comprehensive post embed functionality inspired by Bluesky's approach. Users can create posts with rich media embeds including videos, images, and links.

## Features

### 🎯 Core Functionality
- **Auto URL Detection**: Automatically detects URLs in post text and generates previews
- **Rich Media Embeds**: Supports YouTube, Instagram, Twitter, and other platforms
- **Video Playback**: Videos are playable directly within the app using WebView
- **Link Previews**: Beautiful preview cards with images, titles, and descriptions
- **Post Management**: Create, view, edit, and delete posts with MMKV storage

### 🛠 Technical Implementation

#### Backend API Server (`embed-api/`)
- **Express.js server** running on port 3001
- **Metadata extraction** from URLs using various parsers
- **oEmbed support** for standardized embed data
- **HTML rendering** for WebView consumption
- **YouTube integration** with video ID extraction
- **Generic parser** for Open Graph and Twitter Card metadata

#### React Native Components

1. **Services Layer**
   - `embedApiService`: Communicates with the backend API
   - `postStorage`: MMKV-based storage for posts

2. **UI Components**
   - `LinkPreview`: Displays metadata previews with thumbnails
   - `EmbedWebView`: Renders full embeds using WebView
   - `PostItem`: Individual post display with embed functionality
   - `CreatePostScreen`: Post creation with URL detection
   - `FeedScreen`: Main feed displaying all posts

### 📱 User Experience

#### Creating Posts
1. Open the app to see the Feed screen
2. Tap "New Post" to create a post
3. Type your message - URLs are automatically detected
4. See live preview of embedded content
5. Post to save to your feed

#### Viewing Posts
1. Posts display in chronological order (newest first)
2. Link previews show automatically for embedded content
3. Tap video previews to play full embedded videos
4. Tap regular links to open in browser
5. Long press posts for edit/delete options

#### Embed Types Supported
- **Videos**: YouTube, Vimeo (playable in-app)
- **Social Media**: Twitter, Instagram posts
- **Images**: Direct image links with previews
- **Articles**: Blog posts and news articles with Open Graph data
- **Generic Links**: Any URL with basic metadata

### 🚀 Setup Instructions

#### 1. Start the Embed API Server
```bash
cd embed-api
npm install
npm start
```
The server will run on `http://localhost:3001`

#### 2. Install React Native Dependencies
```bash
# Main app dependencies (already installed)
npm install react-native-webview @react-native-async-storage/async-storage
```

#### 3. Run the React Native App
```bash
# For iOS
npm run ios

# For Android  
npm run android

# For Web
npm run web
```

### 🔧 API Endpoints

The embed API provides three main endpoints:

#### Extract Metadata
```
GET /api/extract?url=<encoded_url>
```
Returns structured metadata for any URL.

#### oEmbed Support
```
GET /api/oembed?url=<encoded_url>&format=json
```
Returns oEmbed-compliant data for supported platforms.

#### Render HTML
```
GET /api/render?url=<encoded_url>&width=400&height=300
```
Returns HTML suitable for WebView rendering.

### 📊 Storage Structure

Posts are stored using MMKV with the following structure:

```typescript
interface Post {
  id: string;
  text: string;
  url?: string;
  embedMetadata?: EmbedMetadata;
  createdAt: string;
  updatedAt: string;
}

interface EmbedMetadata {
  title: string;
  description?: string;
  image?: string;
  type: 'video' | 'photo' | 'link' | 'rich';
  platform: string;
  url: string;
  width?: number;
  height?: number;
  author?: { name: string; url?: string };
  provider?: { name: string; url: string };
  embedData?: { videoId?: string; embedUrl?: string };
}
```

### 🎨 UI/UX Features

#### Link Previews
- Thumbnail images with play buttons for videos
- Platform indicators (YouTube, Twitter, etc.)
- Title, description, and author information
- Remove button to delete previews
- Loading and error states

#### Video Embeds
- Responsive aspect ratio handling
- Full-screen video support
- Play/pause controls
- Auto-height adjustment based on content

#### Post Management
- Character count with warnings (280 limit)
- Auto-save drafts
- Edit existing posts
- Bulk delete options
- Search and filter capabilities

### 🔄 React Native Web Compatibility

The app is fully compatible with React Native Web:
- WebView components work seamlessly
- All embed functionality available on web
- Responsive design adapts to different screen sizes
- Touch interactions work with mouse/keyboard

### 🛡 Error Handling

Comprehensive error handling includes:
- Network connectivity issues
- Invalid URLs
- Unsupported embed types
- WebView loading failures
- API server downtime
- Graceful fallbacks to basic link display

### 🚀 Performance Optimizations

- **Debounced URL detection** (500ms delay)
- **Lazy loading** of embed content
- **Image caching** for thumbnails
- **MMKV storage** for fast local data access
- **Efficient re-rendering** with React.memo and useCallback

### 🔮 Future Enhancements

Potential improvements:
- **Offline support** with cached embeds
- **Push notifications** for new posts
- **Social sharing** capabilities
- **Advanced search** and filtering
- **Custom embed templates**
- **Analytics and usage tracking**

## Testing the Functionality

1. **Start the embed API server** in the `embed-api` directory
2. **Run the React Native app**
3. **Create a test post** with a YouTube URL like: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. **Watch the preview generate** automatically
5. **Tap the preview** to play the video in-app
6. **Try other URLs** like Twitter posts, Instagram links, or news articles

The implementation provides a solid foundation for rich media posting similar to modern social media platforms, with the flexibility to extend and customize based on specific requirements.
