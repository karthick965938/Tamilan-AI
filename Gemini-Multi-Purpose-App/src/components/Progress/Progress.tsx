import React from 'react';
import './Progress.css';

export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'linear' | 'circular';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  indeterminate?: boolean;
  style?: React.CSSProperties;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'medium',
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  label,
  animated = false,
  indeterminate = false,
  style
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  if (variant === 'circular') {
    const radius = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = indeterminate ? 0 : circumference - (percentage / 100) * circumference;
    const svgSize = (radius + 4) * 2;

    return (
      <div className={`progress-circular progress-${size} progress-${color}`} style={style}>
        <svg width={svgSize} height={svgSize} className="progress-svg">
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            className="progress-track"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            className={`progress-bar ${animated ? 'progress-animated' : ''} ${indeterminate ? 'progress-indeterminate' : ''}`}
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${radius + 4} ${radius + 4})`}
          />
        </svg>
        {showLabel && (
          <div className="progress-label-circular">
            {displayLabel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`progress-linear progress-${size} progress-${color}`} style={style}>
      {showLabel && (
        <div className="progress-label">
          {displayLabel}
        </div>
      )}
      <div className="progress-track-linear">
        <div 
          className={`progress-bar-linear ${animated ? 'progress-animated' : ''} ${indeterminate ? 'progress-indeterminate' : ''}`}
          style={{ 
            width: indeterminate ? '100%' : `${percentage}%`,
            transition: indeterminate ? 'none' : 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};