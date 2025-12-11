// Test file to verify type definitions work correctly
import {
  InputType,
  OutputFormat,
  ApiStatus,
  ProcessingState,
  FunctionalityConfig,
  UploadedImage,
  GenerationResult,

  StateActionType,
  ApiError,
  ApiErrorType,
  ValidationResult
} from './index';

// Test enum usage
const testInputType: InputType = InputType.SINGLE_IMAGE;
const testOutputFormat: OutputFormat = OutputFormat.GRID_3X3;
const testApiStatus: ApiStatus = ApiStatus.LOADING;
const testProcessingState: ProcessingState = ProcessingState.PROCESSING;

// Test interface usage
const testFunctionalityConfig: FunctionalityConfig = {
  id: 'hairstyle-changer',
  name: 'Hairstyle Changer',
  description: 'Change hairstyles on portrait images',
  icon: 'hair-icon',
  inputTypes: [InputType.PORTRAIT_IMAGE],
  promptTemplate: 'Change hairstyle in this portrait',
  outputFormat: OutputFormat.GRID_3X3,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFormats: ['jpg', 'jpeg', 'png'],
  maxFiles: 1
};

const testUploadedImage: UploadedImage = {
  id: 'img-1',
  file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
  preview: 'data:image/jpeg;base64,test',
  type: 'primary',
  name: 'test.jpg',
  size: 1024,
  uploadedAt: new Date()
};

const testGenerationResult: GenerationResult = {
  success: true,
  imageUrls: ['url1', 'url2', 'url3'],
  metadata: {
    functionType: 'hairstyle-changer',
    processingTime: 5000,
    timestamp: new Date(),
    inputImageCount: 1
  }
};

const testApiError = new ApiError({
  type: ApiErrorType.RATE_LIMIT_ERROR,
  message: 'Rate limit exceeded',
  retryable: true,
  timestamp: new Date()
});

const testValidationResult: ValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
  fileInfo: {
    size: 1024,
    type: 'image/jpeg',
    dimensions: {
      width: 800,
      height: 600
    }
  }
};

// Test state action
const testStateAction = {
  type: StateActionType.SET_CURRENT_FUNCTION,
  payload: 'hairstyle-changer'
};

// Export test objects to prevent unused variable warnings
export {
  testInputType,
  testOutputFormat,
  testApiStatus,
  testProcessingState,
  testFunctionalityConfig,
  testUploadedImage,
  testGenerationResult,
  testApiError,
  testValidationResult,
  testStateAction
};