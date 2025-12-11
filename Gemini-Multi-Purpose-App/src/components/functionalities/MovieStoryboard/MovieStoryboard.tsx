import React, { useState, useCallback } from 'react';
import { ImageUploader, ProcessingIndicator, StoryboardDisplay } from '../../';
import { GeminiService } from '../../../services';
import { UploadedImage, GenerationResult, ProcessingState } from '../../../types';
import { getFunctionalityById } from '../../../constants';
import './MovieStoryboard.css';

interface MovieStoryboardProps {
  className?: string;
}

export const MovieStoryboard: React.FC<MovieStoryboardProps> = ({ className = '' }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functionality = getFunctionalityById('movie-storyboard');
  const geminiService = GeminiService.getInstance();

  // Handle image upload
  const handleImageUpload = useCallback(async (images: UploadedImage[]) => {
    setError(null);
    setGenerationResult(null);
    setUploadedImages(images);
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

  // Generate movie storyboard
  const generateStoryboard = useCallback(async () => {
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
      const result = await geminiService.generateStoryboard(imageData);

      if (result.success) {
        setGenerationResult(result);
        setProcessingState(ProcessingState.COMPLETED);
      } else {
        setError(result.error || 'Failed to generate movie storyboard. Please try again.');
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
    link.download = filename || `storyboard-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle save
  const handleSave = useCallback((imageUrl: string) => {
    handleDownload(imageUrl, `saved-storyboard-${Date.now()}.png`);
  }, [handleDownload]);



  if (!functionality) {
    return (
      <div className="functionality-error">
        <p>Movie Storyboard functionality not found.</p>
      </div>
    );
  }

  return (
    <div className={`movie-storyboard ${className}`}>


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
            placeholder="Drop reference image here to create film noir storyboard"
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
            <div className="storyboard-preview">
              <h3>Film Noir Detective Story</h3>
              <div className="story-concept">
                <div className="concept-header">
                  <span className="concept-icon">🕵️</span>
                  <h4>The Missing Treasure</h4>
                </div>
                <p className="concept-description">
                  Your reference image will be transformed into the protagonist of a classic film noir detective story.
                  The 12-part storyboard will follow a mysterious case involving missing treasure, complete with
                  dramatic lighting, shadows, and cinematic composition.
                </p>

                <div className="story-elements">
                  <div className="story-act">
                    <h5>Act I: Setup (Panels 1-4)</h5>
                    <ul>
                      <li>Detective introduction and case briefing</li>
                      <li>Crime scene investigation</li>
                      <li>First clues discovered</li>
                      <li>Mysterious encounter</li>
                    </ul>
                  </div>
                  <div className="story-act">
                    <h5>Act II: Investigation (Panels 5-8)</h5>
                    <ul>
                      <li>Following leads through the city</li>
                      <li>Interrogating suspects</li>
                      <li>Uncovering deeper conspiracy</li>
                      <li>Dangerous confrontation</li>
                    </ul>
                  </div>
                  <div className="story-act">
                    <h5>Act III: Resolution (Panels 9-12)</h5>
                    <ul>
                      <li>Final pieces of the puzzle</li>
                      <li>Dramatic revelation</li>
                      <li>Climactic showdown</li>
                      <li>Case closed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="generation-controls">
              <button
                className="generate-button"
                onClick={generateStoryboard}
                disabled={processingState === ProcessingState.PROCESSING}
              >
                {processingState === ProcessingState.PROCESSING ? (
                  <>
                    <span className="spinner"></span>
                    Creating Film Noir Storyboard...
                  </>
                ) : (
                  <>
                    🎬 Create 12-Part Storyboard
                  </>
                )}
              </button>
            </div>

            {processingState === ProcessingState.PROCESSING && (
              <ProcessingIndicator
                isProcessing={true}
                message="Creating a cinematic 12-part film noir detective storyboard with dramatic lighting and composition..."
                progress={undefined}
              />
            )}
          </div>
        )}

        {/* Results Section */}
        {generationResult && processingState === ProcessingState.COMPLETED && (
          <div className="results-section">
            <h3>Film Noir Detective Storyboard</h3>
            <p className="results-description">
              Your 12-part film noir detective storyboard is complete! Each panel tells part of the story
              through visual narrative without text overlays.
            </p>

            <StoryboardDisplay
              result={generationResult}
              onDownload={handleDownload}
              onSave={handleSave}
              showMetadata={true}
              className="storyboard-output"
            />

            <div className="storyboard-features">
              <h4>Cinematic Features</h4>
              <div className="features-grid">
                <div className="feature-item noir-lighting">
                  <span className="feature-icon">💡</span>
                  <div className="feature-content">
                    <span className="feature-title">Dramatic Lighting</span>
                    <span className="feature-desc">High contrast shadows and highlights</span>
                  </div>
                </div>
                <div className="feature-item noir-composition">
                  <span className="feature-icon">📐</span>
                  <div className="feature-content">
                    <span className="feature-title">Cinematic Composition</span>
                    <span className="feature-desc">Professional camera angles and framing</span>
                  </div>
                </div>
                <div className="feature-item noir-atmosphere">
                  <span className="feature-icon">🌙</span>
                  <div className="feature-content">
                    <span className="feature-title">Noir Atmosphere</span>
                    <span className="feature-desc">Moody black and white aesthetic</span>
                  </div>
                </div>
                <div className="feature-item noir-narrative">
                  <span className="feature-icon">📖</span>
                  <div className="feature-content">
                    <span className="feature-title">Visual Storytelling</span>
                    <span className="feature-desc">Story told purely through imagery</span>
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
            <li>Use clear, well-lit reference images for character creation</li>
            <li>Portrait or character images work best for protagonist development</li>
            <li>Images with interesting facial features create more compelling detectives</li>
            <li>Higher resolution images produce better storyboard details</li>
            <li>Consider the mood and personality you want for your detective character</li>
            <li>Action poses or dramatic expressions enhance the noir atmosphere</li>
          </ul>
        </div>
      </div>
    </div>
  );
};