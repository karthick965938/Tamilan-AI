import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, OutputDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './FashionMoodboard.css';
import '../shared-styles.css';

interface FashionMoodboardProps {
  className?: string;
}

export const FashionMoodboard: React.FC<FashionMoodboardProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('fashion-moodboard');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Handle image upload
  const handleImageUpload = useCallback(async (images: UploadedImage[]) => {
    setError(null);
    setGenerationResult(null);

    if (images.length === 0) {
      setUploadedImages([]);
      return;
    }

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

  // Generate fashion moodboard
  const generateMoodboard = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload a fashion reference image first.');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert image to base64
      const imageData = await fileToBase64(uploadedImages[0].file);

      // Call Gemini API
      const result = await geminiService.generateMoodboard(imageData);

      if (result.success && result.imageUrl) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate fashion moodboard. Please try again.');
        setProcessingState(ProcessingState.FAILED);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Generation failed: ${errorMessage}`);
      setProcessingState(ProcessingState.FAILED);
    }
  }, [uploadedImages, geminiService, fileToBase64]);

  // Handle download
  const handleDownload = useCallback((imageUrl: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || `fashion-moodboard-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-moodboard-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Fashion Moodboard functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`fashion-moodboard ${className}`}>


      <div className="functionality-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload Fashion Reference Image</h3>
          <p className="upload-instructions">{functionality.instructions}</p>

          <ImageUploader
            onUpload={handleImageUpload}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={functionality.maxFiles}
            maxFileSize={functionality.maxFileSize}
            supportedFormats={functionality.supportedFormats}
            multiple={false}
            disabled={processingState === ProcessingState.PROCESSING}
            className="fashion-uploader"
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
            <div className="process-preview">
              <div className="preview-item">
                <img src={uploadedImages[0].preview} alt="Fashion Reference" />
                <p>Fashion Reference</p>
              </div>
              <div className="combination-arrow">
                <span>✨</span>
              </div>
              <div className="preview-result">
                <div className="moodboard-elements">
                  <div className="element sketch">📝</div>
                  <div className="element cutout">✂️</div>
                  <div className="element notes">📋</div>
                  <div className="element colors">🎨</div>
                </div>
                <span>Creative Moodboard</span>
              </div>
            </div>

            <div className="moodboard-features">
              <h4>What's Included in Your Moodboard</h4>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">✂️</span>
                  <div className="feature-content">
                    <h5>Fashion Cutouts</h5>
                    <p>Individual items arranged creatively</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✍️</span>
                  <div className="feature-content">
                    <h5>Handwritten Notes</h5>
                    <p>Marker-style annotations and sketches</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏷️</span>
                  <div className="feature-content">
                    <h5>Brand Information</h5>
                    <p>Names and sources in English</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <div className="feature-content">
                    <h5>Creative Aesthetic</h5>
                    <p>Mixed media designer workspace feel</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generateMoodboard}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Creating Moodboard...
                  </>
                ) : (
                  <>
                    🎨 Generate Fashion Moodboard
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Creating an artistic fashion moodboard with cutouts, handwritten notes, and creative elements..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <div className="results-header">
              <h3>Fashion Moodboard Created</h3>

            </div>
            <p className="results-description">
              Your creative fashion moodboard with artistic cutouts, handwritten notes, and designer aesthetic.
            </p>

            <OutputDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="moodboard-output"
            />
          </div>
        )}

        {/* Inspiration Section */}
        <div className="inspiration-section">
          <h4>🌟 Moodboard Inspiration</h4>
          <div className="inspiration-grid">
            <div className="inspiration-item">
              <h5>Fashion Designers</h5>
              <p>Create professional mood boards like top fashion designers use for collections</p>
            </div>
            <div className="inspiration-item">
              <h5>Style Bloggers</h5>
              <p>Perfect for fashion bloggers creating visual content and style guides</p>
            </div>
            <div className="inspiration-item">
              <h5>Brand Development</h5>
              <p>Ideal for developing brand aesthetics and visual identity concepts</p>
            </div>
            <div className="inspiration-item">
              <h5>Creative Projects</h5>
              <p>Great for personal styling projects and fashion inspiration boards</p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use high-quality fashion images with clear details and good lighting</li>
            <li>Images with multiple fashion items work great for diverse cutouts</li>
            <li>Fashion photography, runway shots, and styled outfits work best</li>
            <li>Ensure the fashion elements are clearly visible and well-defined</li>
            <li>Higher resolution images produce more detailed moodboard elements</li>
            <li>Images with interesting textures and patterns add visual appeal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};