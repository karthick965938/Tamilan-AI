/**
 * Image Processing Service
 * Handles image validation, resizing, compression, and format conversion
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maintainAspectRatio?: boolean;
  outputFormat?: string;
}

export interface CompressionOptions {
  quality?: number;
  maxSizeKB?: number;
  outputFormat?: string;
}

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  cropToFit?: boolean;
}

export class ImageProcessingService {
  private static readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly MIN_DIMENSIONS = { width: 50, height: 50 };
  private static readonly MAX_DIMENSIONS = { width: 8192, height: 8192 };

  /**
   * Validate image file for type, size, and format
   */
  static async validateImage(file: File): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, warnings: [] };

    try {
      // Check file type
      if (!this.SUPPORTED_FORMATS.includes(file.type)) {
        return {
          isValid: false,
          error: `Unsupported file type: ${file.type}. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`
        };
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
      }

      // Check if file is actually an image by loading it
      const dimensions = await this.getImageDimensions(file);
      
      // Check minimum dimensions
      if (dimensions.width < this.MIN_DIMENSIONS.width || dimensions.height < this.MIN_DIMENSIONS.height) {
        return {
          isValid: false,
          error: `Image dimensions ${dimensions.width}x${dimensions.height} are too small. Minimum: ${this.MIN_DIMENSIONS.width}x${this.MIN_DIMENSIONS.height}`
        };
      }

      // Check maximum dimensions
      if (dimensions.width > this.MAX_DIMENSIONS.width || dimensions.height > this.MAX_DIMENSIONS.height) {
        return {
          isValid: false,
          error: `Image dimensions ${dimensions.width}x${dimensions.height} are too large. Maximum: ${this.MAX_DIMENSIONS.width}x${this.MAX_DIMENSIONS.height}`
        };
      }

      // Add warnings for large files
      if (file.size > 5 * 1024 * 1024) { // 5MB
        result.warnings?.push('Large file size may affect processing speed');
      }

      // Add warnings for very high resolution
      if (dimensions.width > 4096 || dimensions.height > 4096) {
        result.warnings?.push('High resolution image may be automatically resized for processing');
      }

      return result;
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get image dimensions without loading the full image
   */
  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Resize image while maintaining aspect ratio
   */
  static async resizeImage(file: File, options: ResizeOptions = {}): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.9,
      maintainAspectRatio = true,
      outputFormat = file.type
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        let { width, height } = img;
        
        if (maintainAspectRatio) {
          // Calculate new dimensions maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = Math.min(width, maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, maxHeight);
              width = height * aspectRatio;
            }
          }
        } else {
          width = Math.min(width, maxWidth);
          height = Math.min(height, maxHeight);
        }

        canvas.width = width;
        canvas.height = height;

        // Use high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: outputFormat,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to create resized image blob'));
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for resizing'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress image to reduce file size
   */
  static async compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    const {
      quality = 0.8,
      maxSizeKB = 1024,
      outputFormat = 'image/jpeg'
    } = options;

    let currentQuality = quality;
    let compressedFile = file;

    // If file is already small enough, return as is
    if (file.size <= maxSizeKB * 1024) {
      return file;
    }

    // Iteratively compress until target size is reached
    for (let attempts = 0; attempts < 5; attempts++) {
      compressedFile = await this.resizeImage(compressedFile, {
        quality: currentQuality,
        outputFormat
      });

      if (compressedFile.size <= maxSizeKB * 1024) {
        break;
      }

      // Reduce quality for next attempt
      currentQuality *= 0.8;
      
      // Don't go below 0.1 quality
      if (currentQuality < 0.1) {
        break;
      }
    }

    return compressedFile;
  }

  /**
   * Convert image file to base64 string
   */
  static async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to convert file to base64'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get base64 data without the data URL prefix
   */
  static async getBase64Data(file: File): Promise<string> {
    const base64 = await this.convertToBase64(file);
    return base64.split(',')[1]; // Remove "data:image/...;base64," prefix
  }

  /**
   * Create thumbnail from image file
   */
  static async createThumbnail(file: File, options: ThumbnailOptions = {}): Promise<string> {
    const {
      width = 150,
      height = 150,
      quality = 0.8,
      cropToFit = true
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (cropToFit) {
          // Calculate crop dimensions to maintain aspect ratio
          const sourceAspect = img.width / img.height;
          const targetAspect = width / height;

          if (sourceAspect > targetAspect) {
            // Source is wider, crop width
            sourceWidth = img.height * targetAspect;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            // Source is taller, crop height
            sourceHeight = img.width / targetAspect;
            sourceY = (img.height - sourceHeight) / 2;
          }
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, width, height
        );

        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnailDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate file format by checking file extension
   */
  static validateFileFormat(filename: string, supportedFormats: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? supportedFormats.includes(extension) : false;
  }

  /**
   * Get file format from MIME type
   */
  static getFormatFromMimeType(mimeType: string): string {
    const formatMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    
    return formatMap[mimeType] || 'unknown';
  }

  /**
   * Check if image is portrait orientation
   */
  static async isPortrait(file: File): Promise<boolean> {
    const dimensions = await this.getImageDimensions(file);
    return dimensions.height > dimensions.width;
  }

  /**
   * Check if image is landscape orientation
   */
  static async isLandscape(file: File): Promise<boolean> {
    const dimensions = await this.getImageDimensions(file);
    return dimensions.width > dimensions.height;
  }

  /**
   * Check if image is square
   */
  static async isSquare(file: File): Promise<boolean> {
    const dimensions = await this.getImageDimensions(file);
    return Math.abs(dimensions.width - dimensions.height) < 10; // Allow small tolerance
  }

  /**
   * Batch process multiple images
   */
  static async batchProcess(
    files: File[],
    processor: (file: File) => Promise<File>
  ): Promise<File[]> {
    const results: File[] = [];
    
    for (const file of files) {
      try {
        const processed = await processor(file);
        results.push(processed);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        // Include original file if processing fails
        results.push(file);
      }
    }
    
    return results;
  }

  /**
   * Clean up object URLs to prevent memory leaks
   */
  static cleanupObjectUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}