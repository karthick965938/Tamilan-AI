import React, { useState, useEffect } from 'react';
import './ProcessingIndicator.css';

export interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress?: number; // 0-100
  message?: string;
  functionType?: string;
  timeout?: number; // in milliseconds
  onTimeout?: () => void;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  className?: string;
}

interface ProcessingStep {
  id: string;
  label: string;
  duration: number; // estimated duration in ms
}

const FUNCTIONALITY_STEPS: Record<string, ProcessingStep[]> = {
  'hairstyle-changer': [
    { id: 'upload', label: 'Uploading image...', duration: 1000 },
    { id: 'analyze', label: 'Analyzing portrait...', duration: 2000 },
    { id: 'generate', label: 'Generating hairstyles...', duration: 8000 },
    { id: 'render', label: 'Rendering results...', duration: 2000 }
  ],
  'ootd-generator': [
    { id: 'upload', label: 'Processing images...', duration: 1500 },
    { id: 'analyze', label: 'Analyzing person and clothing...', duration: 3000 },
    { id: 'generate', label: 'Creating OOTD photo...', duration: 10000 },
    { id: 'finalize', label: 'Finalizing result...', duration: 1500 }
  ],
  'clothing-changer': [
    { id: 'upload', label: 'Processing images...', duration: 1500 },
    { id: 'detect', label: 'Detecting person and pose...', duration: 2500 },
    { id: 'generate', label: 'Changing clothing...', duration: 9000 },
    { id: 'blend', label: 'Blending with environment...', duration: 2000 }
  ],
  'explosive-food': [
    { id: 'upload', label: 'Analyzing food product...', duration: 1000 },
    { id: 'identify', label: 'Identifying ingredients...', duration: 2000 },
    { id: 'generate', label: 'Creating explosive scene...', duration: 7000 },
    { id: 'enhance', label: 'Enhancing visual effects...', duration: 2000 }
  ],
  'fashion-moodboard': [
    { id: 'upload', label: 'Processing reference image...', duration: 1000 },
    { id: 'extract', label: 'Extracting fashion elements...', duration: 3000 },
    { id: 'create', label: 'Creating mood board...', duration: 6000 },
    { id: 'annotate', label: 'Adding annotations...', duration: 2000 }
  ],
  'product-packaging': [
    { id: 'upload', label: 'Processing design and packaging...', duration: 1500 },
    { id: 'analyze', label: 'Analyzing design elements...', duration: 2000 },
    { id: 'apply', label: 'Applying design to packaging...', duration: 8000 },
    { id: 'render', label: 'Rendering final product...', duration: 2500 }
  ],
  'calorie-annotator': [
    { id: 'upload', label: 'Analyzing food image...', duration: 1000 },
    { id: 'identify', label: 'Identifying food items...', duration: 4000 },
    { id: 'calculate', label: 'Calculating nutritional info...', duration: 3000 },
    { id: 'annotate', label: 'Adding annotations...', duration: 2000 }
  ],
  'id-photo-creator': [
    { id: 'upload', label: 'Processing portrait...', duration: 1000 },
    { id: 'detect', label: 'Detecting face and features...', duration: 2000 },
    { id: 'crop', label: 'Cropping to ID format...', duration: 1500 },
    { id: 'enhance', label: 'Enhancing for professional look...', duration: 3500 }
  ],
  'comic-book-creator': [
    { id: 'upload', label: 'Processing reference image...', duration: 1000 },
    { id: 'analyze', label: 'Analyzing characters and scene...', duration: 3000 },
    { id: 'generate', label: 'Creating comic panels...', duration: 12000 },
    { id: 'text', label: 'Adding dialogue and effects...', duration: 3000 }
  ],
  'movie-storyboard': [
    { id: 'upload', label: 'Processing character reference...', duration: 1000 },
    { id: 'plan', label: 'Planning story sequence...', duration: 2000 },
    { id: 'generate', label: 'Creating 12-part storyboard...', duration: 15000 },
    { id: 'style', label: 'Applying film noir style...', duration: 3000 }
  ],
  'default': [
    { id: 'upload', label: 'Uploading...', duration: 1000 },
    { id: 'process', label: 'Processing...', duration: 5000 },
    { id: 'generate', label: 'Generating result...', duration: 8000 },
    { id: 'finalize', label: 'Finalizing...', duration: 1000 }
  ]
};

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isProcessing,
  progress,
  message,
  functionType = 'default',
  timeout = 60000, // 60 seconds default
  onTimeout,
  showProgress = true,
  size = 'medium',
  variant = 'spinner',
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [estimatedProgress, setEstimatedProgress] = useState(0);

  const steps = FUNCTIONALITY_STEPS[functionType] || FUNCTIONALITY_STEPS.default;
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  // Handle timeout
  useEffect(() => {
    if (!isProcessing) {
      setHasTimedOut(false);
      setElapsedTime(0);
      setCurrentStep(0);
      setEstimatedProgress(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isProcessing) {
        setHasTimedOut(true);
        onTimeout?.();
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isProcessing, timeout, onTimeout]);

  // Handle step progression and time tracking
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newElapsed = prev + 100;

        // Calculate estimated progress based on elapsed time
        const progressPercent = Math.min((newElapsed / totalDuration) * 100, 95);
        setEstimatedProgress(progressPercent);

        // Update current step based on elapsed time
        let accumulatedTime = 0;
        for (let i = 0; i < steps.length; i++) {
          accumulatedTime += steps[i].duration;
          if (newElapsed < accumulatedTime) {
            setCurrentStep(i);
            break;
          }
        }

        return newElapsed;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing, steps, totalDuration]);

  if (!isProcessing) return null;

  const currentStepData = steps[currentStep];
  const displayMessage = message || currentStepData?.label || 'Processing...';
  const displayProgress = progress !== undefined ? progress : estimatedProgress;

  const renderSpinner = () => (
    <div className={`spinner ${size}`}>
      <div className="spinner-ring"></div>
    </div>
  );

  const renderDots = () => (
    <div className={`dots ${size}`}>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`pulse ${size}`}>
      <div className="pulse-ring"></div>
      <div className="pulse-ring"></div>
      <div className="pulse-ring"></div>
    </div>
  );

  const renderBars = () => (
    <div className={`bars ${size}`}>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
    </div>
  );

  const renderAnimation = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'bars': return renderBars();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`processing-indicator ${size} ${hasTimedOut ? 'timeout' : ''} ${className}`}>
      <div className="processing-content">
        {/* Header: Spinner + Message */}
        <div className="processing-header">
          <div className="processing-animation-compact">
            {renderAnimation()}
          </div>
          <div className="processing-info">
            <h3 className="processing-title">{message || 'Processing...'}</h3>
            {/* Show current step label here */}
            {currentStepData && (
              <p className="processing-step">{currentStepData.label}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="progress-container-compact">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${displayProgress}%` }}
              ></div>
            </div>
            <div className="progress-meta">
              <span className="progress-percentage">{Math.round(displayProgress)}%</span>
              <div className="time-indicator-compact">
                {!hasTimedOut && (
                  <span className="estimated-time">
                    ~{Math.floor((totalDuration - elapsedTime) / 1000)}s left
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {hasTimedOut && (
          <p className="timeout-message-compact">
            Taking longer than expected...
          </p>
        )}
      </div>
    </div>
  );
};