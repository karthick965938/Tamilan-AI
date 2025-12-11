import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, AnnotatedImageDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './CalorieAnnotator.css';

interface CalorieAnnotatorProps {
  className?: string;
}

export const CalorieAnnotator: React.FC<CalorieAnnotatorProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('calorie-annotator');
  const geminiService = GeminiService.getInstance();

  const generateBtnRef = React.useRef<HTMLButtonElement>(null);

  // Validate that uploaded image contains food
  const validateFoodImage = useCallback((_file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // For now, we'll accept any image and let the AI determine if it's food
      // In a real implementation, you might use a pre-trained model to validate
      resolve(true);
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

    // Validate that the image contains food
    const isFood = await validateFoodImage(images[0].file);
    if (!isFood) {
      setError('Please upload an image that contains food items for calorie analysis.');
      return;
    }

    setUploadedImages(images);

    // Auto-scroll to generate button
    setTimeout(() => {
      if (generateBtnRef.current) {
        generateBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [validateFoodImage]);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Generate calorie annotations
  const generateCalorieAnnotation = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload a food image first.');
      return;
    }

    try {
      setProcessingState(ProcessingState.PROCESSING);
      setError(null);
      setGenerationResult(null);

      // Convert image to base64
      const imageData = await fileToBase64(uploadedImages[0].file);

      // Call Gemini API
      const result = await geminiService.generateCalorieAnnotation(imageData);

      if (result.success) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate calorie annotations. Please try again.');
        setProcessingState(ProcessingState.FAILED);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Analysis failed: ${errorMessage}`);
      setProcessingState(ProcessingState.FAILED);
    }
  }, [uploadedImages, geminiService, fileToBase64]);

  // Handle download
  const handleDownload = useCallback((imageUrl: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || `calorie-analysis-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-calorie-analysis-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Calorie Annotator functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`calorie-annotator ${className}`}>


      <div className="functionality-content">
        {/* Upload Section */}
        <div className="upload-section">
          <h3>Upload Food Image</h3>
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
            placeholder="Drop food image here for calorie analysis"
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
                onClick={generateCalorieAnnotation}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing Nutritional Content...
                  </>
                ) : (
                  <>
                    🍎 Analyze Calories & Nutrition
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Identifying food items and calculating nutritional information..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <h3>Nutritional Analysis</h3>
            <p className="results-description">
              Your food image has been analyzed with detailed calorie and nutritional information for each item.
            </p>

            <AnnotatedImageDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="calorie-output"
            />

            {/* Accuracy Disclaimer */}
            <div className="accuracy-indicator">
              <div className="accuracy-header">
                <span className="accuracy-icon">📊</span>
                <h4>Accuracy Information</h4>
              </div>
              <p>
                Calorie estimates are based on visual analysis and standard nutritional data.
                Actual values may vary based on preparation methods, portion sizes, and specific ingredients.
                For precise nutritional information, consult packaging labels or a nutritionist.
              </p>
              <div className="accuracy-level">
                <span className="accuracy-label">Estimated Accuracy:</span>
                <div className="accuracy-bar">
                  <div className="accuracy-fill" style={{ width: '75%' }}></div>
                </div>
                <span className="accuracy-percentage">~75%</span>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Use clear, well-lit images of food items</li>
            <li>Ensure individual food items are clearly visible and separated</li>
            <li>Include the entire meal or dish in the frame</li>
            <li>Avoid images with heavy shadows or poor lighting</li>
            <li>For packaged foods, include visible labels when possible</li>
            <li>Multiple angles of complex dishes can improve accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};