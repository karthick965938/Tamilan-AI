import { ApiStatus, ProcessingState } from './enums';
import { UploadedImage, GenerationResult } from './functionality';

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  autoSave: boolean;
  maxHistoryItems: number;
  defaultImageQuality: 'low' | 'medium' | 'high';
  enableNotifications: boolean;
}

/**
 * Generation history entry
 */
export interface GenerationHistory {
  id: string;
  functionType: string;
  timestamp: Date;
  inputImages: string[];
  result: GenerationResult;
  favorite: boolean;
}

/**
 * Usage statistics for API monitoring
 */
export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  lastRequestTime?: Date;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

/**
 * Main application state interface
 */
export interface AppState {
  currentFunction: string;
  isProcessing: boolean;
  processingState: ProcessingState;
  uploadedImages: UploadedImage[];
  generationHistory: GenerationHistory[];
  apiStatus: ApiStatus;
  userPreferences: UserPreferences;
  usageStats: UsageStats;
  error: string | null;
  progress: number;
}

/**
 * State action types for reducer
 */
export enum StateActionType {
  SET_CURRENT_FUNCTION = 'SET_CURRENT_FUNCTION',
  SET_PROCESSING_STATE = 'SET_PROCESSING_STATE',
  ADD_UPLOADED_IMAGE = 'ADD_UPLOADED_IMAGE',
  REMOVE_UPLOADED_IMAGE = 'REMOVE_UPLOADED_IMAGE',
  CLEAR_UPLOADED_IMAGES = 'CLEAR_UPLOADED_IMAGES',
  ADD_GENERATION_RESULT = 'ADD_GENERATION_RESULT',
  SET_API_STATUS = 'SET_API_STATUS',
  UPDATE_USER_PREFERENCES = 'UPDATE_USER_PREFERENCES',
  UPDATE_USAGE_STATS = 'UPDATE_USAGE_STATS',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  SET_PROGRESS = 'SET_PROGRESS',
  TOGGLE_FAVORITE = 'TOGGLE_FAVORITE',
  CLEANUP_HISTORY = 'CLEANUP_HISTORY'
}

/**
 * State action interface
 */
export interface StateAction {
  type: StateActionType;
  payload?: any;
}