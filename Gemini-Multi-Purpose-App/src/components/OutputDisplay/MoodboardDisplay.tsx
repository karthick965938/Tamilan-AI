import React, { useState, useCallback } from 'react';
import { GenerationResult } from '../../types';
import './MoodboardDisplay.css';

interface MoodboardDisplayProps {
  result: GenerationResult;
  onDownload?: (imageUrl: string, filename?: string) => void;
  onSave?: (imageUrl: string) => void;
  showMetadata?: boolean;
  className?: string;
}

const MoodboardDisplay: React.FC<MoodboardDisplayProps> = ({
  result,
  onDownload,
  onSave,
  showMetadata = true,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

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
        filename = `fashion-moodboard-${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
      } else {
        // Regular URL - fetch normally
        const response = await fetch(result.imageUrl);
        blob = await response.blob();
        filename = `fashion-moodboard-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
      }

      const url = window.URL.createObjectURL(blob);
      onDownload(url, filename);

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading moodboard:', error);
    }
  }, [result.imageUrl, onDownload]);

  const handleSave = useCallback(() => {
    if (!result.imageUrl || !onSave) return;
    onSave(result.imageUrl);
  }, [result.imageUrl, onSave]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false);
  }, [isFullscreen]);

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  const toggleDetails = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
        setIsZoomed(false);
      }
    }
  }, [isFullscreen]);

  // Mock fashion items data - in a real app, this could come from the API response
  const getFashionItems = () => [
    { name: 'Vintage Denim Jacket', brand: 'Levi\'s', price: '$89', category: 'Outerwear' },
    { name: 'Silk Scarf', brand: 'Hermès', price: '$320', category: 'Accessories' },
    { name: 'Leather Boots', brand: 'Dr. Martens', price: '$150', category: 'Footwear' },
    { name: 'Cotton T-Shirt', brand: 'Uniqlo', price: '$19', category: 'Basics' },
    { name: 'Wool Sweater', brand: 'COS', price: '$79', category: 'Knitwear' }
  ];

  const fashionItems = getFashionItems();

  if (!result.success || !result.imageUrl) {
    return (
      <div className={`moodboard-display error ${className}`}>
        <div className="error-message">
          <h3>Moodboard Generation Failed</h3>
          <p>{result.error || 'Failed to generate fashion moodboard.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`moodboard-display ${className}`}>
        <div className="moodboard-header">
          <h3>Fashion Mood Board</h3>
          <div className="moodboard-controls">
            <button
              className={`details-toggle ${showDetails ? 'active' : ''}`}
              onClick={toggleDetails}
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? '📝 Hide Details' : '📝 Show Details'}
            </button>
          </div>
        </div>

        <div className="moodboard-container">
          <div className="moodboard-image-section">
            {!imageLoaded && !imageError && (
              <div className="image-loading">
                <div className="loading-spinner"></div>
                <p>Creating your fashion moodboard...</p>
              </div>
            )}

            {imageError && (
              <div className="image-error">
                <p>Failed to load moodboard</p>
              </div>
            )}

            <div className="image-wrapper">
              <img
                src={result.imageUrl}
                alt="Fashion moodboard collage"
                className={`moodboard-image ${imageLoaded ? 'loaded' : ''}`}
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

          {showDetails && (
            <div className="moodboard-details">
              <div className="fashion-items-section">
                <h4>Featured Items</h4>
                <div className="fashion-items-grid">
                  {fashionItems.map((item, index) => (
                    <div key={index} className="fashion-item">
                      <div className="item-header">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">{item.price}</span>
                      </div>
                      <div className="item-details">
                        <span className="item-brand">{item.brand}</span>
                        <span className="item-category">{item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="styling-notes-section">
                <h4>Styling Notes</h4>
                <div className="styling-notes">
                  <div className="note-item">
                    <span className="note-icon">✨</span>
                    <span className="note-text">Mix textures for visual interest</span>
                  </div>
                  <div className="note-item">
                    <span className="note-icon">🎨</span>
                    <span className="note-text">Neutral palette with accent colors</span>
                  </div>
                  <div className="note-item">
                    <span className="note-icon">👗</span>
                    <span className="note-text">Layer pieces for versatility</span>
                  </div>
                  <div className="note-item">
                    <span className="note-icon">💫</span>
                    <span className="note-text">Balance proportions and silhouettes</span>
                  </div>
                </div>
              </div>

              <div className="color-palette-section">
                <h4>Color Palette</h4>
                <div className="color-palette">
                  <div className="color-swatch" style={{ backgroundColor: '#2C3E50' }} title="Navy Blue"></div>
                  <div className="color-swatch" style={{ backgroundColor: '#ECF0F1' }} title="Light Gray"></div>
                  <div className="color-swatch" style={{ backgroundColor: '#E8D5C4' }} title="Beige"></div>
                  <div className="color-swatch" style={{ backgroundColor: '#A0522D' }} title="Brown"></div>
                  <div className="color-swatch" style={{ backgroundColor: '#8B4513' }} title="Saddle Brown"></div>
                  <div className="color-swatch" style={{ backgroundColor: '#FFFFFF' }} title="White"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="moodboard-description">
          <p>
            <strong>Creative Fashion Collage:</strong> This moodboard features individual fashion
            items arranged in an artistic collage with handwritten notes and sketches in a
            marker-style font. Brand names and sources are included in English with creative
            aesthetics to inspire your fashion choices.
          </p>
        </div>

        <div className="action-buttons">
          {onDownload && (
            <button
              className="download-button"
              onClick={handleDownload}
              disabled={!imageLoaded}
            >
              📥 Download Moodboard
            </button>
          )}
          {onSave && (
            <button
              className="save-button"
              onClick={handleSave}
              disabled={!imageLoaded}
            >
              💾 Save Inspiration
            </button>
          )}
        </div>

        {showMetadata && result.metadata && (
          <div className="metadata-section">
            <h4>Moodboard Details</h4>
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
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(result.metadata.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="metadata-item">
                <span className="label">Style:</span>
                <span className="value">Creative Collage</span>
              </div>
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
              alt="Fashion moodboard - Fullscreen"
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
                  Download Moodboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MoodboardDisplay;