import { AppState, StateAction, StateActionType, GenerationHistory } from '../types';
import { ProcessingState } from '../types/enums';

/**
 * App state reducer function
 */
export const appReducer = (state: AppState, action: StateAction): AppState => {
  switch (action.type) {
    case StateActionType.SET_CURRENT_FUNCTION:
      return {
        ...state,
        currentFunction: action.payload,
        // Clear uploaded images and errors when switching functions
        uploadedImages: [],
        error: null,
        progress: 0,
        processingState: ProcessingState.IDLE
      };

    case StateActionType.SET_PROCESSING_STATE:
      return {
        ...state,
        processingState: action.payload,
        isProcessing: action.payload === ProcessingState.PROCESSING || action.payload === ProcessingState.UPLOADING,
        // Clear error when starting new processing
        error: action.payload === ProcessingState.PROCESSING ? null : state.error
      };

    case StateActionType.ADD_UPLOADED_IMAGE:
      return {
        ...state,
        uploadedImages: [...state.uploadedImages, action.payload],
        error: null
      };

    case StateActionType.REMOVE_UPLOADED_IMAGE:
      return {
        ...state,
        uploadedImages: state.uploadedImages.filter(img => img.id !== action.payload)
      };

    case StateActionType.CLEAR_UPLOADED_IMAGES:
      return {
        ...state,
        uploadedImages: []
      };

    case StateActionType.ADD_GENERATION_RESULT:
      const newHistoryItem: GenerationHistory = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        functionType: state.currentFunction,
        timestamp: new Date(),
        inputImages: state.uploadedImages.map(img => img.preview),
        result: action.payload,
        favorite: false
      };

      return {
        ...state,
        generationHistory: [newHistoryItem, ...state.generationHistory],
        processingState: action.payload.success ? ProcessingState.COMPLETED : ProcessingState.FAILED,
        isProcessing: false,
        progress: 100,
        error: action.payload.success ? null : action.payload.error || 'Generation failed',
        // Update usage stats
        usageStats: {
          ...state.usageStats,
          totalRequests: state.usageStats.totalRequests + 1,
          successfulRequests: action.payload.success 
            ? state.usageStats.successfulRequests + 1 
            : state.usageStats.successfulRequests,
          failedRequests: action.payload.success 
            ? state.usageStats.failedRequests 
            : state.usageStats.failedRequests + 1,
          lastRequestTime: new Date(),
          averageProcessingTime: action.payload.metadata?.processingTime 
            ? (state.usageStats.averageProcessingTime + action.payload.metadata.processingTime) / 2
            : state.usageStats.averageProcessingTime
        }
      };

    case StateActionType.SET_API_STATUS:
      return {
        ...state,
        apiStatus: action.payload
      };

    case StateActionType.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };

    case StateActionType.UPDATE_USAGE_STATS:
      return {
        ...state,
        usageStats: {
          ...state.usageStats,
          ...action.payload
        }
      };

    case StateActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        processingState: ProcessingState.FAILED,
        isProcessing: false
      };

    case StateActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case StateActionType.SET_PROGRESS:
      return {
        ...state,
        progress: Math.max(0, Math.min(100, action.payload))
      };

    case StateActionType.TOGGLE_FAVORITE:
      return {
        ...state,
        generationHistory: state.generationHistory.map(item =>
          item.id === action.payload
            ? { ...item, favorite: !item.favorite }
            : item
        )
      };

    case StateActionType.CLEANUP_HISTORY:
      const maxItems = action.payload;
      const sortedHistory = [...state.generationHistory].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return {
        ...state,
        generationHistory: sortedHistory.slice(0, maxItems)
      };

    default:
      return state;
  }
};