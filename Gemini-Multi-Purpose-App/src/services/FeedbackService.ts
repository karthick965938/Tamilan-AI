import { FeedbackData } from '../components/FeedbackCollector';

export interface FeedbackSubmissionResult {
  success: boolean;
  message?: string;
  feedbackId?: string;
}

/**
 * Service for handling user feedback collection and submission
 */
export class FeedbackService {
  private static instance: FeedbackService;
  private feedbackQueue: (FeedbackData & { id: string; timestamp: Date })[] = [];
  private maxQueueSize = 1000;

  private constructor() {}

  static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: FeedbackData): Promise<FeedbackSubmissionResult> {
    try {
      const feedbackId = this.generateFeedbackId();
      const timestampedFeedback = {
        ...feedback,
        id: feedbackId,
        timestamp: new Date()
      };

      // Add to local queue
      this.addToQueue(timestampedFeedback);

      // In a real application, this would send to a backend service
      // For now, we'll simulate the submission
      await this.simulateSubmission(timestampedFeedback);

      // Log to console for development
      console.log('[FeedbackService] Feedback submitted:', timestampedFeedback);

      // Store in localStorage for persistence
      this.persistFeedback(timestampedFeedback);

      return {
        success: true,
        message: 'Thank you for your feedback!',
        feedbackId
      };
    } catch (error) {
      console.error('[FeedbackService] Failed to submit feedback:', error);
      return {
        success: false,
        message: 'Failed to submit feedback. Please try again.'
      };
    }
  }

  /**
   * Get feedback statistics for analytics
   */
  getFeedbackStats(): {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    categoryBreakdown: Record<string, number>;
  } {
    const feedback = this.getFeedbackHistory();
    
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: {},
        categoryBreakdown: {}
      };
    }

    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / feedback.length;

    const ratingDistribution = feedback.reduce((dist, f) => {
      dist[f.rating] = (dist[f.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    const categoryBreakdown = feedback.reduce((breakdown, f) => {
      const category = f.category || 'other';
      breakdown[category] = (breakdown[category] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    return {
      totalFeedback: feedback.length,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      categoryBreakdown
    };
  }

  /**
   * Get recent feedback for a specific functionality
   */
  getFeedbackForFunctionality(functionalityType: string): (FeedbackData & { id: string; timestamp: Date })[] {
    return this.feedbackQueue.filter(f => f.functionalityType === functionalityType);
  }

  /**
   * Clear feedback history (for testing or privacy)
   */
  clearFeedbackHistory(): void {
    this.feedbackQueue = [];
    localStorage.removeItem('userFeedback');
  }

  /**
   * Get all feedback history
   */
  getFeedbackHistory(): (FeedbackData & { id: string; timestamp: Date })[] {
    return [...this.feedbackQueue];
  }

  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToQueue(feedback: FeedbackData & { id: string; timestamp: Date }): void {
    this.feedbackQueue.push(feedback);
    
    // Keep queue size manageable
    if (this.feedbackQueue.length > this.maxQueueSize) {
      this.feedbackQueue.shift();
    }
  }

  private async simulateSubmission(_feedback: FeedbackData & { id: string; timestamp: Date }): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error during feedback submission');
    }
  }

  private persistFeedback(feedback: FeedbackData & { id: string; timestamp: Date }): void {
    try {
      const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      existingFeedback.push(feedback);
      
      // Keep only last 100 feedback items in localStorage
      if (existingFeedback.length > 100) {
        existingFeedback.splice(0, existingFeedback.length - 100);
      }
      
      localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));
    } catch (error) {
      console.warn('[FeedbackService] Failed to persist feedback to localStorage:', error);
    }
  }

  /**
   * Load persisted feedback on initialization
   */
  loadPersistedFeedback(): void {
    try {
      const persistedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      this.feedbackQueue = persistedFeedback.map((f: any) => ({
        ...f,
        timestamp: new Date(f.timestamp)
      }));
    } catch (error) {
      console.warn('[FeedbackService] Failed to load persisted feedback:', error);
      this.feedbackQueue = [];
    }
  }
}

export const feedbackService = FeedbackService.getInstance();

// Load persisted feedback on module initialization
feedbackService.loadPersistedFeedback();