import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, OutputDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './OOTDGenerator.css';
import '../shared-styles.css';

interface OOTDGeneratorProps {
  className?: string;
}

export const OOTDGenerator: React.FC<OOTDGeneratorProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('ootd-generator');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Validate that we have both person and clothing images
  const validateImages = useCallback((images: UploadedImage[]): string | null => {
    if (images.length === 0) return null;
    if (images.length === 1) return 'Please upload both a person image and a clothing image.';
    if (images.length > 2) return 'Please upload only 2 images: one person and one clothing item.';

    // Basic validation - in a real app, you might use AI to detect if images contain person/clothing
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

  // Generate OOTD
  const generateOOTD = useCallback(async () => {
    if (uploadedImages.length !== 2) {
      setError('Please upload both a person image and a clothing image.');
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
      const result = await geminiService.generateOOTD(personImageData, clothingImageData);

      if (result.success && result.imageUrl) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate OOTD. Please try again.');
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
    link.download = filename || `ootd-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-ootd-${Date.now()}.png`);
  }, [handleDownload]);



  // Get upload progress text
  const getUploadProgressText = useCallback(() => {
    if (uploadedImages.length === 0) return 'Upload person image first';
    if (uploadedImages.length === 1) return 'Upload clothing image next';
    return 'Ready to generate OOTD';
  }, [uploadedImages.length]);

  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>OOTD Generator functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`ootd-generator ${className}`}>


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
                <span className="step-label">Clothing Image</span>
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
                <img src={uploadedImages[0].preview} alt="Person" />
                <p>Person</p>
              </div>
              <div className="combination-arrow">
                <span>+</span>
              </div>
              <div className="preview-item">
                <img src={uploadedImages[1].preview} alt="Clothing" />
                <p>Clothing</p>
              </div>
              <div className="combination-arrow">
                <span>=</span>
              </div>
              <div className="preview-result">
                <span>OOTD Photo</span>
              </div>
            </div>

            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generateOOTD}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Creating OOTD Photo...
                  </>
                ) : (
                  <>
                    ✨ Generate OOTD Photo
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Creating a realistic outfit-of-the-day photo with natural lighting and street style..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <div className="results-header">
              <h3>Generated OOTD Photo</h3>

            </div>
            <p className="results-description">
              Your realistic outfit-of-the-day photo with natural lighting and street style aesthetic.
            </p>

            <OutputDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="ootd-output"
            />
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use a clear, full-body or upper-body photo of a person</li>
            <li>Choose clothing images with good lighting and clear details</li>
            <li>Ensure both images are high resolution for better quality</li>
            <li>The person should be in a neutral pose for easier clothing integration</li>
            <li>Clothing items should be clearly visible and not too complex</li>
            <li>Avoid images with heavy shadows or poor lighting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};