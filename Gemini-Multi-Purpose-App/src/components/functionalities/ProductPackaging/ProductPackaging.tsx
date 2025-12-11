import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, OutputDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './ProductPackaging.css';

interface ProductPackagingProps {
  className?: string;
}

export const ProductPackaging: React.FC<ProductPackagingProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('product-packaging');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Handle image upload
  const handleImageUpload = useCallback(async (images: UploadedImage[]) => {
    setError(null);
    setGenerationResult(null);
    setUploadedImages(images);

    // Auto-scroll logic is complicated here because we have multiple uploaders
    // We only want to scroll if both images are uploaded
    const hasBothImages = images.length >= 2 || (images.length >= 1 && uploadedImages.length >= 1);

    if (hasBothImages) {
      setTimeout(() => {
        if (generateBtnRef.current) {
          generateBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [uploadedImages]);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Generate packaging design
  const generatePackaging = useCallback(async () => {
    if (uploadedImages.length < 2) {
      setError('Please upload both a product design and a packaging reference image.');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert images to base64
      const productDesignData = await fileToBase64(uploadedImages[0].file);
      const packagingReferenceData = await fileToBase64(uploadedImages[1].file);

      // Call Gemini API
      const result = await geminiService.generatePackaging(productDesignData, packagingReferenceData);

      if (result.success) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate packaging design. Please try again.');
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
    link.download = filename || `packaging-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-packaging-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Product Packaging functionality not found.</p>
      </div>
    );
  }

  const productDesignImage = uploadedImages.find((_, index) => index === 0);
  const packagingReferenceImage = uploadedImages.find((_, index) => index === 1);

  return (
    <div className={`product-packaging ${className}`}>


      <div className="functionality-content">
        {/* Upload Section */}
        <div className="upload-section">
          <div className="dual-upload-container">
            <div className="upload-item">
              <h3>Product Design</h3>
              <p className="upload-instructions">Upload the design you want to apply to packaging</p>

              <ImageUploader
                onUpload={(images) => {
                  const newImages = [...uploadedImages];
                  if (images.length > 0) {
                    newImages[0] = { ...images[0], type: 'primary' };
                  }
                  handleImageUpload(newImages.filter(Boolean));
                }}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxFiles={1}
                maxFileSize={functionality.maxFileSize}
                supportedFormats={functionality.supportedFormats}
                multiple={false}
                disabled={processingState === ProcessingState.PROCESSING}
                className="design-uploader"
                placeholder="Drop product design here"
              />

              {productDesignImage && (
                <div className="uploaded-preview">
                  <img src={productDesignImage.preview} alt="Product design" />
                  <p className="image-label">Product Design</p>
                </div>
              )}
            </div>

            <div className="upload-separator">
              <span className="separator-text">+</span>
            </div>

            <div className="upload-item">
              <h3>Packaging Reference</h3>
              <p className="upload-instructions">Upload the packaging format you want to use</p>

              <ImageUploader
                onUpload={(images) => {
                  const newImages = [...uploadedImages];
                  if (images.length > 0) {
                    newImages[1] = { ...images[0], type: 'reference' };
                  }
                  handleImageUpload(newImages.filter(Boolean));
                }}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxFiles={1}
                maxFileSize={functionality.maxFileSize}
                supportedFormats={functionality.supportedFormats}
                multiple={false}
                disabled={processingState === ProcessingState.PROCESSING}
                className="packaging-uploader"
                placeholder="Drop packaging reference here"
              />

              {packagingReferenceImage && (
                <div className="uploaded-preview">
                  <img src={packagingReferenceImage.preview} alt="Packaging reference" />
                  <p className="image-label">Packaging Reference</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Generation Section */}
        {uploadedImages.length >= 2 && (
          <div className="generation-section">
            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generatePackaging}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Applying Design to Packaging...
                  </>
                ) : (
                  <>
                    📦 Generate Packaged Product
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Applying your product design to the packaging format in a professional setting..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <h3>Generated Packaging Design</h3>
            <p className="results-description">
              Your product design has been professionally applied to the packaging format with minimalist styling.
            </p>

            <OutputDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="packaging-output"
            />
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use high-quality product design images with clear details</li>
            <li>Choose packaging references that match your product type</li>
            <li>Ensure both images have good lighting and contrast</li>
            <li>Vector-based designs often produce cleaner results</li>
            <li>Consider the packaging material and surface when selecting references</li>
          </ul>
        </div>
      </div>
    </div>
  );
};