import React, { useState, useCallback } from 'react';
import './ImagePreview.css';

interface ImagePreviewProps {
  imageUrl: string;
  alt?: string;
  onRemove?: () => void;
  onDownload?: () => void;
  className?: string;
  showActions?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  alt = 'Preview',
  onRemove,
  onDownload,
  className = '',
  showActions = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageLoaded(true);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageLoaded(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${Date.now()}.png`;
      link.click();
    }
  }, [imageUrl, onDownload]);

  return (
    <>
      <div className={`image-preview-container ${className}`}>
        <div className="image-preview-wrapper">
          {isLoading && (
            <div className="image-preview-loading">
              <div className="loading-spinner-large"></div>
              <p>Loading image...</p>
            </div>
          )}
          
          {hasError && (
            <div className="image-preview-error">
              <span className="error-icon">⚠️</span>
              <p>Failed to load image</p>
            </div>
          )}
          
          {imageLoaded && showActions && (
            <div className="image-preview-overlay">
              <button
                className="preview-action-btn preview-btn"
                onClick={toggleFullscreen}
                title="Preview fullscreen"
              >
                <span className="btn-icon">👁️</span>
                <span>Preview</span>
              </button>
              {onDownload && (
                <button
                  className="preview-action-btn download-btn"
                  onClick={handleDownload}
                  title="Download image"
                >
                  <span className="btn-icon">📥</span>
                  <span>Download</span>
                </button>
              )}
              {onRemove && (
                <button
                  className="preview-action-btn remove-btn"
                  onClick={onRemove}
                  title="Remove image"
                >
                  <span className="btn-icon">🗑️</span>
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={alt}
            className={`preview-image ${imageLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={toggleFullscreen}
            style={{ display: hasError ? 'none' : 'block' }}
          />
        </div>
      </div>

      {isFullscreen && (
        <div 
          className="fullscreen-preview"
          onClick={toggleFullscreen}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="fullscreen-close"
              onClick={toggleFullscreen}
              aria-label="Close preview"
            >
              ✕
            </button>
            <img
              src={imageUrl}
              alt={alt}
              className="fullscreen-image"
            />
            {showActions && (
              <div className="fullscreen-actions">
                {onDownload && (
                  <button
                    className="fullscreen-action-btn"
                    onClick={handleDownload}
                  >
                    📥 Download
                  </button>
                )}
                {onRemove && (
                  <button
                    className="fullscreen-action-btn"
                    onClick={onRemove}
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

