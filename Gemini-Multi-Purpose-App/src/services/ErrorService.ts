import { AppError, ErrorRecoveryOptions } from '../types/errors';

/**
 * Error logging and reporting service
 */
export class ErrorService {
  private static instance: ErrorService;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Log error to console and queue for reporting
   */
  logError(error: Error, context?: any): string {
    const errorId = this.generateErrorId();
    const appError: AppError = {
      message: error.message,
      timestamp: new Date(),
      stack: error.stack,
      type: 'UNKNOWN_ERROR',
      retryable: false,
      userMessage: 'An unexpected error occurred',
      technicalDetails: {
        context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId
      }
    };

    // Log to console
    console.error(`[ErrorService] ${errorId}:`, error, context);

    // Add to queue
    this.addToQueue(appError);

    // In development, also log to localStorage for debugging
    if (import.meta.env.DEV) {
      this.logToLocalStorage(appError);
    }

    return errorId;
  }

  /**
   * Log application-specific error
   */
  logAppError(appError: AppError): string {
    const errorId = this.generateErrorId();
    const enhancedError = {
      ...appError,
      technicalDetails: {
        ...appError.technicalDetails,
        errorId,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    console.error(`[ErrorService] ${errorId}:`, enhancedError);
    this.addToQueue(enhancedError);

    if (import.meta.env.DEV) {
      this.logToLocalStorage(enhancedError);
    }

    return errorId;
  }

  /**
   * Get user-friendly error message based on error type
   */
  getUserFriendlyMessage(error: Error | AppError): string {
    if ('userMessage' in error) {
      return error.userMessage;
    }

    // Default messages for common error patterns
    if (error.message.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    if (error.message.includes('timeout')) {
      return 'The operation took too long to complete. Please try again.';
    }

    if (error.message.includes('API key')) {
      return 'There was an issue with the API configuration. Please contact support.';
    }

    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }

  /**
   * Get error recovery options based on error type
   */
  getRecoveryOptions(error: Error | AppError): ErrorRecoveryOptions {
    const isRetryable = 'retryable' in error ? error.retryable : this.isRetryableError(error);

    return {
      canRetry: isRetryable,
      canGoBack: true,
      canReset: true,
      suggestedActions: this.getSuggestedActions(error)
    };
  }

  /**
   * Clear error queue (useful for testing or manual cleanup)
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Get current error queue (for debugging)
   */
  getErrorQueue(): AppError[] {
    return [...this.errorQueue];
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private logToLocalStorage(error: AppError): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(error);
      
      // Keep only last 50 errors in localStorage
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.warn('Failed to log error to localStorage:', e);
    }
  }

  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /503/,
      /502/,
      /500/,
      /rate limit/i,
      /temporary/i
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  private getSuggestedActions(error: Error | AppError): string[] {
    const actions: string[] = [];

    if (error.message.includes('Network Error')) {
      actions.push('Check your internet connection');
      actions.push('Try refreshing the page');
    }

    if (error.message.includes('timeout')) {
      actions.push('Try again with a smaller image');
      actions.push('Check your internet connection');
    }

    if (error.message.includes('API key')) {
      actions.push('Contact support for assistance');
    }

    if (error.message.includes('file') || error.message.includes('upload')) {
      actions.push('Try uploading a different image');
      actions.push('Ensure the image is in a supported format');
    }

    // Default actions if no specific ones apply
    if (actions.length === 0) {
      actions.push('Try refreshing the page');
      actions.push('Contact support if the problem persists');
    }

    return actions;
  }
}

export const errorService = ErrorService.getInstance();