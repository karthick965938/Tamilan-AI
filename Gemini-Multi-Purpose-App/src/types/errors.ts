import { ApiErrorType } from './api';

/**
 * Base error interface
 */
export interface BaseError {
  message: string;
  timestamp: Date;
  stack?: string;
}

/**
 * File upload error types
 */
export enum FileUploadErrorType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  TOO_MANY_FILES = 'TOO_MANY_FILES',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

/**
 * File upload error interface
 */
export interface FileUploadError extends BaseError {
  type: FileUploadErrorType;
  fileName: string;
  fileSize?: number;
  maxSize?: number;
  supportedFormats?: string[];
}

/**
 * Processing error types
 */
export enum ProcessingErrorType {
  IMAGE_PROCESSING_FAILED = 'IMAGE_PROCESSING_FAILED',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',
  INVALID_PROMPT = 'INVALID_PROMPT',
  INSUFFICIENT_QUALITY = 'INSUFFICIENT_QUALITY',
  CONTENT_POLICY_VIOLATION = 'CONTENT_POLICY_VIOLATION'
}

/**
 * Processing error interface
 */
export interface ProcessingError extends BaseError {
  type: ProcessingErrorType;
  functionType: string;
  retryable: boolean;
  suggestedAction?: string;
}

/**
 * Application error interface
 */
export interface AppError extends BaseError {
  type: ApiErrorType | FileUploadErrorType | ProcessingErrorType | 'UNKNOWN_ERROR';
  code?: string;
  retryable: boolean;
  userMessage: string;
  technicalDetails?: any;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string;
  } | null;
  errorId: string;
}

/**
 * Error recovery options
 */
export interface ErrorRecoveryOptions {
  canRetry: boolean;
  canGoBack: boolean;
  canReset: boolean;
  suggestedActions: string[];
}