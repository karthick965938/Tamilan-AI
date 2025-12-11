import React, { useState } from 'react';
import { Tooltip } from '../Tooltip';
import './FeedbackCollector.css';

export interface FeedbackData {
  rating: number; // 1-5 stars
  comment?: string;
  category?: 'quality' | 'accuracy' | 'speed' | 'usability' | 'other';
  generationId?: string;
  functionalityType?: string;
}

export interface FeedbackCollectorProps {
  onSubmit: (feedback: FeedbackData) => void;
  generationId?: string;
  functionalityType?: string;
  compact?: boolean;
  className?: string;
}

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  onSubmit,
  generationId,
  functionalityType,
  compact = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<FeedbackData['category']>('quality');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) return;

    setIsSubmitting(true);

    const feedback: FeedbackData = {
      rating,
      comment: comment.trim() || undefined,
      category,
      generationId,
      functionalityType
    };

    try {
      await onSubmit(feedback);
      setHasSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setHasSubmitted(false);
        setRating(0);
        setComment('');
        setCategory('quality');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setCategory('quality');
    setIsOpen(false);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);

      return (
        <button
          key={starValue}
          type="button"
          className={`star-button ${isFilled ? 'star-filled' : 'star-empty'}`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={isFilled ? '#fbbf24' : 'none'}
              stroke={isFilled ? '#fbbf24' : '#d1d5db'}
              strokeWidth="2"
            />
          </svg>
        </button>
      );
    });
  };

  if (compact) {
    return (
      <div className={`feedback-collector-compact ${className}`}>
        <Tooltip content="Rate this generation" position="top">
          <button
            className="feedback-trigger-compact"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Provide feedback"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </Tooltip>

        {isOpen && (
          <div className="feedback-popup">
            <div className="feedback-popup-content">
              {hasSubmitted ? (
                <div className="feedback-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#10b981" />
                    <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Thank you!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="stars-row">
                    {renderStars()}
                  </div>
                  <button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    className="submit-button-compact"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`feedback-collector ${className}`}>
      <button
        className="feedback-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
        </svg>
        Rate this result
      </button>

      {isOpen && (
        <div className="feedback-modal">
          <div className="feedback-modal-content">
            <div className="feedback-header">
              <h3>How was this generation?</h3>
              <button
                className="close-button"
                onClick={handleReset}
                aria-label="Close feedback"
              >
                ×
              </button>
            </div>

            {hasSubmitted ? (
              <div className="feedback-success-full">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#10b981" />
                  <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h4>Thank you for your feedback!</h4>
                <p>Your input helps us improve the AI generation quality.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="rating-section">
                  <label>Rating</label>
                  <div className="stars-container">
                    {renderStars()}
                  </div>
                  <div className="rating-labels">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div className="category-section">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackData['category'])}
                  >
                    <option value="quality">Image Quality</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="speed">Processing Speed</option>
                    <option value="usability">Ease of Use</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="comment-section">
                  <label htmlFor="comment">Comments (optional)</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us more about your experience..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="character-count">
                    {comment.length}/500
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    className="submit-button"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};