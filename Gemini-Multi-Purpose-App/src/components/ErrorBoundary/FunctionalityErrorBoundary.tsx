import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorRecoveryOptions } from '../../types/errors';

interface Props {
  children: React.ReactNode;
  functionalityName: string;
  onRetry?: () => void;
  onReset?: () => void;
}

/**
 * Specialized error boundary for functionality components
 * Provides functionality-specific error handling and recovery
 */
export const FunctionalityErrorBoundary: React.FC<Props> = ({
  children,
  functionalityName,
  onRetry,
  onReset
}) => {
  const handleError = (error: Error, errorInfo: any, errorId: string) => {
    // Log functionality-specific context
    console.error(`[${functionalityName}] Error:`, {
      error,
      errorInfo,
      errorId,
      functionality: functionalityName
    });
  };

  const renderFallback = (error: Error, errorId: string, recoveryOptions: ErrorRecoveryOptions) => {
    return (
      <div className="functionality-error">
        <div className="functionality-error-content">
          <div className="error-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="#dc3545" strokeWidth="2"/>
              <circle cx="12" cy="16" r="1" fill="#dc3545"/>
            </svg>
          </div>

          <h3>{functionalityName} Error</h3>
          <p>There was an issue with the {functionalityName.toLowerCase()} functionality.</p>

          {error.message.includes('API') && (
            <div className="error-hint">
              <p><strong>Possible causes:</strong></p>
              <ul>
                <li>API service is temporarily unavailable</li>
                <li>Network connectivity issues</li>
                <li>Rate limiting or quota exceeded</li>
              </ul>
            </div>
          )}

          {error.message.includes('file') && (
            <div className="error-hint">
              <p><strong>Possible causes:</strong></p>
              <ul>
                <li>Invalid file format or corrupted image</li>
                <li>File size too large</li>
                <li>Unsupported image type</li>
              </ul>
            </div>
          )}

          <div className="functionality-error-actions">
            {onRetry && recoveryOptions.canRetry && (
              <button onClick={onRetry} className="btn-primary">
                Try Again
              </button>
            )}
            
            {onReset && (
              <button onClick={onReset} className="btn-secondary">
                Reset {functionalityName}
              </button>
            )}

            <button 
              onClick={() => window.location.reload()} 
              className="btn-secondary"
            >
              Reload App
            </button>
          </div>

          <div className="error-support">
            <span className="error-id">Error ID: {errorId}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={renderFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};