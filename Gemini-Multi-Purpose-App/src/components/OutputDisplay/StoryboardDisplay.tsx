import React, { useState, useCallback } from 'react';
import { GenerationResult } from '../../types';
import './StoryboardDisplay.css';

interface StoryboardFrame {
  imageUrl: string;
  frameNumber: number;
  description?: string;
}

interface StoryboardDisplayProps {
  result: GenerationResult;
  onDownload?: (imageUrl: string, filename?: string) => void;
  onSave?: (imageUrl: string) => void;
  showMetadata?: boolean;
  className?: string;
}

const StoryboardDisplay: React.FC<StoryboardDisplayProps> = ({
  result,
  onDownload,
  onSave,
  showMetadata = true,
  className = ''
}) => {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const [loadedFrames, setLoadedFrames] = useState<Set<number>>(new Set());
  const [errorFrames, setErrorFrames] = useState<Set<number>>(new Set());
  const [fullscreenFrame, setFullscreenFrame] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState(false);
  const [currentPlayFrame, setCurrentPlayFrame] = useState(0);

  // Convert result to storyboard frames (expecting 12 frames for movie storyboard)
  const getStoryboardFrames = useCallback((): StoryboardFrame[] => {
    if (!result.imageUrls) {
      return result.imageUrl ? [{ imageUrl: result.imageUrl, frameNumber: 1 }] : [];
    }

    return result.imageUrls.map((imageUrl, index) => ({
      imageUrl,
      frameNumber: index + 1,
      description: getFrameDescription(index + 1)
    }));
  }, [result]);

  const getFrameDescription = (frameNumber: number): string => {
    const descriptions = [
      "Opening scene - Detective arrives at the scene",
      "Investigation begins - Examining the evidence",
      "First clue discovered - A mysterious object",
      "Meeting the informant - Gathering information",
      "Following the lead - Chase sequence begins",
      "Confrontation - Face to face with danger",
      "Plot twist revealed - Unexpected discovery",
      "Escalating tension - The stakes get higher",
      "Climactic moment - The truth unfolds",
      "Final confrontation - Hero vs villain",
      "Resolution - Justice is served",
      "Closing scene - The treasure is found"
    ];

    return descriptions[frameNumber - 1] || `Scene ${frameNumber}`;
  };

  const frames = getStoryboardFrames();

  const handleFrameLoad = useCallback((index: number) => {
    setLoadedFrames(prev => new Set([...prev, index]));
    setErrorFrames(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleFrameError = useCallback((index: number) => {
    setErrorFrames(prev => new Set([...prev, index]));
    setLoadedFrames(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleFrameClick = useCallback((index: number) => {
    setSelectedFrame(selectedFrame === index ? null : index);
  }, [selectedFrame]);

  const handleFullscreen = useCallback((index: number) => {
    setFullscreenFrame(index);
  }, []);

  const closeFullscreen = useCallback(() => {
    setFullscreenFrame(null);
  }, []);

  const handleDownload = useCallback(async (imageUrl?: string, frameIndex?: number) => {
    if (!onDownload) return;

    const urlToDownload = imageUrl || result.imageUrl;
    if (!urlToDownload) return;

    try {
      const response = await fetch(urlToDownload);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const filename = frameIndex !== undefined
        ? `storyboard-frame-${frameIndex + 1}-${Date.now()}.${blob.type.split('/')[1] || 'png'}`
        : `storyboard-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;

      onDownload(url, filename);

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading storyboard frame:', error);
    }
  }, [result.imageUrl, onDownload]);

  const handleDownloadAll = useCallback(async () => {
    if (!onDownload) return;

    for (let i = 0; i < frames.length; i++) {
      await handleDownload(frames[i].imageUrl, i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [frames, onDownload, handleDownload]);

  const navigateFullscreen = useCallback((direction: 'prev' | 'next') => {
    if (fullscreenFrame === null) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = fullscreenFrame > 0 ? fullscreenFrame - 1 : frames.length - 1;
    } else {
      newIndex = fullscreenFrame < frames.length - 1 ? fullscreenFrame + 1 : 0;
    }

    setFullscreenFrame(newIndex);
  }, [fullscreenFrame, frames.length]);

  const togglePlayMode = useCallback(() => {
    setPlayMode(!playMode);
    if (!playMode) {
      setCurrentPlayFrame(0);
    }
  }, [playMode]);

  // Auto-advance frames in play mode
  React.useEffect(() => {
    if (!playMode) return;

    const interval = setInterval(() => {
      setCurrentPlayFrame(prev => (prev + 1) % frames.length);
    }, 2000); // 2 seconds per frame

    return () => clearInterval(interval);
  }, [playMode, frames.length]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (fullscreenFrame !== null) {
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
  }, [fullscreenFrame, closeFullscreen, navigateFullscreen]);

  if (!result.success || frames.length === 0) {
    return (
      <div className={`storyboard-display error ${className}`}>
        <div className="error-message">
          <h3>Storyboard Generation Failed</h3>
          <p>{result.error || 'Failed to generate movie storyboard.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`storyboard-display ${className}`}>
        <div className="storyboard-header">
          <h3>Film Noir Detective Story</h3>
          <div className="storyboard-actions">
            <span className="frame-count">{frames.length} frames</span>
            <button
              className={`play-button ${playMode ? 'playing' : ''}`}
              onClick={togglePlayMode}
              title={playMode ? 'Stop slideshow' : 'Play slideshow'}
            >
              {playMode ? '⏸️ Stop' : '▶️ Play'}
            </button>
            {onDownload && frames.length > 1 && (
              <button
                className="download-all-button"
                onClick={handleDownloadAll}
                title="Download all frames"
              >
                📥 Download All
              </button>
            )}
          </div>
        </div>

        {playMode && (
          <div className="slideshow-container">
            <div className="slideshow-frame">
              <img
                src={frames[currentPlayFrame]?.imageUrl}
                alt={`Storyboard frame ${currentPlayFrame + 1}`}
                className="slideshow-image"
              />
              <div className="slideshow-info">
                <div className="frame-indicator">
                  Frame {currentPlayFrame + 1} of {frames.length}
                </div>
                <div className="frame-description">
                  {frames[currentPlayFrame]?.description}
                </div>
              </div>
            </div>
            <div className="slideshow-progress">
              <div
                className="progress-bar"
                style={{ width: `${((currentPlayFrame + 1) / frames.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {!playMode && (
          <div className="storyboard-grid-container">
            <div className="storyboard-grid">
              {frames.map((frame, index) => (
                <div
                  key={index}
                  className={`storyboard-frame ${selectedFrame === index ? 'selected' : ''}`}
                >
                  <div className="frame-wrapper">
                    <div className="frame-border">
                      {!loadedFrames.has(index) && !errorFrames.has(index) && (
                        <div className="frame-loading">
                          <div className="loading-spinner"></div>
                        </div>
                      )}

                      {errorFrames.has(index) && (
                        <div className="frame-error">
                          <span>Frame {index + 1} failed to load</span>
                        </div>
                      )}

                      <img
                        src={frame.imageUrl}
                        alt={`Storyboard frame ${frame.frameNumber}`}
                        className={`frame-image ${loadedFrames.has(index) ? 'loaded' : ''}`}
                        onLoad={() => handleFrameLoad(index)}
                        onError={() => handleFrameError(index)}
                        onClick={() => handleFrameClick(index)}
                        style={{ display: errorFrames.has(index) ? 'none' : 'block' }}
                      />

                      {loadedFrames.has(index) && (
                        <div className="frame-overlay">
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
                              className="download-frame-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(frame.imageUrl, index);
                              }}
                              title="Download frame"
                            >
                              📥
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="frame-info">
                      <div className="frame-number">
                        {frame.frameNumber}
                      </div>
                      <div className="frame-description">
                        {frame.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="story-description">
          <p>
            <strong>Film Noir Detective Story:</strong> A black and white cinematic journey
            following a detective's quest to uncover missing treasure. Each frame captures
            the dramatic tension and atmospheric mood of classic film noir, telling the
            story purely through powerful imagery without text overlays.
          </p>
        </div>

        <div className="action-buttons">
          {onDownload && (
            <button
              className="download-button"
              onClick={() => handleDownload()}
              disabled={frames.length === 0}
            >
              📥 Download Storyboard
            </button>
          )}
          {onSave && (
            <button
              className="save-button"
              onClick={() => onSave(result.imageUrl || frames[0]?.imageUrl)}
              disabled={frames.length === 0}
            >
              💾 Save Storyboard
            </button>
          )}
        </div>

        {showMetadata && result.metadata && (
          <div className="metadata-section">
            <h4>Storyboard Details</h4>
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
                <span className="label">Frames Created:</span>
                <span className="value">{frames.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenFrame !== null && (
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
                title="Previous frame (←)"
              >
                ‹
              </button>

              <div className="fullscreen-frame-container">
                <img
                  src={frames[fullscreenFrame].imageUrl}
                  alt={`Storyboard frame ${fullscreenFrame + 1} - Fullscreen`}
                  className="fullscreen-frame-image"
                />
                <div className="fullscreen-frame-info">
                  <div className="fullscreen-frame-counter">
                    Frame {fullscreenFrame + 1} of {frames.length}
                  </div>
                  <div className="fullscreen-frame-description">
                    {frames[fullscreenFrame].description}
                  </div>
                </div>
              </div>

              <button
                className="nav-button next"
                onClick={() => navigateFullscreen('next')}
                title="Next frame (→)"
              >
                ›
              </button>
            </div>

            <div className="fullscreen-controls">
              {onDownload && (
                <button
                  className="download-fullscreen"
                  onClick={() => handleDownload(frames[fullscreenFrame].imageUrl, fullscreenFrame)}
                >
                  Download Frame
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryboardDisplay;