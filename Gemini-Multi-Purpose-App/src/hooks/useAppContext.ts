import { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';

/**
 * Custom hook to access the app context
 * Throws an error if used outside of AppProvider
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};