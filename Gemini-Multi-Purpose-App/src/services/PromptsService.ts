/**
 * Prompts Configuration Service
 * Loads and manages AI prompts from external configuration file
 */

export interface PromptParameters {
    [key: string]: any;
}

export interface FunctionalityPrompt {
    prompt: string;
    system?: string;
    parameters?: PromptParameters;
}

export interface CategoryConfig {
    name: string;
    description: string;
    functionalities: Record<string, FunctionalityPrompt>;
}

export interface PromptsConfig {
    version: string;
    categories: Record<string, CategoryConfig>;
    global_settings?: {
        default_quality?: string;
        safety_filter?: string;
        aspect_ratio?: string;
        language?: string;
    };
    metadata?: {
        created_at?: string;
        last_updated?: string;
        author?: string;
    };
}

class PromptsService {
    private static instance: PromptsService;
    private config: PromptsConfig | null = null;
    private loading: Promise<PromptsConfig> | null = null;

    private constructor() { }

    public static getInstance(): PromptsService {
        if (!PromptsService.instance) {
            PromptsService.instance = new PromptsService();
        }
        return PromptsService.instance;
    }

    /**
     * Load prompts configuration from JSON file
     */
    public async loadConfig(): Promise<PromptsConfig> {
        // Return cached config if already loaded
        if (this.config) {
            return this.config;
        }

        // Return existing loading promise if already loading
        if (this.loading) {
            return this.loading;
        }

        // Start loading
        this.loading = this.fetchConfig();

        try {
            this.config = await this.loading;
            return this.config;
        } finally {
            this.loading = null;
        }
    }

    /**
     * Fetch configuration from file
     */
    private async fetchConfig(): Promise<PromptsConfig> {
        try {
            // Try to load the actual config file
            const response = await fetch('/prompts.config.json');

            if (!response.ok) {
                // If not found, try template as fallback
                console.warn('prompts.config.json not found, loading template...');
                const templateResponse = await fetch('/prompts.config.template.json');

                if (!templateResponse.ok) {
                    throw new Error('Neither config nor template found');
                }

                return await templateResponse.json();
            }

            return await response.json();
        } catch (error) {
            console.error('Error loading prompts configuration:', error);
            // Return fallback configuration
            return this.getFallbackConfig();
        }
    }

    /**
     * Get prompt for a specific functionality
     */
    public async getPrompt(functionalityId: string): Promise<FunctionalityPrompt | null> {
        const config = await this.loadConfig();

        // Search through all categories
        for (const category of Object.values(config.categories)) {
            if (category.functionalities[functionalityId]) {
                return category.functionalities[functionalityId];
            }
        }

        console.warn(`Prompt not found for functionality: ${functionalityId}`);
        return null;
    }

    /**
     * Get system message for a functionality
     */
    public async getSystemMessage(functionalityId: string): Promise<string | undefined> {
        const promptConfig = await this.getPrompt(functionalityId);
        return promptConfig?.system;
    }

    /**
     * Get parameters for a functionality
     */
    public async getParameters(functionalityId: string): Promise<PromptParameters | undefined> {
        const promptConfig = await this.getPrompt(functionalityId);
        return promptConfig?.parameters;
    }

    /**
     * Get all functionalities in a category
     */
    public async getCategoryFunctionalities(categoryId: string): Promise<Record<string, FunctionalityPrompt> | null> {
        const config = await this.loadConfig();
        return config.categories[categoryId]?.functionalities || null;
    }

    /**
     * Get global settings
     */
    public async getGlobalSettings() {
        const config = await this.loadConfig();
        return config.global_settings || {};
    }

    /**
     * Reload configuration (useful for hot-reloading during development)
     */
    public async reloadConfig(): Promise<PromptsConfig> {
        this.config = null;
        this.loading = null;
        return this.loadConfig();
    }

    /**
     * Check if config is loaded
     */
    public isLoaded(): boolean {
        return this.config !== null;
    }

    /**
     * Get configuration version
     */
    public async getVersion(): Promise<string> {
        const config = await this.loadConfig();
        return config.version;
    }

    /**
     * Fallback configuration in case file loading fails
     */
    private getFallbackConfig(): PromptsConfig {
        return {
            version: '1.0.0-fallback',
            categories: {
                'portrait-manipulation': {
                    name: 'Portrait Manipulation',
                    description: 'AI tools for transforming portrait images',
                    functionalities: {
                        'hairstyle-changer': {
                            prompt: 'Generate 9 different hairstyle variations for this portrait image',
                            system: 'You are an expert hair stylist and image generation AI.'
                        },
                        'id-photo-creator': {
                            prompt: 'Create a professional 2-inch ID photo with blue background',
                            system: 'You are a professional ID photo specialist.'
                        }
                    }
                },
                'fashion-design': {
                    name: 'Fashion & Style',
                    description: 'Creative tools for fashion and styling',
                    functionalities: {
                        'ootd-generator': {
                            prompt: 'Create a realistic OOTD photo combining this person with this clothing item',
                            system: 'You are a fashion photographer and styling expert.'
                        },
                        'clothing-changer': {
                            prompt: 'Replace the clothing in the first image with the clothing from the second image',
                            system: 'You are an expert in fashion visualization and digital clothing fitting.'
                        },
                        'fashion-moodboard': {
                            prompt: 'Create a fashion moodboard collage with cutouts and handwritten notes',
                            system: 'You are a fashion designer creating visual mood boards.'
                        }
                    }
                },
                'food-photography': {
                    name: 'Food Photography',
                    description: 'Professional food imaging and analysis',
                    functionalities: {
                        'explosive-food': {
                            prompt: 'Create an explosive food photography scene with ingredients flying around this product',
                            system: 'You are a commercial food photographer specializing in dynamic, high-impact advertising imagery.'
                        },
                        'calorie-annotator': {
                            prompt: 'Analyze this food image and annotate it with calorie information',
                            system: 'You are a nutritionist and food analyst.'
                        }
                    }
                },
                'product-design': {
                    name: 'Product Design',
                    description: 'Product visualization and packaging',
                    functionalities: {
                        'product-packaging': {
                            prompt: 'Apply the design from the first image to the packaging in the second image',
                            system: 'You are a product packaging designer creating realistic product visualizations.'
                        }
                    }
                },
                'storytelling': {
                    name: 'Visual Storytelling',
                    description: 'Comic and storyboard creation',
                    functionalities: {
                        'comic-book-creator': {
                            prompt: 'Create a superhero comic book strip with multiple panels and dialogue',
                            system: 'You are a comic book artist and writer.'
                        },
                        'movie-storyboard': {
                            prompt: 'Create a 12-part film noir detective storyboard about missing treasure',
                            system: 'You are a film director and storyboard artist specializing in noir cinema.'
                        }
                    }
                }
            },
            global_settings: {
                default_quality: 'high',
                safety_filter: 'medium',
                aspect_ratio: 'auto',
                language: 'en'
            }
        };
    }
}

export default PromptsService;
export const promptsService = PromptsService.getInstance();
