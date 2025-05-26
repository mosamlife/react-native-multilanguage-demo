import { MMKV } from 'react-native-mmkv';
import { EmbedMetadata } from './embedApi';

export interface Post {
  id: string;
  text: string;
  url?: string;
  embedMetadata?: EmbedMetadata;
  createdAt: string;
  updatedAt: string;
}

class PostStorageService {
  private storage = new MMKV();
  private readonly POSTS_KEY = 'posts';
  private readonly POST_PREFIX = 'post_';

  // Get all posts
  getAllPosts(): Post[] {
    try {
      const postsJson = this.storage.getString(this.POSTS_KEY);
      if (!postsJson) return [];
      
      const postIds: string[] = JSON.parse(postsJson);
      const posts: Post[] = [];

      for (const id of postIds) {
        const postJson = this.storage.getString(`${this.POST_PREFIX}${id}`);
        if (postJson) {
          posts.push(JSON.parse(postJson));
        }
      }

      // Sort by creation date (newest first)
      return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting all posts:', error);
      return [];
    }
  }

  // Get a specific post by ID
  getPost(id: string): Post | null {
    try {
      const postJson = this.storage.getString(`${this.POST_PREFIX}${id}`);
      return postJson ? JSON.parse(postJson) : null;
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  }

  // Save a new post
  savePost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
    try {
      const id = this.generateId();
      const now = new Date().toISOString();
      
      const newPost: Post = {
        ...post,
        id,
        createdAt: now,
        updatedAt: now,
      };

      // Save the post
      this.storage.set(`${this.POST_PREFIX}${id}`, JSON.stringify(newPost));

      // Update the posts index
      const existingPosts = this.getPostIds();
      existingPosts.unshift(id); // Add to beginning for newest first
      this.storage.set(this.POSTS_KEY, JSON.stringify(existingPosts));

      return newPost;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  // Update an existing post
  updatePost(id: string, updates: Partial<Omit<Post, 'id' | 'createdAt'>>): Post | null {
    try {
      const existingPost = this.getPost(id);
      if (!existingPost) return null;

      const updatedPost: Post = {
        ...existingPost,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.storage.set(`${this.POST_PREFIX}${id}`, JSON.stringify(updatedPost));
      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
    }
  }

  // Delete a post
  deletePost(id: string): boolean {
    try {
      // Remove the post data
      this.storage.delete(`${this.POST_PREFIX}${id}`);

      // Update the posts index
      const existingPosts = this.getPostIds();
      const filteredPosts = existingPosts.filter(postId => postId !== id);
      this.storage.set(this.POSTS_KEY, JSON.stringify(filteredPosts));

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  // Clear all posts
  clearAllPosts(): void {
    try {
      const postIds = this.getPostIds();
      
      // Delete all individual posts
      for (const id of postIds) {
        this.storage.delete(`${this.POST_PREFIX}${id}`);
      }

      // Clear the index
      this.storage.delete(this.POSTS_KEY);
    } catch (error) {
      console.error('Error clearing all posts:', error);
    }
  }

  // Get posts count
  getPostsCount(): number {
    return this.getPostIds().length;
  }

  // Search posts by text content
  searchPosts(query: string): Post[] {
    const allPosts = this.getAllPosts();
    const lowercaseQuery = query.toLowerCase();

    return allPosts.filter(post => 
      post.text.toLowerCase().includes(lowercaseQuery) ||
      post.embedMetadata?.title?.toLowerCase().includes(lowercaseQuery) ||
      post.embedMetadata?.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get posts with embeds only
  getPostsWithEmbeds(): Post[] {
    return this.getAllPosts().filter(post => post.embedMetadata);
  }

  // Get posts by platform
  getPostsByPlatform(platform: string): Post[] {
    return this.getAllPosts().filter(post => 
      post.embedMetadata?.platform === platform
    );
  }

  // Private helper methods
  private getPostIds(): string[] {
    try {
      const postsJson = this.storage.getString(this.POSTS_KEY);
      return postsJson ? JSON.parse(postsJson) : [];
    } catch {
      return [];
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export/Import functionality for backup
  exportPosts(): string {
    const posts = this.getAllPosts();
    return JSON.stringify(posts, null, 2);
  }

  importPosts(jsonData: string): boolean {
    try {
      const posts: Post[] = JSON.parse(jsonData);
      
      // Validate the data structure
      if (!Array.isArray(posts)) {
        throw new Error('Invalid data format');
      }

      // Clear existing posts
      this.clearAllPosts();

      // Import new posts
      for (const post of posts) {
        if (this.isValidPost(post)) {
          this.storage.set(`${this.POST_PREFIX}${post.id}`, JSON.stringify(post));
        }
      }

      // Update the index
      const postIds = posts.map(post => post.id);
      this.storage.set(this.POSTS_KEY, JSON.stringify(postIds));

      return true;
    } catch (error) {
      console.error('Error importing posts:', error);
      return false;
    }
  }

  private isValidPost(post: any): post is Post {
    return (
      typeof post === 'object' &&
      typeof post.id === 'string' &&
      typeof post.text === 'string' &&
      typeof post.createdAt === 'string' &&
      typeof post.updatedAt === 'string'
    );
  }
}

export const postStorage = new PostStorageService();
