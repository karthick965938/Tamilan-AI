// Context hooks
export { useAppContext } from './useAppContext';
export { useAppState } from './useAppState';

// Feature-specific hooks
export { useImageUpload } from './useImageUpload';
export { useGenerationHistory } from './useGenerationHistory';

// Responsive hooks
export { 
  useResponsive, 
  useReducedMotion, 
  useHighContrast, 
  useDarkMode,
  getResponsiveClasses 
} from './useResponsive';

// Touch gesture hooks
export { useTouchGestures, usePinchZoom } from './useTouchGestures';