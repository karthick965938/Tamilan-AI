import React, { useState, useRef, useCallback } from 'react';
import { UploadedImage } from '../../types';
import './ImageUploader.css';

interface ImageUploaderProps {
  onUpload: (images: UploadedImage[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  supportedFormats?: string[];
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

interface ValidationError {
  file: string;
  message: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFiles = 2,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  multiple = false,
  disabled = false,
  className = '',
  placeholder = 'Drop images here or click to upload'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file type, size, and format
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Supported types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      return `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds maximum size of ${maxSizeMB}MB`;
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      return `File format .${fileExtension} is not supported. Supported formats: ${supportedFormats.join(', ')}`;
    }

    return null;
  }, [acceptedTypes, maxFileSize, supportedFormats]);

  // Process uploaded files
  const processFiles = useCallback(async (files: FileList | File[]) => {
    setIsProcessing(true);
    setValidationErrors([]);

    const fileArray = Array.from(files);
    const errors: ValidationError[] = [];
    const validFiles: File[] = [];

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push({ file: file.name, message: error });
      } else {
        validFiles.push(file);
      }
    });

    // Check total file count
    const totalFiles = uploadedImages.length + validFiles.length;
    if (totalFiles > maxFiles) {
      errors.push({
        file: 'Multiple files',
        message: `Cannot upload more than ${maxFiles} files. Currently have ${uploadedImages.length} files.`
      });
      setValidationErrors(errors);
      setIsProcessing(false);
      return;
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsProcessing(false);
      return;
    }

    try {
      // Create UploadedImage objects with original quality previews
      const newImages: UploadedImage[] = validFiles.map((file, index) => {
        // Use URL.createObjectURL for high-quality preview
        const preview = URL.createObjectURL(file);

        return {
          id: `${Date.now()}-${index}`,
          file,
          preview,
          type: uploadedImages.length === 0 ? 'primary' : 'reference',
          name: file.name,
          size: file.size,
          uploadedAt: new Date()
        };
      });

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      onUpload(updatedImages);
    } catch (error) {
      setValidationErrors([{
        file: 'Processing',
        message: 'Failed to process images. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, validateFile, onUpload, maxFiles]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  // Handle click to open file browser
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Remove uploaded image
  const removeImage = useCallback((imageId: string) => {
    const imageToRemove = uploadedImages.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    const updatedImages = uploadedImages.filter(img => img.id !== imageId);
    setUploadedImages(updatedImages);
    onUpload(updatedImages);
  }, [uploadedImages, onUpload]);

  // Clear all images
  const clearAll = useCallback(() => {
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setValidationErrors([]);
    onUpload([]);
  }, [uploadedImages, onUpload]);

  return (
    <div className={`image-uploader ${className}`}>
      {/* Upload Area */}
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''} ${uploadedImages.length > 0 ? 'has-images' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload images"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />

        {isProcessing ? (
          <div className="upload-processing">
            <div className="spinner"></div>
            <p>Processing images...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3>
              {isDragOver ? 'Drop images here' : placeholder}
            </h3>
            <p>or click to browse files</p>
            <div className="upload-info">
              <p>Supported formats: {supportedFormats.join(', ')}</p>
              <p>Max file size: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB</p>
              <p>Max files: {maxFiles}</p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Upload Errors:</h4>
          {validationErrors.map((error, index) => (
            <div key={index} className="error-item">
              <strong>{error.file}:</strong> {error.message}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="uploaded-images">
          <div className="images-header">
            <h4>Uploaded Images ({uploadedImages.length}/{maxFiles})</h4>
            <button
              onClick={clearAll}
              className="clear-all-btn"
              type="button"
            >
              Clear All
            </button>
          </div>

          <div className="images-grid">
            {uploadedImages.map((image) => (
              <div key={image.id} className="image-item">
                <div className="image-preview">
                  <img src={image.preview} alt={image.name} />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="remove-btn"
                    type="button"
                    aria-label={`Remove ${image.name}`}
                  >
                    ×
                  </button>
                </div>
                <div className="image-info">
                  <p className="image-name" title={image.name}>{image.name}</p>
                  <p className="image-size">{(image.size / 1024).toFixed(1)} KB</p>
                  <span className={`image-type ${image.type}`}>{image.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};