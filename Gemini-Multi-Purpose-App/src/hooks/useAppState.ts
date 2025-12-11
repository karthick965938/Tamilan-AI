import { useCallback } from 'react';
import { useAppContext } from './useAppContext';
import { StateActionType, UploadedImage, GenerationResult, UserPreferences, UsageStats } from '../types';
import { ProcessingState, ApiStatus } from '../types/enums';

/**
 * Custom hook for managing application state
 * Provides convenient methods for common state operations
 */
export const useAppState = () => {
  const { state, dispatch } = useAppContext();

  // Function selection
  const setCurrentFunction = useCallback((functionId: string) => {
    dispatch({
      type: StateActionType.SET_CURRENT_FUNCTION,
      payload: functionId
    });
  }, [dispatch]);

  // Processing state management
  const setProcessingState = useCallback((processingState: ProcessingState) => {
    dispatch({
      type: StateActionType.SET_PROCESSING_STATE,
      payload: processingState
    });
  }, [dispatch]);

  const startProcessing = useCallback(() => {
    setProcessingState(ProcessingState.PROCESSING);
  }, [setProcessingState]);

  const stopProcessing = useCallback(() => {
    setProcessingState(ProcessingState.IDLE);
  }, [setProcessingState]);

  // Image upload management
  const addUploadedImage = useCallback((image: UploadedImage) => {
    dispatch({
      type: StateActionType.ADD_UPLOADED_IMAGE,
      payload: image
    });
  }, [dispatch]);

  const removeUploadedImage = useCallback((imageId: string) => {
    dispatch({
      type: StateActionType.REMOVE_UPLOADED_IMAGE,
      payload: imageId
    });
  }, [dispatch]);

  const clearUploadedImages = useCallback(() => {
    dispatch({
      type: StateActionType.CLEAR_UPLOADED_IMAGES
    });
  }, [dispatch]);

  // Generation results
  const addGenerationResult = useCallback((result: GenerationResult) => {
    dispatch({
      type: StateActionType.ADD_GENERATION_RESULT,
      payload: result
    });
  }, [dispatch]);

  // API status management
  const setApiStatus = useCallback((status: ApiStatus) => {
    dispatch({
      type: StateActionType.SET_API_STATUS,
      payload: status
    });
  }, [dispatch]);

  // Error handling
  const setError = useCallback((error: string | null) => {
    dispatch({
      type: StateActionType.SET_ERROR,
      payload: error
    });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({
      type: StateActionType.CLEAR_ERROR
    });
  }, [dispatch]);

  // Progress tracking
  const setProgress = useCallback((progress: number) => {
    dispatch({
      type: StateActionType.SET_PROGRESS,
      payload: progress
    });
  }, [dispatch]);

  // User preferences
  const updateUserPreferences = useCallback((preferences: Partial<UserPreferences>) => {
    dispatch({
      type: StateActionType.UPDATE_USER_PREFERENCES,
      payload: preferences
    });
  }, [dispatch]);

  // Usage statistics
  const updateUsageStats = useCallback((stats: Partial<UsageStats>) => {
    dispatch({
      type: StateActionType.UPDATE_USAGE_STATS,
      payload: stats
    });
  }, [dispatch]);

  // History management
  const toggleFavorite = useCallback((historyId: string) => {
    dispatch({
      type: StateActionType.TOGGLE_FAVORITE,
      payload: historyId
    });
  }, [dispatch]);

  return {
    // State
    state,
    
    // Function selection
    setCurrentFunction,
    
    // Processing state
    setProcessingState,
    startProcessing,
    stopProcessing,
    
    // Image management
    addUploadedImage,
    removeUploadedImage,
    clearUploadedImages,
    
    // Generation results
    addGenerationResult,
    
    // API status
    setApiStatus,
    
    // Error handling
    setError,
    clearError,
    
    // Progress
    setProgress,
    
    // Preferences
    updateUserPreferences,
    
    // Usage stats
    updateUsageStats,
    
    // History
    toggleFavorite
  };
};