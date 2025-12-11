import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, OutputDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './ClothingChanger.css';
import '../shared-styles.css';

interface ClothingChangerProps {
  className?: string;
}

export const ClothingChanger: React.FC<ClothingChangerProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('clothing-changer');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Validate that we have both person and reference clothing images
  const validateImages = useCallback((images: UploadedImage[]): string | null => {
    if (images.length === 0) return null;
    if (images.length === 1) return 'Please upload both a person image and a reference clothing image.';
    if (images.length > 2) return 'Please upload only 2 images: one person and one reference clothing item.';

    return null;
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (images: UploadedImage[]) => {
    setError(null);
    setGenerationResult(null);

    const validationError = validateImages(images);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Update image types based on upload order
    const updatedImages = images.map((img, index) => ({
      ...img,
      type: index === 0 ? 'primary' as const : 'reference' as const
    }));

    setUploadedImages(updatedImages);

    // Auto-scroll to generate button
    setTimeout(() => {
      if (generateBtnRef.current) {
        generateBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [validateImages]);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Generate clothing change
  const generateClothingChange = useCallback(async () => {
    if (uploadedImages.length !== 2) {
      setError('Please upload both a person image and a reference clothing image.');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert images to base64
      const personImageData = await fileToBase64(uploadedImages[0].file);
      const clothingImageData = await fileToBase64(uploadedImages[1].file);

      // Call Gemini API
      const result = await geminiService.generateClothingChange(personImageData, clothingImageData);

      if (result.success && result.imageUrl) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to change clothing. Please try again.');
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
    link.download = filename || `clothing-change-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-clothing-change-${Date.now()}.png`);
  }, [handleDownload]);



  // Get upload progress text
  const getUploadProgressText = useCallback(() => {
    if (uploadedImages.length === 0) return 'Upload person image first';
    if (uploadedImages.length === 1) return 'Upload reference clothing image next';
    return 'Ready to change clothing';
  }, [uploadedImages.length]);

  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Clothing Changer functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`clothing-changer ${className}`}>


      <div className="functionality-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload Images</h3>
          <p className="upload-instructions">{functionality.instructions}</p>

          <div className="upload-progress">
            <div className="progress-indicator">
              <div className={`step ${uploadedImages.length >= 1 ? 'completed' : 'active'}`}>
                <span className="step-number">1</span>
                <span className="step-label">Person Image</span>
              </div>
              <div className="progress-line"></div>
              <div className={`step ${uploadedImages.length >= 2 ? 'completed' : uploadedImages.length === 1 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Reference Clothing</span>
              </div>
            </div>
            <p className="progress-text">{getUploadProgressText()}</p>
          </div>

          <ImageUploader
            onUpload={handleImageUpload}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={functionality.maxFiles}
            maxFileSize={functionality.maxFileSize}
            supportedFormats={functionality.supportedFormats}
            multiple={true}
            disabled={processingState === ProcessingState.PROCESSING}
            className="dual-uploader"
          />

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Generation Section */}
        {uploadedImages.length === 2 && (
          <div className="generation-section">
            <div className="process-preview">
              <div className="preview-item">
                <img src={uploadedImages[0].preview} alt="Original Person" />
                <p>Original Person</p>
              </div>
              <div className="combination-arrow">
                <span>+</span>
              </div>
              <div className="preview-item">
                <img src={uploadedImages[1].preview} alt="Reference Clothing" />
                <p>Reference Clothing</p>
              </div>
              <div className="combination-arrow">
                <span>=</span>
              </div>
              <div className="preview-result">
                <span>Same Person<br />New Clothing</span>
              </div>
            </div>

            <div className="preservation-notice">
              <div className="notice-icon">🔒</div>
              <div className="notice-content">
                <h4>What's Preserved</h4>
                <ul>
                  <li>Same pose and body position</li>
                  <li>Facial expression and identity</li>
                  <li>Background and environment</li>
                  <li>Lighting conditions</li>
                </ul>
              </div>
            </div>

            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generateClothingChange}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Changing Clothing...
                  </>
                ) : (
                  <>
                    ✨ Change Clothing
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Replacing clothing while preserving pose, identity, and environment..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <div className="results-header">
              <h3>Clothing Changed</h3>

            </div>
            <p className="results-description">
              The same person with new clothing, maintaining their original pose and environment.
            </p>

            <OutputDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="clothing-change-output"
            />
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use clear images with good lighting for both person and clothing</li>
            <li>The person should be in a neutral, visible pose</li>
            <li>Reference clothing should be clearly visible and well-defined</li>
            <li>Avoid complex backgrounds that might interfere with clothing detection</li>
            <li>Higher resolution images produce more realistic results</li>
            <li>Simple clothing changes work better than complex outfit transformations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};