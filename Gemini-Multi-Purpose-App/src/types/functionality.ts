import { InputType, OutputFormat } from './enums';

/**
 * Configuration interface for each functionality
 */
export interface FunctionalityConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  inputTypes: InputType[];
  promptTemplate: string;
  outputFormat: OutputFormat;
  maxFileSize: number;
  supportedFormats: string[];
  maxFiles?: number;
  instructions?: string;
}

/**
 * Uploaded image interface
 */
export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'primary' | 'reference';
  name: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Generation metadata
 */
export interface GenerationMetadata {
  functionType: string;
  processingTime: number;
  timestamp: Date;
  inputImageCount: number;
  promptUsed?: string;
  apiVersion?: string;
}

/**
 * Generation result interface
 */
export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  error?: string;
  metadata?: GenerationMetadata;
  annotations?: ImageAnnotation[];
}

/**
 * Image annotation for calorie counter functionality
 */
export interface ImageAnnotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  foodName: string;
  calories: number;
  caloriesPerGram?: number;
  confidence: number;
}