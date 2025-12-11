/**
 * Input types for different functionalities
 */
export enum InputType {
  SINGLE_IMAGE = 'single_image',
  DUAL_IMAGE = 'dual_image',
  PORTRAIT_IMAGE = 'portrait_image'
}

/**
 * Output formats for generated results
 */
export enum OutputFormat {
  SINGLE_IMAGE = 'single_image',
  GRID_3X3 = 'grid_3x3',
  ANNOTATED_IMAGE = 'annotated_image',
  COMIC_STRIP = 'comic_strip',
  STORYBOARD = 'storyboard'
}

/**
 * API status states
 */
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited'
}

/**
 * Processing states for image generation
 */
export enum ProcessingState {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}