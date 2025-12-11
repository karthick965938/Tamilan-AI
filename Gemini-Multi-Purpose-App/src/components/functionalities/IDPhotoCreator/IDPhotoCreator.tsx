import React, { useState, useCallback, useRef } from 'react';
import { ImageUploader, ProcessingIndicator, OutputDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './IDPhotoCreator.css';

interface IDPhotoCreatorProps {
  className?: string;
}

export const IDPhotoCreator: React.FC<IDPhotoCreatorProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropPreview, setCropPreview] = useState<string | null>(null);
  const [showCropPreview, setShowCropPreview] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const functionality = getFunctionalityById('id-photo-creator');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Validate that uploaded image is a portrait suitable for ID photo
  const validatePortraitImage = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Check aspect ratio - portraits should be taller than wide or close to square
        const aspectRatio = img.width / img.height;
        const isPortrait = aspectRatio <= 1.3; // Allow some flexibility
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

  // Create crop preview for ID photo dimensions (2-inch format)
  const createCropPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          resolve('');
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        // ID photo dimensions (2 inches at 300 DPI = 600x600 pixels, but we'll use 400x400 for preview)
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Calculate crop area (center the face area)
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = Math.max(0, (img.height - sourceSize) / 2 - sourceSize * 0.1); // Slightly higher to focus on face

        // Draw cropped image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, targetSize, targetSize
        );

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };

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
    setCropPreview(null);
    setShowCropPreview(false);

    if (images.length === 0) {
      setUploadedImages([]);
      return;
    }

    // Validate that the image is a portrait
    const isPortrait = await validatePortraitImage(images[0].file);
    if (!isPortrait) {
      setError('Please upload a portrait image. The image should show a person\'s face clearly for ID photo creation.');
      return;
    }

    // Create crop preview
    const preview = await createCropPreview(images[0].file);
    setCropPreview(preview);
    setShowCropPreview(true);

    setUploadedImages(images);

    // Auto-scroll to generate button
    setTimeout(() => {
      if (generateBtnRef.current) {
        generateBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [validatePortraitImage, createCropPreview]);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Generate ID photo
  const generateIDPhoto = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload a portrait image first.');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert image to base64
      const imageData = await fileToBase64(uploadedImages[0].file);

      // Call Gemini API
      const result = await geminiService.generateIDPhoto(imageData);

      if (result.success) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate ID photo. Please try again.');
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
    link.download = filename || `id-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-id-photo-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>ID Photo Creator functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`id-photo-creator ${className}`}>


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
            placeholder="Drop portrait image here for ID photo creation"
          />

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Crop Preview Section */}
        {showCropPreview && cropPreview && (
          <div className="crop-preview-section">
            <h3>ID Photo Preview</h3>
            <p className="preview-description">
              This shows how your image will be cropped for the 2-inch ID photo format.
            </p>

            <div className="crop-preview-container">
              <div className="crop-preview-frame">
                <img src={cropPreview} alt="ID photo crop preview" />
                <div className="crop-overlay">
                  <div className="crop-guidelines">
                    <div className="guideline horizontal"></div>
                    <div className="guideline vertical"></div>
                  </div>
                </div>
              </div>
              <div className="crop-info">
                <h4>ID Photo Specifications</h4>
                <ul>
                  <li>✓ 2-inch square format</li>
                  <li>✓ Blue background</li>
                  <li>✓ Professional business attire</li>
                  <li>✓ Frontal face positioning</li>
                  <li>✓ Slight smile expression</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Generation Section */}
        {uploadedImages.length > 0 && (
          <div className="generation-section">
            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generateIDPhoto}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Creating Professional ID Photo...
                  </>
                ) : (
                  <>
                    📷 Create ID Photo
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Creating professional ID photo with blue background and proper formatting..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <h3>Professional ID Photo</h3>
            <p className="results-description">
              Your professional 2-inch ID photo is ready with blue background and business attire.
            </p>

            <div className="id-photo-result">
              <OutputDisplay
                result={generationResult}
                onDownload={handleDownload}
                onSave={handleSave}
                showMetadata={true}
                className="id-photo-output"
              />

              <div className="photo-specifications">
                <h4>Photo Specifications Met</h4>
                <div className="spec-grid">
                  <div className="spec-item">
                    <span className="spec-icon">📐</span>
                    <span className="spec-label">Dimensions</span>
                    <span className="spec-value">2" × 2"</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-icon">🎨</span>
                    <span className="spec-label">Background</span>
                    <span className="spec-value">Blue</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-icon">👔</span>
                    <span className="spec-label">Attire</span>
                    <span className="spec-value">Professional</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-icon">😊</span>
                    <span className="spec-label">Expression</span>
                    <span className="spec-value">Slight Smile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use a clear, high-resolution portrait photo</li>
            <li>Ensure the person is facing forward with eyes open</li>
            <li>Good lighting on the face is essential</li>
            <li>Avoid shadows, reflections, or busy backgrounds</li>
            <li>The person should have a neutral or slight smile</li>
            <li>Remove hats, sunglasses, or other face coverings</li>
          </ul>
        </div>
      </div>

      {/* Hidden canvas for crop preview */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};