# Global State Management

This directory contains the global state management implementation using React Context API and useReducer.

## Overview

The state management system provides:
- Centralized application state
- Type-safe state updates
- Automatic state persistence
- Custom hooks for common operations
- Optimized re-renders

## Architecture

```
contexts/
├── AppContext.tsx      # Main context provider
├── appReducer.ts       # State reducer with actions
└── index.ts           # Exports

hooks/
├── useAppContext.ts    # Basic context access
├── useAppState.ts      # State management operations
├── useImageUpload.ts   # Image upload operations
├── useGenerationHistory.ts # History management
└── index.ts           # Exports

utils/
├── persistence.ts      # localStorage utilities
└── index.ts           # Exports
```

## Usage

### 1. Wrap your app with AppProvider

```tsx
import { AppProvider } from './contexts';

function App() {
  return (
    <AppProvider>
      <YourAppContent />
    </AppProvider>
  );
}
```

### 2. Use state management hooks

```tsx
import { useAppState } from './hooks';

function MyComponent() {
  const { 
    state, 
    setCurrentFunction, 
    startProcessing, 
    addUploadedImage 
  } = useAppState();

  return (
    <div>
      <p>Current function: {state.currentFunction}</p>
      <button onClick={() => setCurrentFunction('hairstyle-changer')}>
        Switch Function
      </button>
    </div>
  );
}
```

### 3. Handle image uploads

```tsx
import { useImageUpload } from './hooks';

function ImageUploader() {
  const { 
    uploadedImages, 
    handleFileUpload, 
    validateFile 
  } = useImageUpload();

  const onFileSelect = async (file: File) => {
    const validation = validateFile(file);
    if (validation.valid) {
      await handleFileUpload(file);
    } else {
      alert(validation.error);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
      <p>Uploaded: {uploadedImages.length} images</p>
    </div>
  );
}
```

### 4. Manage generation history

```tsx
import { useGenerationHistory } from './hooks';

function HistoryView() {
  const { 
    recentHistory, 
    historyStats, 
    handleToggleFavorite 
  } = useGenerationHistory();

  return (
    <div>
      <h3>Stats: {historyStats.total} total, {historyStats.successRate.toFixed(1)}% success</h3>
      {recentHistory.map(item => (
        <div key={item.id}>
          <span>{item.functionType} - {item.timestamp.toLocaleString()}</span>
          <button onClick={() => handleToggleFavorite(item.id)}>
            {item.favorite ? '⭐' : '☆'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## State Structure

```typescript
interface AppState {
  currentFunction: string;           // Active functionality
  isProcessing: boolean;            // Processing status
  processingState: ProcessingState; // Detailed processing state
  uploadedImages: UploadedImage[];  // Uploaded images
  generationHistory: GenerationHistory[]; // Generation history
  apiStatus: ApiStatus;             // API connection status
  userPreferences: UserPreferences; // User settings
  usageStats: UsageStats;          // Usage statistics
  error: string | null;            // Current error
  progress: number;                // Processing progress (0-100)
}
```

## Available Actions

- `SET_CURRENT_FUNCTION` - Switch active functionality
- `SET_PROCESSING_STATE` - Update processing state
- `ADD_UPLOADED_IMAGE` - Add uploaded image
- `REMOVE_UPLOADED_IMAGE` - Remove uploaded image
- `CLEAR_UPLOADED_IMAGES` - Clear all uploaded images
- `ADD_GENERATION_RESULT` - Add generation result to history
- `SET_API_STATUS` - Update API status
- `UPDATE_USER_PREFERENCES` - Update user preferences
- `UPDATE_USAGE_STATS` - Update usage statistics
- `SET_ERROR` / `CLEAR_ERROR` - Error management
- `SET_PROGRESS` - Update progress
- `TOGGLE_FAVORITE` - Toggle favorite status
- `CLEANUP_HISTORY` - Clean old history items

## Persistence

The system automatically persists:
- Current function selection
- User preferences
- Generation history (last 100 items)
- Usage statistics

Data is stored in localStorage and automatically restored on app load.

## Performance Considerations

- State updates are batched by React
- Only relevant components re-render on state changes
- Large data (images) use object URLs to avoid memory issues
- History is automatically cleaned up based on user preferences
- localStorage usage is monitored and cleaned when full

## Error Handling

- All state operations include error boundaries
- Failed localStorage operations are gracefully handled
- Invalid state updates are logged but don't crash the app
- Network errors are captured and displayed to users

## Testing

See `src/examples/StateManagementExample.tsx` for a comprehensive demo of all features.