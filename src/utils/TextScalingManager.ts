import { Platform, PixelRatio, Dimensions } from 'react-native';

/**
 * TextScalingManager
 * 
 * This utility handles device text scaling settings and provides information
 * about the current scaling environment.
 * 
 * Instead of disabling font scaling completely when the user maxes out their
 * device settings, we cap the scaling at a configurable maximum value.
 */
class TextScalingManager {
  // Recommended max scale constraints by platform
  static readonly RECOMMENDED_MAX_SCALE = {
    h1: 1.2,  // 20% max increase for h1
    h2: 1.3,  // 30% max increase for h2
    h3: 1.4,  // 40% max increase for h3
    body: 1.6, // 60% max increase for body text
    caption: 1.8, // 80% max increase for captions
  };

  // Maximum allowed scale factor (configurable)
  static MAX_ALLOWED_SCALE = Platform.OS === 'ios' ? 1.2 : 1.8; 

  // Cache the device scale to avoid recalculating it frequently
  private static _deviceScale: number | null = null;
  private static _isLargeScale: boolean | null = null;
  private static _normalizedScale: number | null = null;

  /**
   * Get the raw device font scale factor
   */
  static getDeviceScale(): number {
    if (this._deviceScale === null) {
      this._deviceScale = PixelRatio.getFontScale();
    }
    return this._deviceScale;
  }

  /**
   * Check if the device is using a large font scale (>1.0)
   */
  static isLargeScale(): boolean {
    if (this._isLargeScale === null) {
      this._isLargeScale = this.getDeviceScale() > 1.0;
    }
    return this._isLargeScale;
  }

  /**
   * Get a normalized scale factor that caps at MAX_ALLOWED_SCALE
   * This ensures we respect the user's preference up to a reasonable maximum
   */
  static getNormalizedScale(): number {
    if (this._normalizedScale === null) {
      const deviceScale = this.getDeviceScale();
      this._normalizedScale = Math.min(deviceScale, this.MAX_ALLOWED_SCALE);
    }
    return this._normalizedScale;
  }

  /**
   * Reset cached values (call this when the app resumes from background)
   */
  static resetCache(): void {
    this._deviceScale = null;
    this._isLargeScale = null;
    this._normalizedScale = null;
  }

  /**
   * Scale a font size based on the normalized device scale factor
   * This is useful for elements that don't use the Text component
   * like icons or custom components
   * 
   * @param fontSize The base font size to scale
   * @returns The scaled font size
   */
  static scaleFont(fontSize: number): number {
    return fontSize * this.getNormalizedScale();
  }

  /**
   * Configure the maximum allowed scale factor
   * This can be called to adjust the scaling behavior at runtime
   * 
   * @param maxScale The maximum scale factor to allow
   */
  static setMaxAllowedScale(maxScale: number): void {
    this.MAX_ALLOWED_SCALE = maxScale;
    this._normalizedScale = null; // Reset cache to recalculate with new max
  }

  /**
   * Get detailed information about the current scaling
   * Useful for debugging and the demo screen
   */
  static getScalingInfo(): {
    deviceScale: number;
    normalizedScale: number;
    platform: string;
    recommendedMaxScales: typeof TextScalingManager.RECOMMENDED_MAX_SCALE;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
    isLargeScale: boolean;
    maxAllowedScale: number;
  } {
    const { width, height } = Dimensions.get('window');
    return {
      deviceScale: this.getDeviceScale(),
      normalizedScale: this.getNormalizedScale(),
      platform: Platform.OS,
      recommendedMaxScales: this.RECOMMENDED_MAX_SCALE,
      screenWidth: width,
      screenHeight: height,
      pixelRatio: PixelRatio.get(),
      isLargeScale: this.isLargeScale(),
      maxAllowedScale: this.MAX_ALLOWED_SCALE,
    };
  }
}

export default TextScalingManager;
