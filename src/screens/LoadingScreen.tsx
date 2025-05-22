import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text as RNText } from 'react-native';

interface LoadingScreenProps {
  error?: Error | null;
}

/**
 * Loading screen shown while fonts are being loaded
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ error }) => {
  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <RNText style={styles.errorText}>Error loading fonts:</RNText>
          <RNText style={styles.errorMessage}>{error.message}</RNText>
        </View>
      ) : (
        <>
          <ActivityIndicator size="large" color="#007AFF" />
          <RNText style={styles.loadingText}>Loading fonts...</RNText>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffeeee',
    borderRadius: 8,
    maxWidth: '80%',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
  },
});

export default LoadingScreen;
