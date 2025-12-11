import { useCallback } from 'react';
import { useAppState } from './useAppState';
import { UploadedImage } from '../types';
import { ProcessingState } from '../types/enums';

/**
 * Custom hook for handling image upload operations
 */
export const useImageUpload = () => {
  const { state, addUploadedImage, removeUploadedImage, clearUploadedImages, setError, setProcessingState } = useAppState();

  /**
   * Process and add uploaded file
   */
  const handleFileUpload = useCallback(async (
    file: File, 
    type: 'primary' | 'reference' = 'primary'
  ): Promise<void> => {
    try {
      setProcessingState(ProcessingState.UPLOADING);
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      // Create uploaded image object
      const uploadedImage: UploadedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        type,
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      };
      
      addUploadedImage(uploadedImage);
      setProcessingState(ProcessingState.IDLE);
    } catch (error) {
      setError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProcessingState(ProcessingState.FAILED);
    }
  }, [addUploadedImage, setError, setProcessingState]);

  /**
   * Handle multiple file uploads
   */
  const handleMultipleFileUpload = useCallback(async (
    files: FileList | File[],
    type: 'primary' | 'reference' = 'primary'
  ): Promise<void> => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      await handleFileUpload(file, type);
    }
  }, [handleFileUpload]);

  /**
   * Remove uploaded image and cleanup preview URL
   */
  const handleRemoveImage = useCallback((imageId: string) => {
    const image = state.uploadedImages.find(img => img.id === imageId);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    removeUploadedImage(imageId);
  }, [state.uploadedImages, removeUploadedImage]);

  /**
   * Clear all uploaded images and cleanup preview URLs
   */
  const handleClearImages = useCallback(() => {
    // Cleanup all preview URLs
    state.uploadedImages.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
    clearUploadedImages();
  }, [state.uploadedImages, clearUploadedImages]);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((
    file: File,
    maxSize: number = 10 * 1024 * 1024, // 10MB default
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
  ): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        valid: false,
        error: `File size too large. Maximum size: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }, []);

  return {
    // State
    uploadedImages: state.uploadedImages,
    isUploading: state.processingState === ProcessingState.UPLOADING,
    
    // Actions
    handleFileUpload,
    handleMultipleFileUpload,
    handleRemoveImage,
    handleClearImages,
    validateFile
  };
};