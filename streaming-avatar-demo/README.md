# Streaming Avatar Demo

## Overview

This is an interactive web application that demonstrates real-time AI-powered avatars using [HeyGen Streaming Avatar](https://www.heygen.com/) and [OpenAI](https://openai.com/) technologies. The app allows users to interact with a virtual avatar that can speak, respond to typed or spoken input, and act as an English tutor powered by OpenAI's GPT-4 Turbo and Whisper APIs.

## Related Tutorials Covered

This project brings together concepts from the following HeyGen documentation tutorials:

- **[Demo: Create a Vite Project with Streaming SDK](https://docs.heygen.com/docs/creating-a-vite-project-with-streaming-sdk)**  
  Learn how to set up a modern Vite project and integrate the HeyGen Streaming SDK for real-time avatar streaming.

- **[Integrating OpenAI Assistant with Streaming SDK](https://docs.heygen.com/docs/integrate-with-opeanai-assistant)**  
  See how to connect OpenAI's Assistant (GPT-4 Turbo) to the avatar for conversational AI capabilities.

- **[Adding Speech-to-Text Integration to Demo Project](https://docs.heygen.com/docs/adding-speech-to-text-integration-to-demo-project)**  
  Add voice input to your app using OpenAI Whisper for speech-to-text, enabling spoken conversations with the avatar.

## Demo Video

Watch a demonstration of the application in action:

[![Streaming Avatar Demo](https://img.youtube.com/vi/CYBEA5hUpbg/0.jpg)](https://youtu.be/CYBEA5hUpbg)

## Why Use This Application?

- **AI-Powered English Tutor:** The avatar leverages OpenAI's GPT-4 Turbo to provide conversational English tutoring, grammar correction, and language learning suggestions.
- **Speech-to-Text Integration:** Users can interact with the avatar by typing or by speaking, thanks to OpenAI Whisper's speech-to-text capabilities.
- **Real-Time Streaming Avatar:** The HeyGen avatar streams video in real time, making interactions engaging and lifelike.
- **Modern Web Stack:** Built with Vite and TypeScript for fast development and modern best practices.

## Features

- Start and stop a real-time avatar video session.
- Type messages or use your microphone to talk to the avatar.
- Receive spoken responses from the avatar, powered by OpenAI.
- Designed for language learning and conversational practice.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Clone the Repository

```bash
git clone <your-repo-url>
cd streaming-avatar-demo
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_HEYGEN_API_KEY=your_heygen_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

- **VITE_HEYGEN_API_KEY:** Get your API key from [HeyGen](https://www.heygen.com/).
- **VITE_OPENAI_API_KEY:** Get your API key from [OpenAI](https://platform.openai.com/).

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to [http://localhost:5173](http://localhost:5173) (or the URL shown in your terminal).

### Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

- Click **Start Session** to initialize the avatar.
- Type a message and click **Speak** to interact via text.
- Click **Start Recording** to speak to the avatar; your speech will be transcribed and sent to the AI.
- Click **End Session** to stop the avatar.

## Technologies Used

- [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [HeyGen Streaming Avatar](https://www.heygen.com/)
- [OpenAI GPT-4 Turbo](https://platform.openai.com/docs/models/gpt-4)
- [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text)
- [Pico.css](https://picocss.com/) for minimal styling

## License

This project is for demonstration and educational purposes only. Please refer to the respective service providers for their terms of use. 