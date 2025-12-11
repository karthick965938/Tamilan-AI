# 🎨 Gemini Creative Studio

A powerful, feature-rich React application offering **10 distinct AI-powered image generation functionalities** using Google's Gemini AI. Create stunning visuals for hairstyles, fashion, food photography, comics, and more—all with an intuitive, modern interface.

**Powered by [TamilanAI.com](http://tamilanai.com/)**

## ✨ Features

### 🎯 10 AI-Powered Functionalities

1. **💇 Hairstyle Changer** - Generate 9 different hairstyle variations from portrait images
2. **👔 OOTD Generator** - Create Outfit of the Day photos by combining person and clothing images
3. **👗 Clothing Changer** - Transform clothing on person images with new styles
4. **💥 Explosive Food Photography** - Generate dramatic food explosion scenes
5. **🎨 Fashion Moodboard** - Create annotated fashion mood boards from reference images
6. **📦 Product Packaging** - Apply designs to 3D product packaging mockups
7. **🍔 Calorie Annotator** - Analyze and annotate food images with nutritional information
8. **📸 ID Photo Creator** - Generate professional ID photos from portraits
9. **📚 Comic Book Creator** - Transform images into comic strip panels
10. **🎬 Movie Storyboard** - Create film noir style 12-part storyboards

### 🚀 Key Highlights

- ✅ **Modern UI/UX** - Premium design with glassmorphism, gradients, and smooth animations
- ✅ **Drag & Drop Upload** - Intuitive image upload with visual feedback
- ✅ **Real-time Processing** - Beautiful loading indicators with step-by-step progress
- ✅ **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ✅ **Image Preview** - Fullscreen preview with enhanced controls
- ✅ **Download & Save** - Easy download options for generated images
- ✅ **Error Handling** - Comprehensive validation and user-friendly error messages
- ✅ **Dark Mode Ready** - Modern color schemes and visual design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (for cloning the repository)
- **Google Gemini API Key** (required for AI functionality)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Gemini-Multi-Purpose-App
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
touch .env
```

Add your Gemini API configuration:

```env
# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta

# Optional: Application Configuration
VITE_APP_TITLE=Gemini Creative Studio
VITE_MAX_FILE_SIZE=5242880
```

### 4. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and paste it in your `.env` file

## 🚀 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Code Quality

Run ESLint to check for code issues:

```bash
npm run lint
```

Format code with Prettier:

```bash
npm run format
```

## 📁 Project Structure

```
gemini-creative-studio/
├── public/                          # Static assets
├── src/
│   ├── components/                  # React components
│   │   ├── functionalities/         # AI functionality components
│   │   │   ├── HairstyleChanger/
│   │   │   ├── OOTDGenerator/
│   │   │   ├── ClothingChanger/
│   │   │   ├── ExplosiveFoodGenerator/
│   │   │   ├── FashionMoodboard/
│   │   │   ├── ProductPackaging/
│   │   │   ├── CalorieAnnotator/
│   │   │   ├── IDPhotoCreator/
│   │   │   ├── ComicBookCreator/
│   │   │   └── MovieStoryboard/
│   │   ├── ImageUploader/           # Image upload component
│   │   ├── OutputDisplay/           # Output display components
│   │   ├── ProcessingIndicator/     # Loading states
│   │   ├── Sidebar/                 # Navigation sidebar
│   │   ├── Toast/                   # Notification system
│   │   └── ...                      # Other shared components
│   ├── services/                    # API services
│   │   └── GeminiService.ts         # Gemini AI integration
│   ├── types/                       # TypeScript type definitions
│   ├── constants/                   # Application constants
│   ├── utils/                       # Utility functions
│   ├── App.tsx                      # Main application component
│   ├── App.css                      # Global styles
│   └── main.tsx                     # Application entry point
├── .env                             # Environment variables (create this)
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
└── README.md                        # This file
```

## 🎨 Tech Stack

### Core Technologies
- **React 18** - UI library with modern hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server

### Key Libraries
- **React Router DOM 6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Google Gemini AI** - AI image generation

### Development Tools
- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting

## 🎯 Usage Guide

### Basic Workflow

1. **Select a Functionality** - Choose from 10 AI features in the sidebar
2. **Upload Images** - Drag & drop or click to upload required images
3. **Configure Options** - Adjust settings specific to each functionality
4. **Generate** - Click the generate button to process
5. **View Results** - Preview generated images in fullscreen
6. **Download** - Save your favorite results

### Image Requirements

- **Format**: JPEG, PNG, WebP
- **Max Size**: 5MB per image (configurable)
- **Recommended Resolution**: 1024x1024 or higher
- **Portrait images**: Clear, well-lit face and shoulders visible
- **Landscape images**: Properly framed for intended use

## 🔐 Security & Privacy

- All image processing uses Google's Gemini AI API
- Images are sent securely via HTTPS
- No images are stored permanently on servers
- API keys are kept secure in environment variables
- Never commit `.env` files to version control

## 🐛 Troubleshooting

### Common Issues

**Issue**: Application won't start
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: API errors
- Verify your Gemini API key is correct in `.env`
- Check API key has proper permissions
- Ensure API quota isn't exceeded

**Issue**: Image upload fails
- Check file size is under 5MB
- Verify file format is supported (JPEG, PNG, WebP)
- Check internet connection

**Issue**: Build errors
```bash
# Solution: Clear cache and rebuild
npm run clean
npm install
npm run build
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful image generation capabilities
- **React Team** for the amazing framework
- **Vite Team** for the blazing-fast build tool

## 👨‍💻 Author

**Karthick Nagarajan**

- 🌐 Website: [TamilanAI.com](http://tamilanai.com/)
- 💼 LinkedIn: [karthick-nagarajan-44800710b](https://www.linkedin.com/in/karthick-nagarajan-44800710b/)
- 📧 Email: [karthick965938@gmail.com](mailto:karthick965938@gmail.com)
- 📺 YouTube: [@TamilanAI-dm4sm](https://www.youtube.com/@TamilanAI-dm4sm)

## 📧 Support

For issues, questions, or suggestions:
- Open an issue in the repository
- Check existing issues for solutions
- Email: karthick965938@gmail.com

---

**Built with ❤️ using React, TypeScript, and Google Gemini AI**

*Powered by [TamilanAI.com](http://tamilanai.com/)*