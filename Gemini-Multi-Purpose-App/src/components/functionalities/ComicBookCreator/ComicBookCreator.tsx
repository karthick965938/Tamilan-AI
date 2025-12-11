import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, ComicStripDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import { useToast } from '../../../contexts';
import './ComicBookCreator.css';

interface ComicBookCreatorProps {
  className?: string;
}

export const ComicBookCreator: React.FC<ComicBookCreatorProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('comic-book-creator');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Handle image upload
  const handleImageUpload = useCallback(async (images: UploadedImage[]) => {
    setError(null);
    setGenerationResult(null);
    setUploadedImages(images);

    // Auto-scroll to generate button
    setTimeout(() => {
      if (generateBtnRef.current) {
        generateBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const { success } = useToast();

  // Generate comic book strip
  const generateComicBook = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload a reference image first.');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert image to base64
      const imageData = await fileToBase64(uploadedImages[0].file);

      // Call Gemini API
      const result = await geminiService.generateComicBook(imageData);

      if (result.success) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate comic book strip. Please try again.');
        setProcessingState(ProcessingState.FAILED);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Generation failed: ${errorMessage}`);
      setProcessingState(ProcessingState.FAILED);
    }
  }, [uploadedImages, geminiService, fileToBase64, success]);

  // Handle download
  const handleDownload = useCallback((imageUrl: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || `comic-strip-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-comic-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Comic Book Creator functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`comic-book-creator ${className}`}>


      <div className="functionality-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload Reference Image</h3>
          <p className="upload-instructions">{functionality.instructions}</p>

          <ImageUploader
            onUpload={handleImageUpload}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={functionality.maxFiles}
            maxFileSize={functionality.maxFileSize}
            supportedFormats={functionality.supportedFormats}
            multiple={false}
            disabled={processingState === ProcessingState.PROCESSING}
            className="reference-uploader"
            placeholder="Drop reference image here to create superhero comic"
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
            <div className="comic-preview">
              <h3>Comic Story Elements</h3>
              <div className="story-elements">
                <div className="element-item">
                  <span className="element-icon">🦸</span>
                  <div className="element-content">
                    <h4>Superhero Character</h4>
                    <p>Your reference image will be transformed into a superhero character</p>
                  </div>
                </div>
                <div className="element-item">
                  <span className="element-icon">💥</span>
                  <div className="element-content">
                    <h4>Action Panels</h4>
                    <p>Multiple comic panels with dynamic action sequences</p>
                  </div>
                </div>
                <div className="element-item">
                  <span className="element-icon">💬</span>
                  <div className="element-content">
                    <h4>Dialogue & Text</h4>
                    <p>Compelling story with speech bubbles and narrative text</p>
                  </div>
                </div>
                <div className="element-item">
                  <span className="element-icon">🎨</span>
                  <div className="element-content">
                    <h4>Comic Art Style</h4>
                    <p>Classic comic book aesthetics with bold colors and effects</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generateComicBook}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Creating Superhero Comic...
                  </>
                ) : (
                  <>
                    💥 Create Comic Strip
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Creating an exciting superhero comic strip with multiple panels and compelling dialogue..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <h3>Superhero Comic Strip</h3>
            <p className="results-description">
              Your superhero comic strip is ready with multiple panels, action sequences, and dialogue!
            </p>

            <ComicStripDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="comic-output"
            />

            <div className="comic-features">
              <h4>Comic Features</h4>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">📖</span>
                  <span className="feature-text">Multi-panel layout</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🗨️</span>
                  <span className="feature-text">Speech bubbles</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span className="feature-text">Action effects</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎭</span>
                  <span className="feature-text">Character consistency</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📝</span>
                  <span className="feature-text">Narrative text</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌈</span>
                  <span className="feature-text">Vibrant colors</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use clear images with good contrast and lighting</li>
            <li>Character images work best for superhero transformations</li>
            <li>Action poses or dynamic scenes create more exciting comics</li>
            <li>Higher resolution images produce better comic details</li>
            <li>Consider the mood and energy you want in your comic</li>
            <li>Images with interesting backgrounds add story context</li>
          </ul>
        </div>
      </div>
    </div>
  );
};