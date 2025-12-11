import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryState, ErrorRecoveryOptions } from '../../types/errors';
import { errorService } from '../../services';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorId: string, recoveryOptions: ErrorRecoveryOptions) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
}

interface State extends ErrorBoundaryState {
  retryCount: number;
  recoveryOptions: ErrorRecoveryOptions;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      recoveryOptions: {
        canRetry: true,
        canGoBack: true,
        canReset: true,
        suggestedActions: []
      }
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error and get error ID
    const errorId = errorService.logError(error, {
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    // Get recovery options
    const recoveryOptions = errorService.getRecoveryOptions(error);

    // Update state with error details
    this.setState({
      error,
      errorInfo: {
        componentStack: errorInfo.componentStack || ''
      },
      errorId,
      recoveryOptions
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }

    // Auto-retry for retryable errors (with exponential backoff)
    if (recoveryOptions.canRetry && this.state.retryCount < this.maxRetries) {
      const delay = Math.pow(2, this.state.retryCount) * 1000; // 1s, 2s, 4s
      this.retryTimeout = window.setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: prevState.retryCount + 1,
      recoveryOptions: {
        canRetry: true,
        canGoBack: true,
        canReset: true,
        suggestedActions: []
      }
    }));
  };

  handleReset = () => {
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      recoveryOptions: {
        canRetry: true,
        canGoBack: true,
        canReset: true,
        suggestedActions: []
      }
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.handleReset();
    }
  };

  handleReportError = () => {
    if (this.state.error && this.state.errorId) {
      // In a real app, this would send the error to a reporting service
      const errorReport = {
        errorId: this.state.errorId,
        message: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo?.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      // For now, copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert('Error report copied to clipboard. Please send this to support.');
        })
        .catch(() => {
          console.log('Error report:', errorReport);
          alert('Error report logged to console. Please check the browser console and send the details to support.');
        });
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorId, this.state.recoveryOptions);
      }

      const userMessage = errorService.getUserFriendlyMessage(this.state.error);
      const canRetry = this.state.recoveryOptions.canRetry && this.state.retryCount < this.maxRetries;

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="#dc3545" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="#dc3545" strokeWidth="2"/>
              </svg>
            </div>

            <h1>Something went wrong</h1>
            <p className="error-message">{userMessage}</p>

            {this.state.recoveryOptions.suggestedActions.length > 0 && (
              <div className="suggested-actions">
                <h3>Try these steps:</h3>
                <ul>
                  {this.state.recoveryOptions.suggestedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="error-actions">
              {canRetry && (
                <button onClick={this.handleRetry} className="btn-primary">
                  Try Again {this.state.retryCount > 0 && `(${this.state.retryCount}/${this.maxRetries})`}
                </button>
              )}
              
              {this.state.recoveryOptions.canReset && (
                <button onClick={this.handleReset} className="btn-secondary">
                  Reset
                </button>
              )}

              {this.state.recoveryOptions.canGoBack && (
                <button onClick={this.handleGoBack} className="btn-secondary">
                  Go Back
                </button>
              )}

              <button onClick={this.handleReload} className="btn-secondary">
                Reload Page
              </button>
            </div>

            <div className="error-support">
              <button onClick={this.handleReportError} className="btn-link">
                Report this error
              </button>
              <span className="error-id">Error ID: {this.state.errorId}</span>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <div className="error-info">
                  <div className="error-section">
                    <h4>Error Message:</h4>
                    <pre>{this.state.error.toString()}</pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div className="error-section">
                      <h4>Stack Trace:</h4>
                      <pre className="error-stack">{this.state.error.stack}</pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div className="error-section">
                      <h4>Component Stack:</h4>
                      <pre className="error-stack">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}

                  <div className="error-section">
                    <h4>Error Context:</h4>
                    <pre>{JSON.stringify({
                      errorId: this.state.errorId,
                      retryCount: this.state.retryCount,
                      recoveryOptions: this.state.recoveryOptions,
                      userAgent: navigator.userAgent,
                      url: window.location.href
                    }, null, 2)}</pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}