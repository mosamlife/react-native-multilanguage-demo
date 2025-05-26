import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { embedApiService, EmbedMetadata } from '../services/embedApi';
import { postStorage } from '../services/postStorage';
import { LinkPreview } from '../components/LinkPreview';

interface CreatePostScreenProps {
  onPostCreated?: () => void;
  onCancel?: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({
  onPostCreated,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState<EmbedMetadata | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  
  const urlTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<TextInput>(null);

  // Auto-detect URLs in text and generate preview
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex);
    const detectedUrl = matches?.[0];

    if (detectedUrl && detectedUrl !== url) {
      setUrl(detectedUrl);
    } else if (!detectedUrl && url) {
      // Clear URL if no longer in text
      setUrl('');
      setMetadata(null);
      setPreviewError(null);
    }
  }, [text, url]);

  // Generate preview when URL changes
  useEffect(() => {
    if (urlTimeoutRef.current) {
      clearTimeout(urlTimeoutRef.current);
    }

    if (url && embedApiService.isValidUrl(url)) {
      urlTimeoutRef.current = setTimeout(() => {
        generatePreview(url);
      }, 500); // Debounce for 500ms
    } else {
      setMetadata(null);
      setPreviewError(null);
    }

    return () => {
      if (urlTimeoutRef.current) {
        clearTimeout(urlTimeoutRef.current);
      }
    };
  }, [url]);

  const generatePreview = async (urlToPreview: string) => {
    try {
      setLoadingPreview(true);
      setPreviewError(null);
      
      const extractedMetadata = await embedApiService.extractMetadata(urlToPreview);
      setMetadata(extractedMetadata);
    } catch (error) {
      console.error('Preview generation error:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to generate preview');
      setMetadata(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text for your post');
      return;
    }

    try {
      setPosting(true);

      const newPost = postStorage.savePost({
        text: text.trim(),
        url: url || undefined,
        embedMetadata: metadata || undefined,
      });

      Alert.alert(
        'Success',
        'Your post has been created!',
        [
          {
            text: 'OK',
            onPress: () => {
              setText('');
              setUrl('');
              setMetadata(null);
              setPreviewError(null);
              onPostCreated?.();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleCancel = () => {
    if (text.trim() || url) {
      Alert.alert(
        'Discard Post',
        'Are you sure you want to discard this post?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setText('');
              setUrl('');
              setMetadata(null);
              setPreviewError(null);
              onCancel?.();
            },
          },
        ]
      );
    } else {
      onCancel?.();
    }
  };

  const removePreview = () => {
    setMetadata(null);
    setPreviewError(null);
    setUrl('');
    
    // Remove URL from text
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const newText = text.replace(urlRegex, '').trim();
    setText(newText);
  };

  const canPost = text.trim().length > 0 && !posting;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Create Post</Text>
          
          <TouchableOpacity
            onPress={handlePost}
            style={[
              styles.headerButton,
              styles.postButton,
              !canPost && styles.postButtonDisabled,
            ]}
            disabled={!canPost}
          >
            <Text style={[
              styles.postButtonText,
              !canPost && styles.postButtonTextDisabled,
            ]}>
              {posting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Text Input */}
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="What's happening?"
            placeholderTextColor="#657786"
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            autoFocus
            maxLength={280}
          />

          {/* Character Count */}
          <View style={styles.characterCount}>
            <Text style={[
              styles.characterCountText,
              text.length > 250 && styles.characterCountWarning,
              text.length > 280 && styles.characterCountError,
            ]}>
              {text.length}/280
            </Text>
          </View>

          {/* URL Input (optional manual entry) */}
          <View style={styles.urlSection}>
            <Text style={styles.urlLabel}>Add Link (optional):</Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://example.com"
              placeholderTextColor="#657786"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          {/* Link Preview */}
          {(loadingPreview || metadata || previewError) && (
            <LinkPreview
              metadata={metadata}
              loading={loadingPreview}
              error={previewError || undefined}
              onRemove={removePreview}
              style={styles.preview}
            />
          )}

          {/* Tips */}
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>💡 Tips:</Text>
            <Text style={styles.tipText}>• Paste any URL to automatically generate a preview</Text>
            <Text style={styles.tipText}>• Supports YouTube, Instagram, Twitter, and more</Text>
            <Text style={styles.tipText}>• Videos will be playable in your feed</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoid: {
    flex: 1,
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
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171a',
  },
  cancelText: {
    fontSize: 16,
    color: '#657786',
  },
  postButton: {
    backgroundColor: '#1da1f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#aab8c2',
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 24,
    color: '#14171a',
    marginTop: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#657786',
  },
  characterCountWarning: {
    color: '#ff8c00',
  },
  characterCountError: {
    color: '#e0245e',
  },
  urlSection: {
    marginTop: 20,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#14171a',
    backgroundColor: '#f7f9fa',
  },
  preview: {
    marginTop: 16,
  },
  tips: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#f7f9fa',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#657786',
    lineHeight: 18,
    marginBottom: 4,
  },
});
