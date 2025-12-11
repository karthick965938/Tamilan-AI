

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  maxFileSize: number;
}

/**
 * Gemini API request payload
 */
export interface GeminiApiRequest {
  prompt: string;
  imageData: string | string[];
  functionType: string;
  parameters?: Record<string, any>;
}

/**
 * Gemini API response
 */
export interface GeminiApiResponse {
  success: boolean;
  data?: {
    imageUrl?: string;
    imageUrls?: string[];
    annotations?: any[];
    metadata?: Record<string, any>;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  usage?: {
    tokensUsed: number;
    processingTime: number;
  };
}

/**
 * API error types
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * API error interface
 */
export interface ApiErrorData {
  type: ApiErrorType;
  message: string;
  code?: string;
  statusCode?: number;
  retryable: boolean;
  timestamp: Date;
  details?: any;
}

/**
 * API error class
 */
export class ApiError extends Error implements ApiErrorData {
  public type: ApiErrorType;
  public code?: string;
  public statusCode?: number;
  public retryable: boolean;
  public timestamp: Date;
  public details?: any;

  constructor(data: ApiErrorData) {
    super(data.message);
    this.name = 'ApiError';
    this.type = data.type;
    this.code = data.code;
    this.statusCode = data.statusCode;
    this.retryable = data.retryable;
    this.timestamp = data.timestamp;
    this.details = data.details;
  }
}

/**
 * File validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    size: number;
    type: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

/**
 * Image processing options
 */
export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}