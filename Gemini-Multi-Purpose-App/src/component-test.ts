// Simple test to verify components can be imported without errors
import { 
  OutputDisplay, 
  GridDisplay, 
  AnnotatedImageDisplay, 
  ComicStripDisplay, 
  StoryboardDisplay, 
  MoodboardDisplay 
} from './components/OutputDisplay';

import { GenerationResult } from './types';
import { ApiError, ApiErrorType } from './types/api';

// Test that types work correctly
const testResult: GenerationResult = {
  success: true,
  imageUrl: 'test.jpg',
  metadata: {
    functionType: 'test',
    processingTime: 1000,
    timestamp: new Date(),
    inputImageCount: 1
  }
};

// Test that ApiError class works
const testError = new ApiError({
  type: ApiErrorType.VALIDATION_ERROR,
  message: 'Test error',
  retryable: false,
  timestamp: new Date()
});

console.log('Components imported successfully');
console.log('Test result:', testResult);
console.log('Test error:', testError);

export { 
  OutputDisplay, 
  GridDisplay, 
  AnnotatedImageDisplay, 
  ComicStripDisplay, 
  StoryboardDisplay, 
  MoodboardDisplay,
  testResult,
  testError
};