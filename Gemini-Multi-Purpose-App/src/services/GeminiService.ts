/**
 * Google Gemini API Service
 * Handles all interactions with Google's Gemini LLM API for image generation
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  GeminiApiRequest,

  ApiError,
  ApiErrorType,
  ApiRequestConfig
} from '../types/api';
import { GenerationResult } from '../types/functionality';
import { GenerationLogger } from './GenerationLogger';

export class GeminiService {
  private static instance: GeminiService;
  private apiClient: AxiosInstance;
  private apiKey: string;
  private config: ApiRequestConfig;

  private constructor() {
    this.apiKey = this.getApiKey();
    this.config = {
      timeout: 60000, // 60 seconds
      retries: 3,
      retryDelay: 1000, // 1 second base delay
      maxFileSize: 20 * 1024 * 1024 // 20MB
    };

    this.apiClient = this.createApiClient();
  }

  /**
   * Get singleton instance of GeminiService
   */
  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Get API key from session storage or environment variables
   */
  private getApiKey(): string {
    const sessionKey = sessionStorage.getItem('VITE_GEMINI_API_KEY');
    if (sessionKey) {
      return sessionKey;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // Don't throw here if not found, as we might need to prompt for it
    return apiKey || '';
  }

  /**
   * Check if a valid API key is available
   */
  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Set API key dynamically
   */
  public setApiKey(key: string): void {
    if (!key) return;
    this.apiKey = key;
    sessionStorage.setItem('VITE_GEMINI_API_KEY', key);
  }

  /**
   * Create configured axios instance
   */
  private createApiClient(): AxiosInstance {
    const client = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for logging and authentication
    client.interceptors.request.use(
      (config) => {
        console.log(`Making API request to: ${config.url}`);
        if (config.data) {
          const dataStr = JSON.stringify(config.data);
          console.log(`Request payload size: ${dataStr.length} chars`);
          // Log model name if present in URL
          const modelMatch = config.url?.match(/models\/([^:]+)/);
          if (modelMatch) {
            console.log(`Using model: ${modelMatch[1]}`);
          }
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    client.interceptors.response.use(
      (response) => {
        console.log(`API response received: ${response.status}`);
        // Log response structure for debugging
        if (response.data) {
          const hasCandidates = response.data.candidates && response.data.candidates.length > 0;
          console.log(`Response has candidates: ${hasCandidates}`);
          if (hasCandidates && response.data.candidates[0].content) {
            const parts = response.data.candidates[0].content.parts || [];
            const imageParts = parts.filter((p: any) => p.inline_data);
            const textParts = parts.filter((p: any) => p.text);
            console.log(`Response parts - Images: ${imageParts.length}, Text: ${textParts.length}`);
          }
        }
        return response;
      },
      (error) => {
        return Promise.reject(this.handleApiError(error));
      }
    );

    return client;
  }

  /**
   * Handle and transform API errors
   */
  private handleApiError(error: AxiosError): ApiError {
    let apiError = new ApiError({
      type: ApiErrorType.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      retryable: false,
      timestamp: new Date()
    });

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      apiError.statusCode = status;
      apiError.details = data;

      switch (status) {
        case 401:
          apiError.type = ApiErrorType.AUTHENTICATION_ERROR;
          apiError.message = 'Invalid API key or authentication failed';
          apiError.retryable = false;
          break;
        case 429:
          apiError.type = ApiErrorType.RATE_LIMIT_ERROR;
          apiError.message = 'Rate limit exceeded. Please try again later';
          apiError.retryable = true;
          break;
        case 400:
          apiError.type = ApiErrorType.VALIDATION_ERROR;
          apiError.message = 'Invalid request parameters';
          apiError.retryable = false;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          apiError.type = ApiErrorType.PROCESSING_ERROR;
          apiError.message = 'Server error occurred during processing';
          apiError.retryable = true;
          break;
        default:
          apiError.message = `HTTP ${status}: ${error.message}`;
          apiError.retryable = status >= 500;
      }
    } else if (error.request) {
      // Network error
      apiError.type = ApiErrorType.NETWORK_ERROR;
      apiError.message = 'Network error: Unable to reach the API';
      apiError.retryable = true;
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      apiError.type = ApiErrorType.TIMEOUT_ERROR;
      apiError.message = 'Request timeout: The API took too long to respond';
      apiError.retryable = true;
    }

    console.error('API Error:', apiError);
    return apiError;
  }

  /**
   * Implement exponential backoff retry logic
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.retries
  ): Promise<T> {
    let lastError: ApiError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as ApiError;

        // Don't retry if error is not retryable
        if (!lastError.retryable || attempt === maxRetries) {
          throw lastError;
        }

        // Calculate exponential backoff delay
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
        const totalDelay = delay + jitter;

        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${totalDelay}ms`);
        await this.sleep(totalDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate API key by making a test request
   */
  public async validateApiKey(): Promise<boolean> {
    try {
      await this.apiClient.get(`/models?key=${this.apiKey}`);
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.type === ApiErrorType.AUTHENTICATION_ERROR) {
        return false;
      }
      // Other errors might not indicate invalid API key
      throw error;
    }
  }

  /**
   * Get available models from Gemini API
   */
  public async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.apiClient.get(`/models?key=${this.apiKey}`);
      });

      const models = response.data.models?.map((model: any) => {
        // Extract model name - API might return "models/gemini-1.5-pro" or just "gemini-1.5-pro"
        let name = model.name || model;
        if (name.includes('/')) {
          name = name.split('/').pop() || name;
        }
        return name;
      }) || [];

      console.log('Fetched available models from API:', models);

      // Filter and prioritize image generation capable models
      const imageGenModels = models.filter((name: string) =>
        name.includes('image-generation') ||
        name.includes('flash-exp') ||
        name.includes('3-pro')
      );

      return imageGenModels.length > 0 ? imageGenModels : models;
    } catch (error) {
      console.error('Failed to get available models:', error);
      // Return models to try in order (these are standard models that should exist)
      return [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-pro-vision'
      ];
    }
  }

  /**
   * Detect MIME type from data URL
   */
  private detectMimeType(dataUrl: string): string {
    if (dataUrl.startsWith('data:')) {
      const mimeMatch = dataUrl.match(/data:([^;]+);/);
      if (mimeMatch) {
        return mimeMatch[1];
      }
    }
    // Default to JPEG if cannot detect
    return 'image/jpeg';
  }

  /**
   * Extract base64 data from data URL
   */
  private extractBase64Data(dataUrl: string): string {
    if (dataUrl.includes(',')) {
      return dataUrl.split(',')[1];
    }
    return dataUrl;
  }

  /**
   * Get available models and filter for image generation capable ones
   */
  private async getAvailableImageGenerationModels(): Promise<string[]> {
    try {
      const allModels = await this.getAvailableModels();
      console.log('All available models:', allModels);

      // Filter for models that might support image generation
      // Priority order: image generation specific models first, then standard models
      // Based on working code, gemini-2.5-flash-image-preview is the correct model
      const preferredModels = [
        'gemini-2.5-flash-image-preview',
        'gemini-2.0-flash-exp-image-generation',
        'gemini-3-pro',
        'gemini-2.0-flash-thinking-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-pro-vision'
      ];

      // Check which preferred models are actually available
      // Match by full name or by key parts (e.g., "1.5-pro" matches "gemini-1.5-pro")
      const availablePreferred = preferredModels.filter(model => {
        const modelKey = model.replace('gemini-', '');
        return allModels.some((m: string) => {
          const mKey = m.replace('gemini-', '').replace('models/', '');
          return m === model || m.includes(modelKey) || modelKey.includes(mKey);
        });
      });

      console.log('Available preferred models:', availablePreferred);

      // If we found some, use them; otherwise use all available models (up to 5)
      if (availablePreferred.length > 0) {
        return availablePreferred;
      }

      // Use first 5 available models if no preferred ones found
      return allModels.slice(0, 5);
    } catch (error) {
      console.warn('Could not fetch available models, using defaults:', error);
      // Fallback to standard models that should exist
      return [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-pro-vision'
      ];
    }
  }

  /**
   * Base method for making image generation requests
   */
  protected async makeGenerationRequest(
    request: GeminiApiRequest
  ): Promise<GenerationResult> {
    const startTime = Date.now(); // Track start time for accurate processing time

    try {
      // Validate request
      this.validateRequest(request);

      // Use the correct model that supports image generation
      // Based on working code: gemini-2.5-flash-image-preview
      // Use only the working model first to avoid duplicate calls
      const models = ['gemini-2.5-flash-image-preview'];

      console.log('Using model:', models[0]);

      let lastError: ApiError | null = null;

      for (const model of models) {
        try {
          const response = await this.retryWithBackoff(async () => {
            // Prepare input images - match the working code format
            const imageParts = Array.isArray(request.imageData)
              ? request.imageData.map(data => {
                const mimeType = this.detectMimeType(data);
                return {
                  inline_data: {
                    mime_type: mimeType,
                    data: this.extractBase64Data(data)
                  }
                };
              })
              : [{
                inline_data: {
                  mime_type: this.detectMimeType(request.imageData),
                  data: this.extractBase64Data(request.imageData)
                }
              }];

            // Build request payload - match the working code structure
            // The working code passes: [imagePart1, imagePart2, promptText]
            // For image generation, we need to be explicit about output format
            const payload: any = {
              contents: [{
                parts: [
                  ...imageParts,
                  { text: request.prompt }
                ]
              }],
              generationConfig: {
                temperature: request.parameters?.temperature ?? 0.7,
                topK: request.parameters?.topK ?? 40,
                topP: request.parameters?.topP ?? 0.95,
                maxOutputTokens: request.parameters?.maxOutputTokens ?? 2048,
                candidateCount: 1,
                ...request.parameters
              }
            };

            // For image generation models, explicitly request image output
            // This helps prevent text-only responses
            if (model.includes('image') || model.includes('flash-image')) {
              // Don't add responseModalities for gemini-2.5-flash-image-preview
              // as it may not support that parameter
              if (!model.includes('2.5-flash-image-preview')) {
                payload.generationConfig.responseModalities = ['IMAGE'];
              }
            }

            // Use the standard endpoint format
            const endpoint = `/models/${model}:generateContent?key=${this.apiKey}`;
            console.log(`Attempting request to: ${endpoint} with model: ${model}`);

            return await this.apiClient.post(endpoint, payload);
          });

          // Success! Return immediately - don't try other models
          console.log(`Successfully generated image using model: ${model}`);
          const result = this.transformResponse(response.data, request.functionType, model, startTime);

          if (result.success) {
            // Auto-log successful generation to backend
            this.logGeneration(request, result).catch(err => console.warn('Background logging failed:', err));
          }

          return result;
        } catch (error) {
          const apiError = error as ApiError;
          lastError = apiError;

          // If it's not a model-specific error, break and return error
          if (apiError.type !== ApiErrorType.VALIDATION_ERROR &&
            apiError.statusCode !== 404) {
            console.log(`Model ${model} failed with non-retryable error, stopping:`, apiError.statusCode, apiError.type);
            break;
          }

          // Try next model if this one doesn't exist (404) or validation error
          if (apiError.statusCode === 404) {
            console.log(`Model ${model} returned 404, trying next model...`);
            lastError = apiError;
            continue;
          }

          // For validation errors, also try next model
          if (apiError.type === ApiErrorType.VALIDATION_ERROR) {
            console.log(`Model ${model} validation error, trying next...`);
            lastError = apiError;
            continue;
          }

          // For other errors (auth, rate limit, etc.), break and return
          console.log(`Model ${model} failed with non-404 error:`, apiError.statusCode, apiError.type);
          break;
        }
      }

      // If all models failed with 404, provide specific guidance
      if (lastError?.statusCode === 404) {
        const errorMessage =
          `All attempted models returned 404 (not found). ` +
          `This typically means:\n` +
          `1. Image generation may not be available in your region\n` +
          `2. Your API key may not have access to image generation models\n` +
          `3. The models may require a different API endpoint or version\n\n` +
          `Models tried: ${models.join(', ')}\n\n` +
          `Note: Gemini API primarily supports image understanding, not generation. ` +
          `For image generation, you may need to use Google's Imagen API instead, ` +
          `or check if newer Gemini models with image generation are available in your region.`;

        throw new ApiError({
          type: ApiErrorType.PROCESSING_ERROR,
          message: errorMessage,
          retryable: false,
          timestamp: new Date(),
          details: {
            modelsTried: models,
            lastError: lastError?.details,
            suggestion: 'Consider using Google Imagen API for image generation, or verify if Gemini image generation models are available in your region'
          }
        });
      }

      // For other errors
      const errorMessage = lastError
        ? `Image generation failed: ${lastError.message}. ` +
        `Status: ${lastError.statusCode || 'unknown'}. ` +
        `Models tried: ${models.join(', ')}`
        : 'All image generation models failed. Please verify your API key has access to image generation features.';

      throw lastError || new ApiError({
        type: ApiErrorType.PROCESSING_ERROR,
        message: errorMessage,
        retryable: false,
        timestamp: new Date(),
        details: {
          modelsTried: models
        }
      });
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message,
        metadata: {
          functionType: request.functionType,
          processingTime: Date.now() - startTime,
          timestamp: new Date(),
          inputImageCount: Array.isArray(request.imageData) ? request.imageData.length : 1
        }
      };
    }
  }

  /**
   * Log generation to backend API
   */
  private async logGeneration(request: GeminiApiRequest, result: GenerationResult): Promise<void> {
    try {
      const logger = GenerationLogger.getInstance();

      const inputs: { type: string; data: string; name?: string }[] = [];
      if (request.imageData) {
        if (Array.isArray(request.imageData)) {
          request.imageData.forEach((data, index) => {
            inputs.push({ type: 'image', data: data as string, name: `Input ${index + 1}` });
          });
        } else {
          inputs.push({ type: 'image', data: request.imageData as string, name: 'Input Image' });
        }
      }

      const outputs: { type: string; data: string }[] = [];
      if (result.imageUrls) {
        result.imageUrls.forEach(url => outputs.push({ type: 'image', data: url }));
      } else if (result.imageUrl) {
        outputs.push({ type: 'image', data: result.imageUrl });
      }

      await logger.logGeneration({
        functionId: request.functionType,
        processingTime: result.metadata?.processingTime || 0,
        timestamp: new Date().toISOString(),
        inputs,
        outputs,
        metadata: {
          ...(result.metadata || {}),
          prompt: request.prompt,
          model: result.metadata?.apiVersion
        }
      });
    } catch (error) {
      console.warn('Failed to auto-log generation:', error);
    }
  }

  /**
   * Validate API request parameters
   */
  private validateRequest(request: GeminiApiRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new ApiError({
        type: ApiErrorType.VALIDATION_ERROR,
        message: 'Prompt is required and cannot be empty',
        retryable: false,
        timestamp: new Date()
      });
    }

    if (!request.imageData) {
      throw new ApiError({
        type: ApiErrorType.VALIDATION_ERROR,
        message: 'Image data is required',
        retryable: false,
        timestamp: new Date()
      });
    }

    if (!request.functionType) {
      throw new ApiError({
        type: ApiErrorType.VALIDATION_ERROR,
        message: 'Function type is required',
        retryable: false,
        timestamp: new Date()
      });
    }
  }

  /**
   * Transform Gemini API response to GenerationResult
   */
  private transformResponse(response: any, functionType: string, modelUsed: string, startTime: number): GenerationResult {

    try {
      // Extract generated content from Gemini response
      const candidates = response.candidates || [];
      if (candidates.length === 0) {
        throw new Error('No candidates returned from API');
      }

      const content = candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error('No content parts in API response');
      }

      // Extract images from response parts
      // Working code looks for: part.inlineData with data and mimeType
      const imageParts = content.parts.filter((part: any) => {
        // Check for inlineData (SDK format) or inline_data (REST API format)
        if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
          return true;
        }
        if (part.inline_data && part.inline_data.mime_type &&
          part.inline_data.mime_type.startsWith('image/') && part.inline_data.data) {
          return true;
        }
        // Some APIs might return images in different formats
        if (part.image_data || part.image) {
          return true;
        }
        return false;
      });

      // Extract text parts for prompts/descriptions
      const textParts = content.parts.filter((part: any) => part.text);
      const promptUsed = textParts.length > 0 ? textParts[0].text : '';

      console.log(`Found ${imageParts.length} image parts and ${textParts.length} text parts in response`);

      // Check if we have generated images
      if (imageParts.length > 0) {
        // Convert inlineData/inline_data to data URLs
        // Match the working code format: inlineData.data and inlineData.mimeType
        const imageUrls = imageParts.map((part: any) => {
          // Handle different response formats
          let mimeType = 'image/png';
          let base64Data = '';

          // Check for SDK format first (inlineData)
          if (part.inlineData) {
            mimeType = part.inlineData.mimeType || 'image/png';
            base64Data = part.inlineData.data || '';
          }
          // Then check REST API format (inline_data)
          else if (part.inline_data) {
            mimeType = part.inline_data.mime_type || 'image/png';
            base64Data = part.inline_data.data || '';
          }
          // Other formats
          else if (part.image_data) {
            mimeType = part.image_data.mime_type || 'image/png';
            base64Data = part.image_data.data || '';
          } else if (part.image) {
            mimeType = part.image.mime_type || 'image/png';
            base64Data = part.image.data || '';
          }

          if (!base64Data) {
            throw new Error('Image part found but no data available');
          }

          return `data:${mimeType};base64,${base64Data}`;
        });

        // For hairstyle_changer, if we get a single image, return only imageUrl (not imageUrls)
        // This prevents duplicate rendering
        if (functionType === 'hairstyle_changer' && imageUrls.length === 1) {
          return {
            success: true,
            imageUrl: imageUrls[0], // Single image - use imageUrl only
            metadata: {
              functionType,
              processingTime: Date.now() - startTime,
              timestamp: new Date(),
              inputImageCount: 1,
              promptUsed,
              apiVersion: modelUsed
            }
          };
        }

        // For single image results, return imageUrl
        // For multiple images, return imageUrls
        if (imageUrls.length === 1) {
          return {
            success: true,
            imageUrl: imageUrls[0],
            metadata: {
              functionType,
              processingTime: Date.now() - startTime,
              timestamp: new Date(),
              inputImageCount: 1,
              promptUsed,
              apiVersion: modelUsed
            }
          };
        } else {
          return {
            success: true,
            imageUrls: imageUrls,
            metadata: {
              functionType,
              processingTime: Date.now() - startTime,
              timestamp: new Date(),
              inputImageCount: imageUrls.length,
              promptUsed,
              apiVersion: modelUsed
            }
          };
        }
      }

      // If no images but we have text, check if it's an error message
      if (textParts.length > 0) {
        const text = textParts[0].text.toLowerCase();
        console.log('API returned text response:', textParts[0].text);

        if (text.includes('cannot') || text.includes('unable') || text.includes('error') || text.includes('not available')) {
          throw new Error(`API returned error message: ${textParts[0].text}`);
        }

        // Check if the text is describing what it would do (common Gemini behavior)
        // In this case, we should retry with a more explicit prompt or different approach
        if (text.includes('here are') || text.includes('variations') || text.includes('grid') ||
          text.includes('would') || text.includes('could') || text.includes('should')) {
          console.warn('API returned descriptive text instead of generating image. This suggests the prompt needs to be more explicit.');
          throw new Error(
            `The API returned a text description instead of generating an image. ` +
            `This often happens when the prompt isn't explicit enough about image generation. ` +
            `Response: ${textParts[0].text.substring(0, 200)}...`
          );
        }

        // Log the full text response for debugging
        console.warn('API returned text instead of images. Full response:', textParts[0].text);

        // Some models might return text descriptions instead of images
        // This could happen if image generation is not available
        throw new Error(
          `API returned text instead of images. Response: ${textParts[0].text.substring(0, 300)}`
        );
      }

      // Log the full response structure for debugging
      console.error('No images or text found in API response. Response structure:', JSON.stringify(response, null, 2));
      throw new Error('No images or text found in API response. Check console for response details.');
    } catch (error) {
      return {
        success: false,
        error: `Failed to process API response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          functionType,
          processingTime: Date.now() - startTime,
          timestamp: new Date(),
          inputImageCount: 1,
          apiVersion: modelUsed
        }
      };
    }
  }

  /**
   * Get current API configuration
   */
  public getConfig(): ApiRequestConfig {
    return { ...this.config };
  }

  /**
   * Update API configuration
   */
  public updateConfig(newConfig: Partial<ApiRequestConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update axios timeout if changed
    if (newConfig.timeout) {
      this.apiClient.defaults.timeout = newConfig.timeout;
    }
  }

  /**
   * Get API usage statistics (mock implementation)
   */
  public async getUsageStats(): Promise<{
    requestsToday: number;
    requestsThisMonth: number;
    remainingQuota: number;
  }> {
    // This would typically make an API call to get actual usage stats
    // For now, return mock data
    return {
      requestsToday: 0,
      requestsThisMonth: 0,
      remainingQuota: 1000
    };
  }

  /**
   * Check API health status
   */
  public async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    lastChecked: Date;
  }> {
    const startTime = Date.now();

    try {
      await this.validateApiKey();
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  // ========================================
  // FUNCTIONALITY-SPECIFIC API METHODS
  // ========================================

  /**
   * Generate hairstyles for portrait images (Functionality 1)
   * Creates a 3x3 grid of different hairstyle variations
   */
  public async generateHairstyles(imageData: string): Promise<GenerationResult> {
    // Use a very direct prompt that emphasizes IMAGE GENERATION
    // Match the working code format: system hint + user instruction
    // Be explicit: generate an image, don't describe it
    const systemHint = 'Create a new image by modifying the provided image. Maintain photorealism, perspective, and lighting. Output only the final composed image, not text descriptions or explanations.';

    // More explicit prompt for generating 9 variations in a grid
    const prompt = `Generate ONE single image containing a 3x3 grid layout with 9 different hairstyle variations of this person. 
    - Top row: short modern cut, medium length bob, pixie cut
    - Middle row: long straight hair, long wavy hair, long curly hair  
    - Bottom row: professional updo, casual ponytail, braided style
    Each variation must show the EXACT SAME person with IDENTICAL facial features, skin tone, and expression. Only the hairstyle changes.
    Arrange all 9 variations in a clear 3x3 grid pattern in a single image. Output the complete grid image.`;

    const request: GeminiApiRequest = {
      prompt: `${systemHint}\nUser instruction: ${prompt}`,
      imageData,
      functionType: 'hairstyle_changer',
      parameters: {
        temperature: 0.8,
        maxOutputTokens: 2048
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Generate OOTD (Outfit of the Day) photos (Functionality 2)
   * Combines person image with clothing to create realistic outfit photos
   */
  public async generateOOTD(personImageData: string, clothingImageData: string): Promise<GenerationResult> {
    const prompt = `
      Create a realistic OOTD (Outfit of the Day) photo by combining this person with the clothing item shown.
      Generate a full-body street style photo with:
      - Natural lighting and urban background
      - The person wearing the exact clothing item from the reference image
      - Realistic fit and draping of the clothing
      - Professional fashion photography quality
      - Maintain the person's identity and proportions
      
      The result should look like a genuine street style or fashion blog photo.
      Ensure the clothing fits naturally and the overall composition is aesthetically pleasing.
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: [personImageData, clothingImageData],
      functionType: 'ootd_generator',
      parameters: {
        temperature: 0.7,
        maxOutputTokens: 1536
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Change clothing on character while maintaining pose and environment (Functionality 3)
   */
  public async generateClothingChange(personImageData: string, referenceClothingData: string): Promise<GenerationResult> {
    const prompt = `
      Replace only the clothing on this person with the outfit from the reference image.
      Preserve everything else exactly:
      - Same pose and body position
      - Same facial expression and identity
      - Same background and environment
      - Same lighting conditions
      
      Only change the clothing to match the reference outfit while ensuring:
      - Natural fit and realistic draping
      - Proper proportions and sizing
      - Consistent lighting and shadows
      - Seamless integration with the original scene
      
      The result should look like the same photo but with different clothes.
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: [personImageData, referenceClothingData],
      functionType: 'clothing_changer',
      parameters: {
        temperature: 0.6,
        maxOutputTokens: 1536
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Create explosive food product photography (Functionality 4)
   */
  public async generateExplosiveFood(foodImageData: string, brandColors?: string[]): Promise<GenerationResult> {
    const colorInstruction = brandColors && brandColors.length > 0
      ? `Use these brand colors as the background: ${brandColors.join(', ')}`
      : 'Use vibrant, appetizing colors as the background';

    const prompt = `
      Create a dramatic, explosive food product photography scene with this food item.
      Generate a dynamic composition featuring:
      - The main food product prominently displayed in the center
      - Fresh ingredients flying around dramatically (vegetables, spices, herbs)
      - Splashes of sauces, oils, or liquids in motion
      - Emphasis on freshness and nutritional value
      - Professional commercial photography lighting
      - ${colorInstruction}
      - No text overlays or branding
      
      The image should convey energy, freshness, and appetite appeal.
      Make it look like a high-end food advertisement with cinematic quality.
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: foodImageData,
      functionType: 'explosive_food',
      parameters: {
        temperature: 0.8,
        maxOutputTokens: 1536
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Create fashion mood board collages (Functionality 5)
   */
  public async generateMoodboard(fashionImageData: string): Promise<GenerationResult> {
    const prompt = `
      Create a creative fashion mood board collage based on this fashion reference image.
      Generate an artistic composition with:
      - Individual fashion items cut out and arranged creatively
      - Handwritten-style notes and annotations in marker font
      - Fashion sketches and design elements
      - Brand names and sources in English
      - Creative aesthetic with mixed media feel
      - Color swatches and texture samples
      - Inspirational quotes or style notes
      
      The mood board should feel like a designer's creative workspace with:
      - Layered elements and varied sizes
      - Artistic arrangement and composition  
      - Professional fashion industry aesthetic
      - Creative typography and hand-drawn elements
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: fashionImageData,
      functionType: 'fashion_moodboard',
      parameters: {
        temperature: 0.9,
        maxOutputTokens: 1536
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Apply product design to packaging (Functionality 6)
   */
  public async generatePackaging(productDesignData: string, packagingReferenceData: string): Promise<GenerationResult> {
    const prompt = `
      Apply the product design from the first image to the packaging format shown in the second image.
      Create a professional product packaging visualization with:
      - The design from the first image seamlessly applied to the packaging
      - Minimalist professional setting and lighting
      - High-quality commercial photography aesthetic
      - Proper perspective and realistic material textures
      - Clean, modern presentation suitable for retail
      - Professional studio lighting and shadows
      
      Maintain the integrity of both the original design and packaging structure.
      The result should look like a professional product photography shoot.
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: [productDesignData, packagingReferenceData],
      functionType: 'product_packaging',
      parameters: {
        temperature: 0.6,
        maxOutputTokens: 1536
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Annotate food images with calorie information (Functionality 7)
   */
  public async generateCalorieAnnotation(foodImageData: string): Promise<GenerationResult> {
    const prompt = `
      Create a *conceptual overlay design* for this food image showing the layout of a modern calorie tracking app.
      Add decorative UI elements labeling the food items with *exemplary/placeholder* text.
      
      Design requirements:
      - Overlay AR (Augmented Reality) style badges on food items
      - Use fictional placeholder values for calories (e.g. "Estimated: ~200 kcal") to demonstrate the UI layout
      - Use clean, modern typography and graphical lines pointing to items
      - Create a "Heads Up Display" (HUD) aesthetic
      
      IMPORTANT: This is a UI design concept demonstration only. Do NOT attempt to provide real medical or nutritional analysis. Use general estimated labels like "Protein", "Carbs", "Healthy Fats" without specific medical claims.
      
      Style: Futuristic, clean, high-tech interface overlay.
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: foodImageData,
      functionType: 'calorie_annotator',
      parameters: {
        temperature: 0.5,
        maxOutputTokens: 1536
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Create professional ID photos (Functionality 8)
   */
  public async generateIDPhoto(portraitImageData: string): Promise<GenerationResult> {
    const prompt = `
      Transform this portrait into a professional 2-inch ID photo format.
      Create a standardized identification photograph with:
      - Proper head and shoulders cropping (2-inch format)
      - Clean blue background
      - Professional business attire
      - Frontal face positioning
      - Slight, professional smile
      - Even, professional lighting
      - High resolution and sharp focus
      - Meets official ID photo standards
      
      Ensure the photo looks professional and would be acceptable for:
      - Government identification documents
      - Professional licenses
      - Corporate badges
      - Official applications
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: portraitImageData,
      functionType: 'id_photo_creator',
      parameters: {
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Create comic book strips (Functionality 9)
   */
  public async generateComicBook(referenceImageData: string): Promise<GenerationResult> {
    const prompt = `
      Create a superhero comic book strip based on this reference image.
      Generate a multi-panel comic with:
      - 4-6 sequential panels telling a complete story
      - Superhero theme with action and adventure
      - Dynamic poses and dramatic angles
      - Comic book art style with bold lines and colors
      - Speech bubbles with engaging dialogue
      - Sound effects and action words (POW, BOOM, etc.)
      - Compelling narrative arc with conflict and resolution
      - Professional comic book aesthetic
      
      The story should be:
      - Action-packed and heroic
      - Suitable for all ages
      - Visually engaging with varied panel layouts
      - Include both dialogue and narrative text
      
      Make it feel like a page from a professional superhero comic book.
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: referenceImageData,
      functionType: 'comic_book_creator',
      parameters: {
        temperature: 0.8,
        maxOutputTokens: 2048
      }
    };

    return this.makeGenerationRequest(request);
  }

  /**
   * Create movie storyboards (Functionality 10)
   */
  public async generateStoryboard(referenceImageData: string): Promise<GenerationResult> {
    const prompt = `
      Create a 12-part movie storyboard sequence based on this reference image.
      Generate a film noir detective story about missing treasure with:
      - 12 sequential black and white panels
      - Classic film noir aesthetic and lighting
      - Detective/mystery theme with treasure hunt plot
      - Dramatic camera angles and compositions
      - Strong contrast and shadows typical of noir films
      - Visual storytelling without text overlays
      - Cinematic framing and shot variety
      - Progressive narrative from setup to resolution
      
      The storyboard should include:
      - Establishing shots and close-ups
      - Dramatic lighting and shadow play
      - Mystery and suspense elements
      - Classic noir visual tropes
      - Clear story progression across all 12 panels
      
      Tell the complete treasure hunt story purely through imagery.
    `;

    const request: GeminiApiRequest = {
      prompt,
      imageData: referenceImageData,
      functionType: 'movie_storyboard',
      parameters: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    return this.makeGenerationRequest(request);
  }
}