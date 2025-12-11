import React, { useState, useCallback } from 'react';
import { GenerationResult } from '../../types';
import './ComicStripDisplay.css';

interface ComicPanel {
  imageUrl: string;
  text?: string;
  position: number;
}

interface ComicStripDisplayProps {
  result: GenerationResult;
  onDownload?: (imageUrl: string, filename?: string) => void;
  onSave?: (imageUrl: string) => void;
  showMetadata?: boolean;
  className?: string;
}

const ComicStripDisplay: React.FC<ComicStripDisplayProps> = ({
  result,
  onDownload,
  onSave,
  showMetadata = true,
  className = ''
}) => {
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null);
  const [loadedPanels, setLoadedPanels] = useState<Set<number>>(new Set());
  const [errorPanels, setErrorPanels] = useState<Set<number>>(new Set());
  const [fullscreenPanel, setFullscreenPanel] = useState<number | null>(null);

  // Convert result to comic panels
  const getComicPanels = useCallback((): ComicPanel[] => {
    if (!result.imageUrls) {
      return result.imageUrl ? [{ imageUrl: result.imageUrl, position: 0 }] : [];
    }

    return result.imageUrls.map((imageUrl, index) => ({
      imageUrl,
      position: index,
      text: `Panel ${index + 1}` // This could be enhanced with actual comic text
    }));
  }, [result]);

  const panels = getComicPanels();

  const handlePanelLoad = useCallback((index: number) => {
    setLoadedPanels(prev => new Set([...prev, index]));
    setErrorPanels(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handlePanelError = useCallback((index: number) => {
    setErrorPanels(prev => new Set([...prev, index]));
    setLoadedPanels(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handlePanelClick = useCallback((index: number) => {
    setSelectedPanel(selectedPanel === index ? null : index);
  }, [selectedPanel]);

  const handleFullscreen = useCallback((index: number) => {
    setFullscreenPanel(index);
  }, []);

  const closeFullscreen = useCallback(() => {
    setFullscreenPanel(null);
  }, []);

  const handleDownload = useCallback(async (imageUrl?: string, panelIndex?: number) => {
    if (!onDownload) return;

    const urlToDownload = imageUrl || result.imageUrl;
    if (!urlToDownload) return;

    try {
      const response = await fetch(urlToDownload);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const filename = panelIndex !== undefined
        ? `comic-panel-${panelIndex + 1}-${Date.now()}.${blob.type.split('/')[1] || 'png'}`
        : `comic-strip-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;

      onDownload(url, filename);

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading comic panel:', error);
    }
  }, [result.imageUrl, onDownload]);

  const handleDownloadAll = useCallback(async () => {
    if (!onDownload) return;

    for (let i = 0; i < panels.length; i++) {
      await handleDownload(panels[i].imageUrl, i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [panels, onDownload, handleDownload]);

  const navigateFullscreen = useCallback((direction: 'prev' | 'next') => {
    if (fullscreenPanel === null) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = fullscreenPanel > 0 ? fullscreenPanel - 1 : panels.length - 1;
    } else {
      newIndex = fullscreenPanel < panels.length - 1 ? fullscreenPanel + 1 : 0;
    }

    setFullscreenPanel(newIndex);
  }, [fullscreenPanel, panels.length]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (fullscreenPanel !== null) {
      switch (event.key) {
        case 'Escape':
          closeFullscreen();
          break;
        case 'ArrowLeft':
          navigateFullscreen('prev');
          break;
        case 'ArrowRight':
          navigateFullscreen('next');
          break;
      }
    }
  }, [fullscreenPanel, closeFullscreen, navigateFullscreen]);

  if (!result.success || panels.length === 0) {
    return (
      <div className={`comic-strip-display error ${className}`}>
        <div className="error-message">
          <h3>Comic Generation Failed</h3>
          <p>{result.error || 'Failed to generate comic strip.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`comic-strip-display ${className}`}>
        <div className="comic-header">
          <h3>Superhero Comic Strip</h3>
          <div className="comic-actions">
            <span className="panel-count">{panels.length} panels</span>
            {onDownload && panels.length > 1 && (
              <button
                className="download-all-button"
                onClick={handleDownloadAll}
                title="Download all panels"
              >
                📥 Download All
              </button>
            )}
          </div>
        </div>

        <div className="comic-strip-container">
          <div className={`comic-panels ${panels.length <= 4 ? 'single-row' : 'multi-row'}`}>
            {panels.map((panel, index) => (
              <div
                key={index}
                className={`comic-panel ${selectedPanel === index ? 'selected' : ''}`}
              >
                <div className="panel-wrapper">
                  <div className="panel-border">
                    {!loadedPanels.has(index) && !errorPanels.has(index) && (
                      <div className="panel-loading">
                        <div className="loading-spinner"></div>
                      </div>
                    )}

                    {errorPanels.has(index) && (
                      <div className="panel-error">
                        <span>Panel {index + 1} failed to load</span>
                      </div>
                    )}

                    <img
                      src={panel.imageUrl}
                      alt={`Comic panel ${index + 1}`}
                      className={`panel-image ${loadedPanels.has(index) ? 'loaded' : ''}`}
                      onLoad={() => handlePanelLoad(index)}
                      onError={() => handlePanelError(index)}
                      onClick={() => handlePanelClick(index)}
                      style={{ display: errorPanels.has(index) ? 'none' : 'block' }}
                    />

                    {loadedPanels.has(index) && (
                      <div className="panel-overlay">
                        <button
                          className="fullscreen-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFullscreen(index);
                          }}
                          title="View fullscreen"
                        >
                          ⛶
                        </button>
                        {onDownload && (
                          <button
                            className="download-panel-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(panel.imageUrl, index);
                            }}
                            title="Download panel"
                          >
                            📥
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="panel-number">
                    {index + 1}
                  </div>

                  {panel.text && (
                    <div className="panel-text">
                      {panel.text}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="comic-description">
          <p>
            <strong>Superhero Comic Adventure:</strong> Follow the thrilling story through these
            action-packed panels featuring your character in an epic superhero narrative with
            compelling dialogue and dramatic scenes.
          </p>
        </div>

        <div className="action-buttons">
          {onDownload && (
            <button
              className="download-button"
              onClick={() => handleDownload()}
              disabled={panels.length === 0}
            >
              📥 Download Comic Strip
            </button>
          )}
          {onSave && (
            <button
              className="save-button"
              onClick={() => onSave(result.imageUrl || panels[0]?.imageUrl)}
              disabled={panels.length === 0}
            >
              💾 Save Comic
            </button>
          )}
        </div>

        {showMetadata && result.metadata && (
          <div className="metadata-section">
            <h4>Comic Details</h4>
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
                <span className="label">Panels Created:</span>
                <span className="value">{panels.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenPanel !== null && (
        <div
          className="fullscreen-modal"
          onClick={closeFullscreen}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-fullscreen"
              onClick={closeFullscreen}
              title="Close fullscreen (Esc)"
            >
              ✕
            </button>

            <div className="fullscreen-navigation">
              <button
                className="nav-button prev"
                onClick={() => navigateFullscreen('prev')}
                title="Previous panel (←)"
              >
                ‹
              </button>

              <div className="fullscreen-panel-container">
                <img
                  src={panels[fullscreenPanel].imageUrl}
                  alt={`Comic panel ${fullscreenPanel + 1} - Fullscreen`}
                  className="fullscreen-panel-image"
                />
                <div className="fullscreen-panel-counter">
                  Panel {fullscreenPanel + 1} of {panels.length}
                </div>
              </div>

              <button
                className="nav-button next"
                onClick={() => navigateFullscreen('next')}
                title="Next panel (→)"
              >
                ›
              </button>
            </div>

            <div className="fullscreen-controls">
              {onDownload && (
                <button
                  className="download-fullscreen"
                  onClick={() => handleDownload(panels[fullscreenPanel].imageUrl, fullscreenPanel)}
                >
                  Download Panel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComicStripDisplay;