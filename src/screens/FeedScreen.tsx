import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { postStorage, Post } from '../services/postStorage';
import { PostItem } from '../components/PostItem';
import { CreatePostScreen } from './CreatePostScreen';

interface FeedScreenProps {
  // Add any props if needed
}

export const FeedScreen: React.FC<FeedScreenProps> = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Load posts from storage
  const loadPosts = useCallback(() => {
    try {
      const allPosts = postStorage.getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Refresh posts
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  // Handle post creation
  const handlePostCreated = useCallback(() => {
    setShowCreatePost(false);
    setEditingPost(null);
    loadPosts();
  }, [loadPosts]);

  // Handle post deletion
  const handleDeletePost = useCallback((postId: string) => {
    try {
      const success = postStorage.deletePost(postId);
      if (success) {
        loadPosts();
        Alert.alert('Success', 'Post deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    }
  }, [loadPosts]);

  // Handle post editing
  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
    setShowCreatePost(true);
  }, []);

  // Clear all posts
  const handleClearAllPosts = useCallback(() => {
    Alert.alert(
      'Clear All Posts',
      'Are you sure you want to delete all posts? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            try {
              postStorage.clearAllPosts();
              loadPosts();
              Alert.alert('Success', 'All posts cleared');
            } catch (error) {
              console.error('Error clearing posts:', error);
              Alert.alert('Error', 'Failed to clear posts');
            }
          },
        },
      ]
    );
  }, [loadPosts]);

  // Render post item
  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onDelete={handleDeletePost}
      onEdit={handleEditPost}
    />
  ), [handleDeletePost, handleEditPost]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first post with links, videos, and rich content!
      </Text>
      <TouchableOpacity
        style={styles.createFirstPostButton}
        onPress={() => setShowCreatePost(true)}
      >
        <Text style={styles.createFirstPostButtonText}>Create First Post</Text>
      </TouchableOpacity>
    </View>
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Feed</Text>
      <View style={styles.headerActions}>
        {posts.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAllPosts}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Text style={styles.createButtonText}>+ New Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show create post screen
  if (showCreatePost) {
    return (
      <CreatePostScreen
        onPostCreated={handlePostCreated}
        onCancel={() => {
          setShowCreatePost(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1da1f2']}
            tintColor="#1da1f2"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.emptyListContainer : undefined}
      />

      {/* Stats Footer */}
      {posts.length > 0 && (
        <View style={styles.statsFooter}>
          <Text style={styles.statsText}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} • {' '}
            {posts.filter(p => p.embedMetadata).length} with embeds
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14171a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f7f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#657786',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#1da1f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createFirstPostButton: {
    backgroundColor: '#1da1f2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  createFirstPostButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    backgroundColor: '#f7f9fa',
  },
  statsText: {
    fontSize: 12,
    color: '#657786',
    textAlign: 'center',
  },
});
