import { useMemo, useCallback } from 'react';
import { useAppState } from './useAppState';
import { GenerationHistory } from '../types';

/**
 * Custom hook for managing generation history
 */
export const useGenerationHistory = () => {
  const { state, toggleFavorite } = useAppState();

  /**
   * Get filtered and sorted history
   */
  const getFilteredHistory = useCallback((
    functionType?: string,
    favoritesOnly: boolean = false,
    limit?: number
  ): GenerationHistory[] => {
    let filtered = state.generationHistory;

    // Filter by function type
    if (functionType) {
      filtered = filtered.filter(item => item.functionType === functionType);
    }

    // Filter favorites only
    if (favoritesOnly) {
      filtered = filtered.filter(item => item.favorite);
    }

    // Sort by timestamp (newest first)
    filtered = filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [state.generationHistory]);

  /**
   * Get recent history for current function
   */
  const recentHistory = useMemo(() => 
    getFilteredHistory(state.currentFunction, false, 10),
    [getFilteredHistory, state.currentFunction]
  );

  /**
   * Get favorite items
   */
  const favoriteHistory = useMemo(() => 
    getFilteredHistory(undefined, true),
    [getFilteredHistory]
  );

  /**
   * Get history statistics
   */
  const historyStats = useMemo(() => {
    const total = state.generationHistory.length;
    const successful = state.generationHistory.filter(item => item.result.success).length;
    const failed = total - successful;
    const favorites = state.generationHistory.filter(item => item.favorite).length;
    
    // Group by function type
    const byFunction = state.generationHistory.reduce((acc, item) => {
      acc[item.functionType] = (acc[item.functionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      successful,
      failed,
      favorites,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      byFunction
    };
  }, [state.generationHistory]);

  /**
   * Search history by content
   */
  const searchHistory = useCallback((query: string): GenerationHistory[] => {
    if (!query.trim()) {
      return state.generationHistory;
    }

    const lowerQuery = query.toLowerCase();
    return state.generationHistory.filter(item => 
      item.functionType.toLowerCase().includes(lowerQuery) ||
      (item.result.metadata?.promptUsed?.toLowerCase().includes(lowerQuery))
    );
  }, [state.generationHistory]);

  /**
   * Get history item by ID
   */
  const getHistoryItem = useCallback((id: string): GenerationHistory | undefined => {
    return state.generationHistory.find(item => item.id === id);
  }, [state.generationHistory]);

  /**
   * Toggle favorite status
   */
  const handleToggleFavorite = useCallback((historyId: string) => {
    toggleFavorite(historyId);
  }, [toggleFavorite]);

  /**
   * Download generation result
   */
  const downloadResult = useCallback(async (historyItem: GenerationHistory): Promise<void> => {
    try {
      const { result } = historyItem;
      
      if (result.imageUrl) {
        // Single image download
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `generated_${historyItem.functionType}_${historyItem.timestamp.getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (result.imageUrls && result.imageUrls.length > 0) {
        // Multiple images download (zip would be ideal, but for now download individually)
        for (let i = 0; i < result.imageUrls.length; i++) {
          const link = document.createElement('a');
          link.href = result.imageUrls[i];
          link.download = `generated_${historyItem.functionType}_${historyItem.timestamp.getTime()}_${i + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Small delay between downloads
          if (i < result.imageUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    } catch (error) {
      console.error('Failed to download result:', error);
    }
  }, []);

  return {
    // History data
    allHistory: state.generationHistory,
    recentHistory,
    favoriteHistory,
    historyStats,
    
    // Actions
    getFilteredHistory,
    searchHistory,
    getHistoryItem,
    handleToggleFavorite,
    downloadResult
  };
};