import { FunctionalityConfig, InputType, OutputFormat } from '../types';

export const FUNCTIONALITIES: FunctionalityConfig[] = [
  {
    id: 'hairstyle-changer',
    name: 'Hairstyle Changer',
    description: 'Change hairstyles on portrait images with 9 different variations',
    icon: '💇',
    inputTypes: [InputType.PORTRAIT_IMAGE],
    promptTemplate: 'Generate 9 different hairstyle variations for this portrait image',
    outputFormat: OutputFormat.GRID_3X3,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 1,
    instructions: 'Upload a clear portrait image to see different hairstyle options'
  },
  {
    id: 'ootd-generator',
    name: 'OOTD Generator',
    description: 'Create realistic outfit-of-the-day photos by combining person and clothing images',
    icon: '👗',
    inputTypes: [InputType.DUAL_IMAGE],
    promptTemplate: 'Create a realistic OOTD photo combining this person with this clothing item',
    outputFormat: OutputFormat.SINGLE_IMAGE,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 2,
    instructions: 'Upload a person image and a clothing item image to create realistic outfit combinations'
  },
  {
    id: 'clothing-changer',
    name: 'Clothing Changer',
    description: 'Change clothing on characters while maintaining pose and environment',
    icon: '👔',
    inputTypes: [InputType.DUAL_IMAGE],
    promptTemplate: 'Replace the clothing in the first image with the clothing from the second image',
    outputFormat: OutputFormat.SINGLE_IMAGE,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 2,
    instructions: 'Upload a person image and a reference clothing image to change outfits'
  },
  {
    id: 'explosive-food',
    name: 'Explosive Food Photography',
    description: 'Create dramatic promotional food images with flying ingredients',
    icon: '🍔',
    inputTypes: [InputType.SINGLE_IMAGE],
    promptTemplate: 'Create an explosive food photography scene with ingredients flying around this product',
    outputFormat: OutputFormat.SINGLE_IMAGE,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 1,
    instructions: 'Upload a food product image to create dramatic promotional photography'
  },
  {
    id: 'fashion-moodboard',
    name: 'Fashion Moodboard',
    description: 'Create creative fashion collages with handwritten notes and styling',
    icon: '🎨',
    inputTypes: [InputType.SINGLE_IMAGE],
    promptTemplate: 'Create a fashion moodboard collage with cutouts and handwritten notes',
    outputFormat: OutputFormat.SINGLE_IMAGE,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 1,
    instructions: 'Upload a fashion reference image to create an artistic moodboard'
  },
  {
    id: 'product-packaging',
    name: 'Product Packaging',
    description: 'Apply product designs to different packaging formats',
    icon: '📦',
    inputTypes: [InputType.DUAL_IMAGE],
    promptTemplate: 'Apply the design from the first image to the packaging in the second image',
    outputFormat: OutputFormat.SINGLE_IMAGE,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 2,
    instructions: 'Upload a product design and a packaging reference to visualize the final product'
  },
  {
    id: 'calorie-annotator',
    name: 'Calorie Annotator',
    description: 'Annotate food images with calorie information and nutritional data',
    icon: '🍎',
    inputTypes: [InputType.SINGLE_IMAGE],
    promptTemplate: 'Analyze this food image and annotate it with calorie information',
    outputFormat: OutputFormat.ANNOTATED_IMAGE,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 1,
    instructions: 'Upload a food image to get detailed nutritional analysis and calorie annotations'
  },
  {
    id: 'id-photo-creator',
    name: 'ID Photo Creator',
    description: 'Create professional ID photos with blue background and proper formatting',
    icon: '📷',
    inputTypes: [InputType.PORTRAIT_IMAGE],
    promptTemplate: 'Create a professional 2-inch ID photo with blue background',
    outputFormat: OutputFormat.SINGLE_IMAGE,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 1,
    instructions: 'Upload a portrait image to create a professional ID photo'
  },
  {
    id: 'comic-book-creator',
    name: 'Comic Book Creator',
    description: 'Generate superhero comic strips with compelling stories and dialogue',
    icon: '💥',
    inputTypes: [InputType.SINGLE_IMAGE],
    promptTemplate: 'Create a superhero comic book strip with multiple panels and dialogue',
    outputFormat: OutputFormat.COMIC_STRIP,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 1,
    instructions: 'Upload a reference image to create an exciting superhero comic story'
  },
  {
    id: 'movie-storyboard',
    name: 'Movie Storyboard',
    description: 'Create film noir detective storyboards with 12-part visual narratives',
    icon: '🎬',
    inputTypes: [InputType.SINGLE_IMAGE],
    promptTemplate: 'Create a 12-part film noir detective storyboard about missing treasure',
    outputFormat: OutputFormat.STORYBOARD,
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFiles: 1,
    instructions: 'Upload a reference image to create a cinematic detective story storyboard'
  }
];

// Helper function to get functionality by ID
export const getFunctionalityById = (id: string): FunctionalityConfig | undefined => {
  return FUNCTIONALITIES.find(func => func.id === id);
};

// Helper function to get functionality names for navigation
export const getFunctionalityNames = (): Array<{ id: string; name: string; icon: string }> => {
  return FUNCTIONALITIES.map(func => ({
    id: func.id,
    name: func.name,
    icon: func.icon
  }));
};