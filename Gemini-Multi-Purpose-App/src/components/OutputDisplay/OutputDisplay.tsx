import React, { useState, useCallback } from 'react';
import { GenerationResult } from '../../types';
import './OutputDisplay.css';

interface OutputDisplayProps {
  result: GenerationResult;
  onDownload?: (imageUrl: string, filename?: string) => void;
  onSave?: (imageUrl: string) => void;
  showMetadata?: boolean;
  className?: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  result,
  onDownload,
  onSave,
  showMetadata = true,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!result.imageUrl || !onDownload) return;

    try {
      let blob: Blob;
      let filename: string;

      // Check if it's a data URL
      if (result.imageUrl.startsWith('data:')) {
        // Convert data URL directly to blob without fetch
        const base64Data = result.imageUrl.split(',')[1];
        const mimeType = result.imageUrl.split(';')[0].split(':')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
        filename = `generated-image-${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
      } else {
        // Regular URL - fetch normally
        const response = await fetch(result.imageUrl);
        blob = await response.blob();
        filename = `generated-image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
      }

      const url = window.URL.createObjectURL(blob);
      onDownload(url, filename);

      // Clean up the object URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, [result.imageUrl, onDownload]);

  const handleSave = useCallback(() => {
    if (!result.imageUrl || !onSave) return;
    onSave(result.imageUrl);
  }, [result.imageUrl, onSave]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false); // Reset zoom when toggling fullscreen
  }, [isFullscreen]);

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
        setIsZoomed(false);
      }
    }
  }, [isFullscreen]);

  if (!result.success || !result.imageUrl) {
    return (
      <div className={`output-display error ${className}`}>
        <div className="error-message">
          <h3>Generation Failed</h3>
          <p>{result.error || 'An unknown error occurred during image generation.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`output-display ${className}`}>
        <div className="image-container">
          <div className="image-wrapper">
            {!imageLoaded && !imageError && (
              <div className="image-loading">
                <div className="loading-spinner"></div>
                <p>Loading image...</p>
              </div>
            )}

            {imageError && (
              <div className="image-error">
                <p>Failed to load image</p>
              </div>
            )}

            <img
              src={result.imageUrl}
              alt="Generated result"
              className={`generated-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={toggleFullscreen}
              style={{ display: imageError ? 'none' : 'block' }}
            />

            {imageLoaded && (
              <div className="image-overlay">
                <button
                  className="zoom-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoom();
                  }}
                  title={isZoomed ? 'Zoom out' : 'Zoom in'}
                >
                  {isZoomed ? '🔍-' : '🔍+'}
                </button>
                <button
                  className="fullscreen-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  title="View fullscreen"
                >
                  ⛶
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          {onDownload && (
            <button
              className="download-button"
              onClick={handleDownload}
              disabled={!imageLoaded}
            >
              📥 Download
            </button>
          )}
          {onSave && (
            <button
              className="save-button"
              onClick={handleSave}
              disabled={!imageLoaded}
            >
              💾 Save
            </button>
          )}
        </div>

        {showMetadata && result.metadata && (
          <div className="metadata-section-improved">
            <h4>Generation Details</h4>
            <div className="metadata-grid-improved">
              <div className="metadata-item-improved">
                <span className="metadata-label">Function:</span>
                <span className="metadata-value">{result.metadata.functionType}</span>
              </div>
              <div className="metadata-item-improved">
                <span className="metadata-label">Processing Time:</span>
                <span className="metadata-value">{(result.metadata.processingTime / 1000).toFixed(2)}s</span>
              </div>
              <div className="metadata-item-improved">
                <span className="metadata-label">Generated:</span>
                <span className="metadata-value">
                  {new Date(result.metadata.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="metadata-item-improved">
                <span className="metadata-label">Input Images:</span>
                <span className="metadata-value">{result.metadata.inputImageCount}</span>
              </div>
              {result.metadata.apiVersion && (
                <div className="metadata-item-improved">
                  <span className="metadata-label">API Version:</span>
                  <span className="metadata-value">{result.metadata.apiVersion}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fullscreen-modal"
          onClick={toggleFullscreen}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-fullscreen"
              onClick={toggleFullscreen}
              title="Close fullscreen (Esc)"
            >
              ✕
            </button>
            <img
              src={result.imageUrl}
              alt="Generated result - Fullscreen"
              className={`fullscreen-image ${isZoomed ? 'zoomed' : ''}`}
              onClick={toggleZoom}
            />
            <div className="fullscreen-controls">
              <button
                className="zoom-control"
                onClick={toggleZoom}
                title={isZoomed ? 'Zoom out' : 'Zoom in'}
              >
                {isZoomed ? 'Zoom Out' : 'Zoom In'}
              </button>
              {onDownload && (
                <button
                  className="download-control"
                  onClick={handleDownload}
                >
                  Download Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OutputDisplay;