import React, { useState, useCallback } from 'react';
import { GenerationResult } from '../../types';
import './GridDisplay.css';

interface GridDisplayProps {
  result: GenerationResult;
  onDownload?: (imageUrl: string, filename?: string) => void;
  onSave?: (imageUrl: string) => void;
  onImageSelect?: (imageUrl: string, index: number) => void;
  gridSize?: '3x3' | '2x2' | '4x2';
  showMetadata?: boolean;
  className?: string;
}

const GridDisplay: React.FC<GridDisplayProps> = ({
  result,
  onDownload,
  onSave,
  onImageSelect,
  gridSize = '3x3',
  showMetadata = true,
  className = ''
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((index: number) => {
    setErrorImages(prev => new Set([...prev, index]));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleImageClick = useCallback((imageUrl: string, index: number) => {
    setSelectedImageIndex(index);
    setPreviewImage(imageUrl);
    onImageSelect?.(imageUrl, index);
  }, [onImageSelect]);

  const handleDownload = useCallback(async (imageUrl: string, index: number) => {
    if (!onDownload) return;

    try {
      let blob: Blob;
      let filename: string;

      // Check if it's a data URL
      if (imageUrl.startsWith('data:')) {
        // Convert data URL directly to blob without fetch
        const base64Data = imageUrl.split(',')[1];
        const mimeType = imageUrl.split(';')[0].split(':')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
        filename = `generated-image-${index + 1}-${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
      } else {
        // Regular URL - fetch normally
        const response = await fetch(imageUrl);
        blob = await response.blob();
        filename = `generated-image-${index + 1}-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
      }

      const url = window.URL.createObjectURL(blob);
      onDownload(url, filename);

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, [onDownload]);

  // Handle both imageUrl (single) and imageUrls (array) formats
  const images = result.imageUrls || (result.imageUrl ? [result.imageUrl] : []);

  const handleDownloadAll = useCallback(async () => {
    if (!images || images.length === 0 || !onDownload) return;

    for (let i = 0; i < images.length; i++) {
      await handleDownload(images[i], i);
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [images, onDownload, handleDownload]);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
    setSelectedImageIndex(null);
  }, []);

  const navigatePreview = useCallback((direction: 'prev' | 'next') => {
    if (!images || images.length === 0 || selectedImageIndex === null) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1;
    } else {
      newIndex = selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0;
    }

    setSelectedImageIndex(newIndex);
    setPreviewImage(images[newIndex]);
    onImageSelect?.(images[newIndex], newIndex);
  }, [images, selectedImageIndex, onImageSelect]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (previewImage) {
      switch (event.key) {
        case 'Escape':
          closePreview();
          break;
        case 'ArrowLeft':
          navigatePreview('prev');
          break;
        case 'ArrowRight':
          navigatePreview('next');
          break;
      }
    }
  }, [previewImage, closePreview, navigatePreview]);

  if (!result.success || images.length === 0) {
    return (
      <div className={`grid-display error ${className}`}>
        <div className="error-message">
          <h3>Generation Failed</h3>
          <p>{result.error || 'No images were generated.'}</p>
        </div>
      </div>
    );
  }

  const getGridClass = () => {
    switch (gridSize) {
      case '2x2':
        return 'grid-2x2';
      case '4x2':
        return 'grid-4x2';
      case '3x3':
      default:
        return 'grid-3x3';
    }
  };

  return (
    <>
      <div className={`grid-display ${className}`}>
        <div className="grid-header">
          <h3>Generated Results ({images.length} image{images.length !== 1 ? 's' : ''})</h3>
          <div className="grid-actions">
            {onDownload && (
              <button
                className="download-all-button"
                onClick={handleDownloadAll}
                title="Download all images"
              >
                📥 Download All
              </button>
            )}
          </div>
        </div>

        <div className={`image-grid ${getGridClass()}`}>
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className={`grid-item ${selectedImageIndex === index ? 'selected' : ''}`}
            >
              <div className="grid-image-wrapper">
                {!loadedImages.has(index) && !errorImages.has(index) && (
                  <div className="grid-image-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}

                {errorImages.has(index) && (
                  <div className="grid-image-error">
                    <span>Failed to load</span>
                  </div>
                )}

                <img
                  src={imageUrl}
                  alt={`Generated result ${index + 1}`}
                  className={`grid-image ${loadedImages.has(index) ? 'loaded' : ''}`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  onClick={() => handleImageClick(imageUrl, index)}
                  style={{ display: errorImages.has(index) ? 'none' : 'block' }}
                />

                {loadedImages.has(index) && (
                  <div className="grid-image-overlay">
                    <button
                      className="preview-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(imageUrl, index);
                      }}
                      title="Preview image"
                    >
                      👁️
                    </button>
                    {onDownload && (
                      <button
                        className="download-single-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(imageUrl, index);
                        }}
                        title="Download this image"
                      >
                        📥
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="grid-item-label">
                Option {index + 1}
              </div>
            </div>
          ))}
        </div>

        {showMetadata && result.metadata && (
          <div className="metadata-section">
            <h4>Generation Details</h4>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="label">Function:</span>
                <span className="value">{result.metadata.functionType}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Processing Time:</span>
                <span className="value">{(result.metadata.processingTime / 1000).toFixed(2)}s</span>
              </div>
              <div className="metadata-item">
                <span className="label">Generated:</span>
                <span className="value">
                  {new Date(result.metadata.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="metadata-item">
                <span className="label">Images Generated:</span>
                <span className="value">{images.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="preview-modal"
          onClick={closePreview}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-preview"
              onClick={closePreview}
              title="Close preview (Esc)"
            >
              ✕
            </button>

            <div className="preview-navigation">
              <button
                className="nav-button prev"
                onClick={() => navigatePreview('prev')}
                title="Previous image (←)"
              >
                ‹
              </button>

              <div className="preview-image-container">
                <img
                  src={previewImage}
                  alt={`Preview ${selectedImageIndex !== null ? selectedImageIndex + 1 : ''}`}
                  className="preview-image"
                />
                <div className="preview-counter">
                  {selectedImageIndex !== null && result.imageUrls && (
                    <span>{selectedImageIndex + 1} of {result.imageUrls.length}</span>
                  )}
                </div>
              </div>

              <button
                className="nav-button next"
                onClick={() => navigatePreview('next')}
                title="Next image (→)"
              >
                ›
              </button>
            </div>

            <div className="preview-controls">
              {onDownload && selectedImageIndex !== null && (
                <button
                  className="download-preview"
                  onClick={() => handleDownload(previewImage, selectedImageIndex)}
                >
                  Download Image
                </button>
              )}
              {onSave && (
                <button
                  className="save-preview"
                  onClick={() => onSave(previewImage)}
                >
                  Save Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GridDisplay;