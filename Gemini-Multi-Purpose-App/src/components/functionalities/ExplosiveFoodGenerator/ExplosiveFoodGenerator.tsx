import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, OutputDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './ExplosiveFoodGenerator.css';
import '../shared-styles.css';

interface ExplosiveFoodGeneratorProps {
  className?: string;
}

export const ExplosiveFoodGenerator: React.FC<ExplosiveFoodGeneratorProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brandColors, setBrandColors] = useState<string[]>(['#ff6b35', '#f7931e']);
  const [customColor, setCustomColor] = useState<string>('#ff6b35');

  const functionality = getFunctionalityById('explosive-food');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Predefined brand color palettes
  const colorPalettes = [
    { name: 'Vibrant Orange', colors: ['#ff6b35', '#f7931e'] },
    { name: 'Fresh Green', colors: ['#4ade80', '#22c55e'] },
    { name: 'Bold Red', colors: ['#ef4444', '#dc2626'] },
    { name: 'Electric Blue', colors: ['#3b82f6', '#2563eb'] },
    { name: 'Sunset', colors: ['#f59e0b', '#d97706'] },
    { name: 'Purple Power', colors: ['#8b5cf6', '#7c3aed'] }
  ];

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

  // Generate explosive food photography
  const generateExplosiveFood = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload a food product image first.');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert image to base64
      const imageData = await fileToBase64(uploadedImages[0].file);

      // Call Gemini API with brand colors
      const result = await geminiService.generateExplosiveFood(imageData, brandColors);

      if (result.success && result.imageUrl) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate explosive food photography. Please try again.');
        setProcessingState(ProcessingState.FAILED);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Generation failed: ${errorMessage}`);
      setProcessingState(ProcessingState.FAILED);
    }
  }, [uploadedImages, geminiService, fileToBase64, brandColors]);

  // Handle color palette selection
  const handleColorPaletteSelect = useCallback((colors: string[]) => {
    setBrandColors(colors);
  }, []);

  // Handle custom color change
  const handleCustomColorChange = useCallback((color: string) => {
    setCustomColor(color);
    setBrandColors([color, color]);
  }, []);

  // Handle download
  const handleDownload = useCallback((imageUrl: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || `explosive-food-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-explosive-food-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Explosive Food Generator functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`explosive-food-generator ${className}`}>


      <div className="functionality-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload Food Product Image</h3>
          <p className="upload-instructions">{functionality.instructions}</p>

          <ImageUploader
            onUpload={handleImageUpload}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={functionality.maxFiles}
            maxFileSize={functionality.maxFileSize}
            supportedFormats={functionality.supportedFormats}
            multiple={false}
            disabled={processingState === ProcessingState.PROCESSING}
            className="food-uploader"
          />

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Brand Colors Section */}
        {uploadedImages.length > 0 && (
          <div className="brand-colors-section">
            <h3>Choose Brand Colors</h3>
            <p className="colors-description">
              Select colors that will be used as the background for your explosive food photography.
            </p>

            <div className="color-palettes">
              <h4>Preset Palettes</h4>
              <div className="palette-grid">
                {colorPalettes.map((palette, index) => (
                  <button
                    key={index}
                    className={`palette-option ${JSON.stringify(brandColors) === JSON.stringify(palette.colors) ? 'selected' : ''}`}
                    onClick={() => handleColorPaletteSelect(palette.colors)}
                  >
                    <div className="palette-colors">
                      {palette.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="palette-name">{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-color">
              <h4>Custom Color</h4>
              <div className="custom-color-input">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="color-picker"
                />
                <span className="color-value">{customColor}</span>
              </div>
            </div>

            <div className="selected-colors">
              <h4>Selected Colors</h4>
              <div className="selected-palette">
                {brandColors.map((color, index) => (
                  <div
                    key={index}
                    className="selected-color"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generation Section */}
        {uploadedImages.length > 0 && (
          <div className="generation-section">
            <div className="process-preview">
              <div className="preview-item">
                <img src={uploadedImages[0].preview} alt="Food Product" />
                <p>Food Product</p>
              </div>
              <div className="combination-arrow">
                <span>💥</span>
              </div>
              <div className="preview-result">
                <span>Explosive<br />Photography</span>
              </div>
            </div>

            <div className="generation-controls">
              <button
                ref={generateBtnRef}
                className="generate-button"
                onClick={generateExplosiveFood}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Creating Explosive Scene...
                  </>
                ) : (
                  <>
                    💥 Generate Explosive Food Photography
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Creating dramatic promotional photography with flying ingredients and dynamic composition..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <div className="results-header">
              <h3>Explosive Food Photography</h3>

            </div>
            <p className="results-description">
              Your dramatic promotional image with flying ingredients, emphasizing freshness and nutritional value.
            </p>

            <OutputDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="explosive-food-output"
            />
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use high-quality food product images with clear details</li>
            <li>Choose brand colors that complement your food product</li>
            <li>Ensure the food product is well-lit and clearly visible</li>
            <li>Simple, clean product shots work better than complex compositions</li>
            <li>The food should be the main focus of the original image</li>
            <li>Higher resolution images produce more dramatic results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};