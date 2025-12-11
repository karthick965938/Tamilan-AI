import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, GridDisplay } from '../../';
import { ImagePreview } from '../../OutputDisplay/ImagePreview';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './HairstyleChanger.css';
import '../shared-styles.css';

interface HairstyleChangerProps {
  className?: string;
}

export const HairstyleChanger: React.FC<HairstyleChangerProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('hairstyle-changer');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Validate that uploaded image is a portrait
  const validatePortraitImage = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Check aspect ratio - portraits are typically taller than wide or close to square
        const aspectRatio = img.width / img.height;
        const isPortrait = aspectRatio <= 1.2; // Allow some flexibility for square-ish images
        resolve(isPortrait);
      };
      img.onerror = () => resolve(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (images: UploadedImage[]) => {
    setError(null);
    setGenerationResult(null);

    if (images.length === 0) {
      setUploadedImages([]);
      return;
    }

    // Validate that the image is a portrait
    const isPortrait = await validatePortraitImage(images[0].file);
    if (!isPortrait) {
      setError('Please upload a portrait image. The image should show a person\'s face and shoulders clearly.');
      return;
    }

    setUploadedImages(images);

    // Auto-scroll to generate button
    setTimeout(() => {
      if (generateBtnRef.current) {
        generateBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [validatePortraitImage]);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Generate hairstyles
  const generateHairstyles = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload a portrait image first.');
      return;
    }

    // Prevent duplicate calls
    if (processingState === ProcessingState.PROCESSING) {
      console.warn('Generation already in progress, ignoring duplicate call');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert image to base64
      const imageData = await fileToBase64(uploadedImages[0].file);

      // Call Gemini API - only once
      const result = await geminiService.generateHairstyles(imageData);

      if (result.success && (result.imageUrl || result.imageUrls)) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate hairstyles. Please try again.');
        setProcessingState(ProcessingState.FAILED);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Generation failed: ${errorMessage}`);
      setProcessingState(ProcessingState.FAILED);
    }
  }, [uploadedImages, geminiService, fileToBase64, processingState]);

  // Handle download
  const handleDownload = useCallback((imageUrl: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || `hairstyle-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save (could integrate with local storage or cloud storage)
  const handleSave = useCallback((imageUrl: string) => {
    // For now, just trigger download
    handleDownload(imageUrl, `saved-hairstyle-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Hairstyle Changer functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`hairstyle-changer ${className}`}>


      <div className="functionality-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload Portrait Image</h3>
          <p className="upload-instructions">{functionality.instructions}</p>

          <ImageUploader
            onUpload={handleImageUpload}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={functionality.maxFiles}
            maxFileSize={functionality.maxFileSize}
            supportedFormats={functionality.supportedFormats}
            multiple={false}
            disabled={processingState === ProcessingState.PROCESSING}
            className="portrait-uploader"
          />

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Generation Section */}
        {uploadedImages.length > 0 && (
          <div className="generation-section">
            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generateHairstyles}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Generating Hairstyles...
                  </>
                ) : (
                  <>
                    ✨ Generate 9 Hairstyle Variations
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Creating 9 different hairstyle variations for your portrait..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <div className="results-header">
              <h3>Generated Hairstyles</h3>

            </div>
            {generationResult.imageUrls && generationResult.imageUrls.length > 1 ? (
              <>
                <p className="results-description">
                  Choose from {generationResult.imageUrls.length} different hairstyle variations. Click on any image to preview it larger.
                </p>
                <GridDisplay
                  result={generationResult}
                  onDownload={handleDownload}
                  onSave={handleSave}
                  gridSize="3x3"
                  showMetadata={true}
                  className="hairstyle-grid"
                />
              </>
            ) : (
              <>
                <p className="results-description">
                  Generated hairstyle grid with 9 variations. Click on the image to preview it larger.
                </p>
                <ImagePreview
                  imageUrl={generationResult.imageUrl || (generationResult.imageUrls && generationResult.imageUrls[0]) || ''}
                  alt="Generated hairstyle grid"
                  onDownload={() => handleDownload(generationResult.imageUrl || (generationResult.imageUrls && generationResult.imageUrls[0]) || '')}
                  onRemove={() => { }}
                  showActions={true}
                />
                {generationResult.metadata && (
                  <div className="metadata-section-improved">
                    <h4>Generation Details</h4>
                    <div className="metadata-grid-improved">
                      <div className="metadata-item-improved">
                        <span className="metadata-label">Processing Time:</span>
                        <span className="metadata-value">{(generationResult.metadata.processingTime / 1000).toFixed(2)}s</span>
                      </div>
                      <div className="metadata-item-improved">
                        <span className="metadata-label">Model:</span>
                        <span className="metadata-value">{generationResult.metadata.apiVersion || 'N/A'}</span>
                      </div>
                      <div className="metadata-item-improved">
                        <span className="metadata-label">Timestamp:</span>
                        <span className="metadata-value">
                          {generationResult.metadata.timestamp
                            ? new Date(generationResult.metadata.timestamp).toLocaleString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use a clear, well-lit portrait photo</li>
            <li>Ensure the person's face and hair are clearly visible</li>
            <li>Avoid images with hats or hair accessories</li>
            <li>Higher resolution images produce better results</li>
            <li>The person should be facing forward or at a slight angle</li>
          </ul>
        </div>
      </div>
    </div>
  );
};