import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType
} from "@heygen/streaming-avatar";
import { OpenAIAssistant } from "./openai-assistant";
// Add these imports at the top of your file
import { AudioRecorder } from "./audio-handler";


// DOM elements
const videoElement = document.getElementById("avatarVideo") as HTMLVideoElement;
const startButton = document.getElementById(
  "startSession"
) as HTMLButtonElement;
const endButton = document.getElementById("endSession") as HTMLButtonElement;
const speakButton = document.getElementById("speakButton") as HTMLButtonElement;
const userInput = document.getElementById("userInput") as HTMLInputElement;
// Add these DOM elements with your existing ones
const recordButton = document.getElementById("recordButton") as HTMLButtonElement;
const recordingStatus = document.getElementById("recordingStatus") as HTMLParagraphElement;

let avatar: StreamingAvatar | null = null;
let sessionData: any = null;
let openaiAssistant: OpenAIAssistant | null = null;

// Add these variables with your existing ones
let audioRecorder: AudioRecorder | null = null;
let isRecording = false;

// Add this function to handle speaking text
async function speakText(text: string) {
    if (avatar && text) {
        await avatar.speak({
            text: text,
        });
    }
}

// Add these functions for audio recording
function initializeAudioRecorder() {
    audioRecorder = new AudioRecorder(
        (status) => {
            recordingStatus.textContent = status;
        },
        (text) => {
            speakText(text);
        }
    );
}

async function toggleRecording() {
    if (!audioRecorder) {
        initializeAudioRecorder();
    }

    if (!isRecording) {
        recordButton.textContent = "Stop Recording";
        await audioRecorder?.startRecording();
        isRecording = true;
    } else {
        recordButton.textContent = "Start Recording";
        audioRecorder?.stopRecording();
        isRecording = false;
    }
}

// Add this event listener with your existing ones
recordButton.addEventListener("click", toggleRecording);

// Helper function to fetch access token
async function fetchAccessToken(): Promise<string> {
  const apiKey = import.meta.env.VITE_HEYGEN_API_KEY;
  const response = await fetch(
    "https://api.heygen.com/v1/streaming.create_token",
    {
      method: "POST",
      headers: { "x-api-key": apiKey },
    }
  );

  const { data } = await response.json();
  return data.token;
}

// Initialize streaming avatar session
async function initializeAvatarSession() {
  // Disable start button immediately to prevent double clicks
  startButton.disabled = true;

  try {
    const token = await fetchAccessToken();
    avatar = new StreamingAvatar({ token });

    // Initialize OpenAI Assistant
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    openaiAssistant = new OpenAIAssistant(openaiApiKey);
    await openaiAssistant.initialize();
    
    avatar.on(StreamingEvents.STREAM_READY, handleStreamReady);
    avatar.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);
    
    sessionData = await avatar.createStartAvatar({
      quality: AvatarQuality.Medium,
      avatarName: "Wayne_20240711",
      language: "English",
    });

    console.log("Session data:", sessionData);

    // Enable end button
    endButton.disabled = false;

  } catch (error) {
    console.error("Failed to initialize avatar session:", error);
    // Re-enable start button if initialization fails
    startButton.disabled = false;
  }
}

// Handle when avatar stream is ready
function handleStreamReady(event: any) {
  if (event.detail && videoElement) {
    videoElement.srcObject = event.detail;
    videoElement.onloadedmetadata = () => {
      videoElement.play().catch(console.error);
    };
  } else {
    console.error("Stream is not available");
  }
}

// Handle stream disconnection
function handleStreamDisconnected() {
  console.log("Stream disconnected");
  if (videoElement) {
    videoElement.srcObject = null;
  }

  // Enable start button and disable end button
  startButton.disabled = false;
  endButton.disabled = true;
}

// End the avatar session
async function terminateAvatarSession() {
  if (!avatar || !sessionData) return;

  await avatar.stopAvatar();
  videoElement.srcObject = null;
  avatar = null;
}

// Handle speaking event
async function handleSpeak() {
  if (avatar && openaiAssistant && userInput.value) {
    try {
      const response = await openaiAssistant.getResponse(userInput.value);
      await avatar.speak({
        text: response,
        taskType: TaskType.REPEAT,
      });
    } catch (error) {
      console.error("Error getting response:", error);
    }
    userInput.value = ""; // Clear input after speaking
  }
}

// Event listeners for buttons
startButton.addEventListener("click", initializeAvatarSession);
endButton.addEventListener("click", terminateAvatarSession);
speakButton.addEventListener("click", handleSpeak);