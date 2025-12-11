import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GenerationResult } from '../../types';
import './AnnotatedImageDisplay.css';

interface AnnotatedImageDisplayProps {
  result: GenerationResult;
  onDownload?: (imageUrl: string, filename?: string) => void;
  onSave?: (imageUrl: string) => void;
  showMetadata?: boolean;
  className?: string;
}

const AnnotatedImageDisplay: React.FC<AnnotatedImageDisplayProps> = ({
  result,
  onDownload,
  onSave,
  showMetadata = true,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
    calculateImageScale();
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const calculateImageScale = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;

    const image = imageRef.current;
    const container = containerRef.current;

    const scaleX = container.clientWidth / image.naturalWidth;
    const scaleY = container.clientHeight / image.naturalHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    setImageScale(scale);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      calculateImageScale();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateImageScale]);

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
        filename = `annotated-image-${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
      } else {
        // Regular URL - fetch normally
        const response = await fetch(result.imageUrl);
        blob = await response.blob();
        filename = `annotated-image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
      }

      const url = window.URL.createObjectURL(blob);
      onDownload(url, filename);

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, [result.imageUrl, onDownload]);

  const handleSave = useCallback(() => {
    if (!result.imageUrl || !onSave) return;
    onSave(result.imageUrl);
  }, [result.imageUrl, onSave]);

  const handleAnnotationClick = useCallback((index: number) => {
    setSelectedAnnotation(selectedAnnotation === index ? null : index);
  }, [selectedAnnotation]);

  const toggleAnnotations = useCallback(() => {
    setShowAnnotations(!showAnnotations);
    setSelectedAnnotation(null);
  }, [showAnnotations]);

  const getTotalCalories = useCallback(() => {
    if (!result.annotations) return 0;
    return result.annotations.reduce((total, annotation) => total + annotation.calories, 0);
  }, [result.annotations]);

  if (!result.success || !result.imageUrl) {
    return (
      <div className={`annotated-image-display error ${className}`}>
        <div className="error-message">
          <h3>Annotation Failed</h3>
          <p>{result.error || 'Failed to generate annotated image.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`annotated-image-display ${className}`}>
      <div className="annotation-header">
        <h3>Calorie Analysis</h3>
        <div className="annotation-controls">
          <button
            className={`toggle-annotations ${showAnnotations ? 'active' : ''}`}
            onClick={toggleAnnotations}
            title={showAnnotations ? 'Hide annotations' : 'Show annotations'}
          >
            {showAnnotations ? '👁️ Hide' : '👁️ Show'} Annotations
          </button>
          {result.annotations && result.annotations.length > 0 && (
            <div className="total-calories">
              Total: <strong>{getTotalCalories()} cal</strong>
            </div>
          )}
        </div>
      </div>

      <div className="image-container" ref={containerRef}>
        <div className="image-wrapper">
          {!imageLoaded && !imageError && (
            <div className="image-loading">
              <div className="loading-spinner"></div>
              <p>Loading annotated image...</p>
            </div>
          )}

          {imageError && (
            <div className="image-error">
              <p>Failed to load annotated image</p>
            </div>
          )}

          <img
            ref={imageRef}
            src={result.imageUrl}
            alt="Annotated food image"
            className={`annotated-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageError ? 'none' : 'block' }}
          />

          {/* Annotation Overlays */}
          {imageLoaded && showAnnotations && result.annotations && (
            <div className="annotations-overlay">
              {result.annotations.map((annotation, index) => (
                <div
                  key={annotation.id}
                  className={`annotation-marker ${selectedAnnotation === index ? 'selected' : ''}`}
                  style={{
                    left: `${annotation.x * imageScale}px`,
                    top: `${annotation.y * imageScale}px`,
                    width: `${annotation.width * imageScale}px`,
                    height: `${annotation.height * imageScale}px`,
                  }}
                  onClick={() => handleAnnotationClick(index)}
                >
                  <div className="annotation-label">
                    <span className="annotation-number">{index + 1}</span>
                  </div>

                  {selectedAnnotation === index && (
                    <div className="annotation-tooltip">
                      <div className="tooltip-content">
                        <h4>{annotation.foodName}</h4>
                        <div className="calorie-info">
                          <div className="calorie-main">
                            <strong>{annotation.calories} cal</strong>
                          </div>
                          {annotation.caloriesPerGram && (
                            <div className="calorie-density">
                              {annotation.caloriesPerGram} cal/g
                            </div>
                          )}
                        </div>
                        <div className="confidence-score">
                          Confidence: {Math.round(annotation.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Annotation List */}
      {result.annotations && result.annotations.length > 0 && (
        <div className="annotations-list">
          <h4>Food Items Detected</h4>
          <div className="annotations-grid">
            {result.annotations.map((annotation, index) => (
              <div
                key={annotation.id}
                className={`annotation-item ${selectedAnnotation === index ? 'selected' : ''}`}
                onClick={() => handleAnnotationClick(index)}
              >
                <div className="annotation-item-number">{index + 1}</div>
                <div className="annotation-item-content">
                  <div className="food-name">{annotation.foodName}</div>
                  <div className="calorie-value">{annotation.calories} cal</div>
                  {annotation.caloriesPerGram && (
                    <div className="calorie-density-small">
                      {annotation.caloriesPerGram} cal/g
                    </div>
                  )}
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ width: `${annotation.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="nutrition-summary">
            <div className="summary-item">
              <span className="summary-label">Total Items:</span>
              <span className="summary-value">{result.annotations.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Calories:</span>
              <span className="summary-value">{getTotalCalories()} cal</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Confidence:</span>
              <span className="summary-value">
                {Math.round(
                  result.annotations.reduce((sum, ann) => sum + ann.confidence, 0) /
                  result.annotations.length * 100
                )}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        {onDownload && (
          <button
            className="download-button"
            onClick={handleDownload}
            disabled={!imageLoaded}
          >
            📥 Download Annotated Image
          </button>
        )}
        {onSave && (
          <button
            className="save-button"
            onClick={handleSave}
            disabled={!imageLoaded}
          >
            💾 Save Analysis
          </button>
        )}
      </div>

      {showMetadata && result.metadata && (
        <div className="metadata-section">
          <h4>Analysis Details</h4>
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
              <span className="label">Analyzed:</span>
              <span className="value">
                {new Date(result.metadata.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="metadata-item">
              <span className="label">Items Detected:</span>
              <span className="value">{result.annotations?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotatedImageDisplay;