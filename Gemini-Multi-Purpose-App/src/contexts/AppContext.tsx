import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, StateAction, StateActionType, UserPreferences, UsageStats } from '../types';
import { ApiStatus, ProcessingState } from '../types/enums';
import { appReducer } from './appReducer';
import { loadPersistedState, persistState } from '../utils/persistence';

/**
 * Initial user preferences
 */
const initialUserPreferences: UserPreferences = {
  theme: 'light',
  autoSave: true,
  maxHistoryItems: 50,
  defaultImageQuality: 'medium',
  enableNotifications: true
};

/**
 * Initial usage statistics
 */
const initialUsageStats: UsageStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageProcessingTime: 0
};

/**
 * Initial application state
 */
const initialState: AppState = {
  currentFunction: 'hairstyle-changer',
  isProcessing: false,
  processingState: ProcessingState.IDLE,
  uploadedImages: [],
  generationHistory: [],
  apiStatus: ApiStatus.IDLE,
  userPreferences: initialUserPreferences,
  usageStats: initialUsageStats,
  error: null,
  progress: 0
};

/**
 * App context interface
 */
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<StateAction>;
}

/**
 * App context
 */
export const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App provider props
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * App context provider component
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Load persisted state on initialization
  const persistedState = loadPersistedState();
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    ...persistedState,
    // Reset processing states on app load
    isProcessing: false,
    processingState: ProcessingState.IDLE,
    error: null,
    progress: 0
  });

  // Persist state changes
  useEffect(() => {
    const stateToPersist = {
      currentFunction: state.currentFunction,
      generationHistory: state.generationHistory,
      userPreferences: state.userPreferences,
      usageStats: state.usageStats
    };
    persistState(stateToPersist);
  }, [state.currentFunction, state.generationHistory, state.userPreferences, state.usageStats]);

  // Auto-cleanup old history items based on user preferences
  useEffect(() => {
    if (state.generationHistory.length > state.userPreferences.maxHistoryItems) {
      dispatch({
        type: StateActionType.CLEANUP_HISTORY,
        payload: state.userPreferences.maxHistoryItems
      });
    }
  }, [state.generationHistory.length, state.userPreferences.maxHistoryItems]);

  const contextValue: AppContextType = {
    state,
    dispatch
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};