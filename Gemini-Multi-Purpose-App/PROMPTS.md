# Prompts Configuration Guide

This document explains how to configure and customize AI prompts for VisionForge AI.

## 📁 Files

- **`prompts.config.template.json`** - Template file (committed to git)
- **`prompts.config.json`** - Your actual configuration (gitignored)

## 🚀 Quick Start

### 1. Create Your Configuration

Copy the template to create your configuration file:

```bash
cp prompts.config.template.json prompts.config.json
```

### 2. Edit Prompts

Open `prompts.config.json` and customize the prompts for each functionality.

### 3. Application Auto-Loads

The application automatically loads `prompts.config.json` on startup. If the file doesn't exist, it falls back to the template.

## 📝 Configuration Structure

```json
{
  "version": "1.0.0",
  "categories": {
    "category-name": {
      "name": "Display Name",
      "description": "Category description",
      "functionalities": {
        "functionality-id": {
          "prompt": "Main prompt sent to AI",
          "system": "System message for AI behavior",
          "parameters": {
            "key": "value"
          }
        }
      }
    }
  },
  "global_settings": {
    "default_quality": "high",
    "safety_filter": "medium"
  }
}
```

## 🎯 Available Functionalities

### Portrait Manipulation
- `hairstyle-changer` - Generate hairstyle variations
- `id-photo-creator` - Create professional ID photos

### Fashion & Style
- `ootd-generator` - Outfit of the day
- `clothing-changer` - Change clothing
- `fashion-moodboard` - Fashion collages

### Food Photography
- `explosive-food` - Dramatic food photography
- `calorie-annotator` - Nutritional analysis

### Product Design
- `product-packaging` - Apply designs to packaging

### Visual Storytelling
- `comic-book-creator` - Create comic strips
- `movie-storyboard` - Film storyboards

## ✍️ Writing Effective Prompts

### Best Practices

1. **Be Specific**: Clearly describe what you want
2. **Include Details**: Mention style, quality, composition
3. **Set Context**: Use system messages for AI behavior
4. **Add Parameters**: Use structured data for fine control

### Example

```json
{
  "prompt": "Create a professional headshot with natural lighting, neutral background, and confident expression. Ensure high resolution and studio-quality output.",
  "system": "You are a professional portrait photographer with expertise in corporate headshots.",
  "parameters": {
    "style": "corporate",
    "lighting": "natural",
    "quality": "maximum"
  }
}
```

## 🔄 Hot Reloading (Development)

During development, you can reload prompts without restarting:

```typescript
import { promptsService } from './services';

// Reload configuration
await promptsService.reloadConfig();
```

## 🛡️ Security Notes

- **Never commit** `prompts.config.json` with sensitive prompts
- Use environment variables for API keys
- Template file is safe to commit
- Keep proprietary prompts confidential

## 🧪 Testing Prompts

1. Edit `prompts.config.json`
2. Save the file
3. Refresh the application
4. Test the functionality
5. Iterate based on results

## 📊 Prompt Parameters

Parameters provide structured control over AI generation:

```json
{
  "parameters": {
    "output_format": "3x3 grid",
    "style_diversity": "high",
    "realism_level": "maximum",
    "aspect_ratio": "1:1",
    "quality": "hd"
  }
}
```

## 🔍 Debugging

### Check If Config Loaded

```typescript
import { promptsService } from './services';

console.log('Config loaded:', promptsService.isLoaded());
console.log('Version:', await promptsService.getVersion());
```

### Get Specific Prompt

```typescript
const prompt = await promptsService.getPrompt('hairstyle-changer');
console.log('Prompt:', prompt);
```

### View All Category Functionalities

```typescript
const funcs = await promptsService.getCategoryFunctionalities('portrait-manipulation');
console.log('Functionalities:', funcs);
```

## 🌐 Global Settings

Configure application-wide settings:

```json
{
  "global_settings": {
    "default_quality": "high",     // low, medium, high, ultra
    "safety_filter": "medium",     // off, low, medium, high
    "aspect_ratio": "auto",        // auto, 1:1, 16:9, 4:3
    "language": "en"               // en, es, fr, de, etc.
  }
}
```

## 📦 Version Control

### What to Commit
✅ `prompts.config.template.json` - Template file
✅ `PROMPTS.md` - This documentation

### What to Ignore
❌ `prompts.config.json` - Your actual configuration

## 🔧 Advanced Usage

### Custom Categories

Add your own categories:

```json
{
  "categories": {
    "my-custom-category": {
      "name": "My Category",
      "description": "Custom category description",
      "functionalities": {
        "my-functionality": {
          "prompt": "Custom prompt here",
          "system": "Custom system message"
        }
      }
    }
  }
}
```

### Dynamic Prompts

Use placeholders that can be replaced at runtime:

```json
{
  "prompt": "Transform this {input_type} using {style_name} style with {quality_level} quality"
}
```

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review example prompts in template
3. Test with fallback configuration
4. Consult AI prompt engineering best practices

## 🚀 Pro Tips

1. **Test Incrementally**: Change one prompt at a time
2. **Version Your Prompts**: Keep backups of working configurations
3. **Document Changes**: Add comments in your config
4. **Share Templates**: Create templates for different use cases
5. **Optimize Iteratively**: Refine prompts based on output quality

---

**Remember**: Great prompts = Great results! Take time to craft detailed, specific instructions for the best AI-generated images.
