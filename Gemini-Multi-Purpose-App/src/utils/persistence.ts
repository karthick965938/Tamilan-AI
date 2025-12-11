import { UserPreferences, GenerationHistory, UsageStats } from '../types';

/**
 * Keys for localStorage
 */
const STORAGE_KEYS = {
  USER_PREFERENCES: 'ai_image_generator_preferences',
  GENERATION_HISTORY: 'ai_image_generator_history',
  USAGE_STATS: 'ai_image_generator_usage',
  CURRENT_FUNCTION: 'ai_image_generator_current_function'
} as const;

/**
 * Persisted state interface
 */
export interface PersistedState {
  currentFunction?: string;
  generationHistory?: GenerationHistory[];
  userPreferences?: UserPreferences;
  usageStats?: UsageStats;
}

/**
 * Load persisted state from localStorage
 */
export const loadPersistedState = (): PersistedState => {
  try {
    const persistedState: PersistedState = {};

    // Load current function
    const currentFunction = localStorage.getItem(STORAGE_KEYS.CURRENT_FUNCTION);
    if (currentFunction) {
      persistedState.currentFunction = currentFunction;
    }

    // Load user preferences
    const preferencesData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (preferencesData) {
      persistedState.userPreferences = JSON.parse(preferencesData);
    }

    // Load generation history
    const historyData = localStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
    if (historyData) {
      const parsedHistory = JSON.parse(historyData);
      // Convert timestamp strings back to Date objects
      persistedState.generationHistory = parsedHistory.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        result: {
          ...item.result,
          metadata: item.result.metadata ? {
            ...item.result.metadata,
            timestamp: new Date(item.result.metadata.timestamp)
          } : undefined
        }
      }));
    }

    // Load usage stats
    const usageData = localStorage.getItem(STORAGE_KEYS.USAGE_STATS);
    if (usageData) {
      const parsedUsage = JSON.parse(usageData);
      persistedState.usageStats = {
        ...parsedUsage,
        lastRequestTime: parsedUsage.lastRequestTime ? new Date(parsedUsage.lastRequestTime) : undefined,
        rateLimitReset: parsedUsage.rateLimitReset ? new Date(parsedUsage.rateLimitReset) : undefined
      };
    }

    return persistedState;
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
    return {};
  }
};

/**
 * Persist state to localStorage
 */
export const persistState = (state: PersistedState): void => {
  try {
    // Persist current function
    if (state.currentFunction) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_FUNCTION, state.currentFunction);
    }

    // Persist user preferences
    if (state.userPreferences) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(state.userPreferences));
    }

    // Persist generation history (limit to prevent localStorage overflow)
    if (state.generationHistory) {
      const historyToStore = state.generationHistory.slice(0, 100); // Keep only last 100 items
      localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(historyToStore));
    }

    // Persist usage stats
    if (state.usageStats) {
      localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(state.usageStats));
    }
  } catch (error) {
    console.warn('Failed to persist state:', error);
    // If localStorage is full, try to clear old data
    if (error instanceof DOMException && error.code === 22) {
      clearOldData();
    }
  }
};

/**
 * Clear old data from localStorage to free up space
 */
const clearOldData = (): void => {
  try {
    // Clear generation history first as it's likely the largest
    localStorage.removeItem(STORAGE_KEYS.GENERATION_HISTORY);
    
    // Reset usage stats
    const basicUsageStats: UsageStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageProcessingTime: 0
    };
    localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(basicUsageStats));
    
    console.warn('Cleared old data due to storage limit');
  } catch (error) {
    console.error('Failed to clear old data:', error);
  }
};

/**
 * Clear all persisted data
 */
export const clearPersistedState = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear persisted state:', error);
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): { used: number; available: number } => {
  try {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Rough estimate of available space (most browsers limit to ~5-10MB)
    const estimated = 5 * 1024 * 1024; // 5MB estimate
    
    return {
      used,
      available: Math.max(0, estimated - used)
    };
  } catch (error) {
    return { used: 0, available: 0 };
  }
};