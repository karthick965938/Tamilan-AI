/**
 * Example: Using PromptsService in GeminiService
 * 
 * This file shows how to integrate the configurable prompts
 * into your existing GeminiService methods.
 */

import { promptsService } from './PromptsService';
import { getFunctionalityById } from '../constants';

// Example 1: Simple prompt replacement
export async function generateWithConfigurablePrompt(
    functionalityId: string,
    imageData: string
) {
    // Get prompt from configuration
    const promptConfig = await promptsService.getPrompt(functionalityId);

    if (!promptConfig) {
        // Fallback to default from constants
        const functionality = getFunctionalityById(functionalityId);
        promptConfig.prompt = functionality?.promptTemplate || 'Generate image';
    }

    // Use the configured prompt
    const fullPrompt = promptConfig.prompt;
    const systemMessage = promptConfig.system;
    const parameters = promptConfig.parameters;

    // Call Gemini API with configured prompt
    // ... your API call logic here

    return {
        success: true,
        prompt: fullPrompt,
        system: systemMessage,
        parameters
    };
}

// Example 2: Enhanced prompt with dynamic values
export async function generateHairstylesConfigurable(imageData: string) {
    const promptConfig = await promptsService.getPrompt('hairstyle-changer');

    if (!promptConfig) {
        throw new Error('Hairstyle changer configuration not found');
    }

    // Build the full prompt
    const prompt = `
    ${promptConfig.system}
    
    ${promptConfig.prompt}
    
    Additional requirements:
    - Output format: ${promptConfig.parameters?.output_format || 'grid'}
    - Style diversity: ${promptConfig.parameters?.style_diversity || 'medium'}
    - Realism level: ${promptConfig.parameters?.realism_level || 'high'}
  `.trim();

    // Your Gemini API call logic
    console.log('Using prompt:', prompt);

    return {
        success: true,
        imageUrl: 'generated-image-url'
    };
}

// Example 3: Batch loading for multiple functionalities
export async function preloadAllPrompts() {
    const functionalities = [
        'hairstyle-changer',
        'ootd-generator',
        'clothing-changer',
        'explosive-food',
        'fashion-moodboard',
        'product-packaging',
        'calorie-annotator',
        'id-photo-creator',
        'comic-book-creator',
        'movie-storyboard'
    ];

    const prompts = await Promise.all(
        functionalities.map(id => promptsService.getPrompt(id))
    );

    console.log('Loaded prompts:', prompts);
    return prompts;
}

// Example 4: Using global settings
export async function getQualitySettings() {
    const settings = await promptsService.getGlobalSettings();

    return {
        quality: settings.default_quality || 'high',
        safetyFilter: settings.safety_filter || 'medium',
        aspectRatio: settings.aspect_ratio || 'auto',
        language: settings.language || 'en'
    };
}

// Example 5: Integration in existing GeminiService method
/**
 * Updated generateHairstyles method using configurable prompts
 */
export async function generateHairstylesIntegrated(imageData: string) {
    try {
        // Load prompt configuration
        const promptConfig = await promptsService.getPrompt('hairstyle-changer');
        const globalSettings = await promptsService.getGlobalSettings();

        // Build request
        const request = {
            model: 'gemini-pro-vision',
            messages: [
                {
                    role: 'system',
                    content: promptConfig?.system || 'You are an AI image generator'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: promptConfig?.prompt || 'Generate 9 hairstyle variations'
                        },
                        {
                            type: 'image',
                            image_url: imageData
                        }
                    ]
                }
            ],
            parameters: {
                ...promptConfig?.parameters,
                quality: globalSettings.default_quality,
                safety_filter: globalSettings.safety_filter
            }
        };

        // Make API call
        // const response = await this.callGeminiAPI(request);

        return {
            success: true,
            message: 'Using configurable prompts!'
        };
    } catch (error) {
        console.error('Error generating hairstyles:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Example 6: Real-time prompt updates (for admin panel)
export async function updatePrompt(
    functionalityId: string,
    newPrompt: string,
    newSystem?: string
) {
    // This would require a server-side endpoint
    // For now, prompts are static files
    console.log('To update prompts, edit prompts.config.json file');

    // Reload configuration after manual edit
    await promptsService.reloadConfig();

    const updated = await promptsService.getPrompt(functionalityId);
    return updated;
}

// Example 7: Validation and testing
export async function validatePromptsConfiguration() {
    const requiredFunctionalities = [
        'hairstyle-changer',
        'ootd-generator',
        'clothing-changer',
        'explosive-food',
        'fashion-moodboard',
        'product-packaging',
        'calorie-annotator',
        'id-photo-creator',
        'comic-book-creator',
        'movie-storyboard'
    ];

    const results = {
        valid: [] as string[],
        missing: [] as string[],
        errors: [] as { id: string; error: string }[]
    };

    for (const id of requiredFunctionalities) {
        try {
            const prompt = await promptsService.getPrompt(id);

            if (prompt && prompt.prompt) {
                results.valid.push(id);
            } else {
                results.missing.push(id);
            }
        } catch (error) {
            results.errors.push({
                id,
                error: error.message
            });
        }
    }

    console.log('Validation Results:', results);
    return results;
}

/**
 * USAGE IN YOUR COMPONENT:
 * 
 * import { generateWithConfigurablePrompt } from '../services/examples';
 * 
 * const result = await generateWithConfigurablePrompt('hairstyle-changer', imageData);
 */
