import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Music,
  Video,
  Languages,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Send,
  Loader2,
  Trash2,
  Download,
  ExternalLink,
  ChevronRight,
  Monitor,
  Check,
  HelpCircle,
  Copy,
  Info,
  Maximize2,
  ListRestart,
  Mic,
  MicOff,
  Radio,
  Headphones,
  Sliders,
  HardDrive,
  Cpu,
  Search,
  X,
  Filter
} from "lucide-react";
import {
  ChatMessage,
  AIModelPersona,
  LanguageOption,
  VoiceOption,
  GeneratedImageItem,
  GeneratedMusicItem,
  GeneratedVideoItem
} from "./types";
import { AIModelLogo } from "./components/AIModelLogos";
import { LiveWithAIModal } from "./components/LiveWithAIModal";
import { OSBuilderStudio } from "./components/OSBuilderStudio";
import { AppConverterStudio } from "./components/AppConverterStudio";

// Constant lists
const MODEL_PERSONAS: AIModelPersona[] = [
  {
    id: "devoapt",
    name: "DevoAPT Core",
    company: "DevoAPT AI",
    description: "Official Flagship cognitive model. Unified intelligence optimized for ultra-complex reasoning, full-stack code synthesis, creative narrative design, and multi-turn educational dialogues.",
    color: "from-indigo-600 via-purple-600 to-pink-600",
    accentColor: "#8b5cf6",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    logo: "🔮",
    versions: ["DevoAPT Omni Core v4.0", "DevoAPT Turbo v3.5", "DevoAPT Alpha-v2.1 (Outdated)", "DevoAPT Original-v1.0 (Outdated)"]
  },
  {
    id: "gemini",
    name: "Gemini",
    company: "Google",
    description: "Next-generation multimodal power. Deep mathematical logical reasoning, massive context retrieval, and high-fidelity text-to-speech synthesis capabilities.",
    color: "from-blue-600 via-indigo-600 to-violet-600",
    accentColor: "#4f46e5",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    logo: "🌌",
    versions: ["Gemini 2.5 Pro", "Gemini 2.5 Flash", "Gemini 1.5 Pro (Outdated)", "Gemini 1.5 Flash (Outdated)", "Gemini 1.0 Ultra (Outdated)"]
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    company: "OpenAI",
    description: "Structured analytical processing, polished prose style, conversational flow, and detailed markdown responses.",
    color: "from-emerald-600 to-teal-600",
    accentColor: "#10b981",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    logo: "🟢",
    versions: ["GPT-4o", "o3-mini", "GPT-4 (Outdated)", "GPT-3.5 Turbo (Outdated)", "GPT-3 (Outdated)"]
  },
  {
    id: "claude",
    name: "Claude",
    company: "Anthropic",
    description: "Highly articulate, nuanced, safety-oriented, and detail-driven assistant. Renowned for clean algorithms and documentation drafting.",
    color: "from-orange-600 to-amber-600",
    accentColor: "#f59e0b",
    badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    logo: "🍊",
    versions: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku", "Claude 3 Opus (Outdated)", "Claude 2.1 (Outdated)", "Claude 1.0 (Outdated)"]
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    company: "DeepSeek AI",
    description: "Highly advanced reasoning capabilities. Excellent at step-by-step math, competitive programming logic, and cost-efficient structured outputs.",
    color: "from-cyan-600 to-blue-700",
    accentColor: "#0891b2",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    logo: "🐋",
    versions: ["DeepSeek-V3", "DeepSeek-R1 (Reasoning)", "DeepSeek-V2.5 (Outdated)", "DeepSeek-Coder-V1.5 (Outdated)"]
  },
  {
    id: "copilot",
    name: "Copilot",
    company: "Microsoft",
    description: "Productivity companion. Merges web grounding search indexes with advanced contextual developer assistance and office suite automation.",
    color: "from-sky-500 via-indigo-500 to-blue-600",
    accentColor: "#0ea5e9",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    logo: "🚀",
    versions: ["Copilot Pro v2.0", "Copilot Bing-Chat v1.8", "Copilot Legacy v1.2 (Outdated)", "Bing AI Chat Classic (Outdated)"]
  },
  {
    id: "metaai",
    name: "Meta AI",
    company: "Meta",
    description: "Open-weights powerhouse. Deep knowledge coverage, versatile instructions following, friendly tone, and high conversational breadth.",
    color: "from-blue-500 via-sky-600 to-indigo-700",
    accentColor: "#2563eb",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    logo: "♾️",
    versions: ["Llama 3.3 70B", "Llama 3.1 405B", "Llama 3 8B (Outdated)", "Llama 2 (Outdated)", "LLaMA 1 (Outdated)"]
  },
  {
    id: "grok",
    name: "Grok",
    company: "xAI",
    description: "Witty, slightly rebellious, and humorous chatbot with real-time news search integration from X (Twitter).",
    color: "from-slate-700 to-slate-900",
    accentColor: "#475569",
    badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    logo: "🏴‍☠️",
    versions: ["Grok 2.0 Ultra", "Grok 2.0", "Grok 1.5 (Outdated)", "Grok 1.0 (Outdated)"]
  },
  {
    id: "siri",
    name: "Siri",
    company: "Apple",
    description: "Concise, sass-enabled local OS automation helper. Ideal for direct quick commands and action triggers.",
    color: "from-pink-600 via-rose-600 to-indigo-500",
    accentColor: "#f43f5e",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    logo: "📱",
    versions: ["Apple Intelligence Siri 18", "Siri Pro Mode", "Siri OS 17 (Outdated)", "Siri Classic OS 15 (Outdated)"]
  },
  {
    id: "bixby",
    name: "Bixby",
    company: "Samsung",
    description: "Task-oriented device assistant specialized in parsing detailed system capsules and multi-step custom command execution.",
    color: "from-blue-500 to-cyan-500",
    accentColor: "#06b6d4",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    logo: "💎",
    versions: ["Bixby 3.0 Live", "Bixby Voice 2.0", "Bixby Legacy 1.5 (Outdated)", "S Voice Classic (Outdated)"]
  }
];

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ru", name: "Russian", nativeName: "Русский" }
];

const VOICES: VoiceOption[] = [
  { id: "Kore", name: "Kore (Warm, Expressive)", gender: "Female", description: "Natural warm female presentation with expressive cadence", tone: "Warm", accent: "Neutral English" },
  { id: "Puck", name: "Puck (Bright, Energetic)", gender: "Male", description: "Crisp, lively, and articulate male voice", tone: "Energetic", accent: "Modern US" },
  { id: "Fenrir", name: "Fenrir (Deep, Cinematic)", gender: "Male", description: "Deep authoritative baritone voice", tone: "Authoritative", accent: "Studio Deep" },
  { id: "Aoede", name: "Aoede (Melodic, Soft)", gender: "Female", description: "Soft rhythmic acoustic phrasing", tone: "Gentle", accent: "Harmonic" },
  { id: "Charon", name: "Charon (Neutral, Steady)", gender: "Gender-Neutral", description: "Balanced, clear, objective studio narration", tone: "Balanced", accent: "Broadcast" },
  { id: "Zephyr", name: "Zephyr (Modern, Casual)", gender: "Male", description: "Relaxed conversational contemporary flow", tone: "Casual", accent: "Conversational" },
  { id: "Vega", name: "Vega (Crisp, Dynamic)", gender: "Female", description: "Crisp intelligent specialist tone", tone: "Analytical", accent: "Direct" },
  { id: "Luna", name: "Luna (Gentle, Serene)", gender: "Female", description: "Calm, serene, and clear cadence", tone: "Serene", accent: "Soft" },
  { id: "Sol", name: "Sol (Confident, Warm)", gender: "Male", description: "Confident, engaging, and friendly presentation", tone: "Confident", accent: "Warm" }
];

export default function App() {
  // General App State
  const [activeTab, setActiveTab] = useState<"chat" | "image" | "music" | "video" | "os" | "converter">("chat");
  const [isLiveModalOpen, setIsLiveModalOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<AIModelPersona>(MODEL_PERSONAS[0]);
  const [selectedVersion, setSelectedVersion] = useState<string>(MODEL_PERSONAS[0].versions[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState<number>(1.0);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const [autoVoice, setAutoVoice] = useState<boolean>(false);
  const [ethicsShield, setEthicsShield] = useState<boolean>(true);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");

  // Voice Input State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeMicTarget, setActiveMicTarget] = useState<"chat" | "image" | "music" | "video" | null>(null);
  const recognitionRef = useRef<any>(null);

  // Speech Recognition Microphone Toggle Handler
  const toggleSpeechRecognition = (target: "chat" | "image" | "music" | "video") => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Microphone Speech Recognition is not supported by your browser. Please type your input directly.");
      return;
    }

    // If currently listening on the same target, stop it
    if (isListening && activeMicTarget === target) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setActiveMicTarget(null);
      return;
    }

    // Stop existing instance if switching target
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage.code === "ur" ? "ur-PK" : selectedLanguage.code === "es" ? "es-ES" : selectedLanguage.code === "fr" ? "fr-FR" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setActiveMicTarget(target);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        if (target === "chat") {
          setChatInput(transcript);
        } else if (target === "image") {
          setImagePrompt(transcript);
        } else if (target === "music") {
          setMusicPrompt(transcript);
        } else if (target === "video") {
          setVideoPrompt(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice/error:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
          setActiveMicTarget(null);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveMicTarget(null);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      setActiveMicTarget(null);
    }
  };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "model",
      text: "Welcome to DevoAPT! I am your unified, multimodal AI assistant. I can solve any question, write clean code, synthesize high-quality images, draft custom lyric/music tracks, and render cinematic videos. Choose your specialized DevoAPT Cognitive Engine and let's get started!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null); // messageId
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Image Studio State
  const [imagePrompt, setImagePrompt] = useState<string>("");
  const [imageModel, setImageModel] = useState<"imagen" | "gemini">("imagen");
  const [imageAspectRatio, setImageAspectRatio] = useState<string>("1:1");
  const [isImageGenerating, setIsImageGenerating] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<GeneratedImageItem | null>(null);

  // Music Studio State
  const [musicPrompt, setMusicPrompt] = useState<string>("");
  const [musicDuration, setMusicDuration] = useState<number>(30);
  const [isMusicGenerating, setIsMusicGenerating] = useState<boolean>(false);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusicItem[]>([]);
  const [currentlyPlayingMusic, setCurrentlyPlayingMusic] = useState<string | null>(null); // musicId
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Video Studio State
  const [videoPrompt, setVideoPrompt] = useState<string>("");
  const [videoAspectRatio, setVideoAspectRatio] = useState<string>("16:9");
  const [isVideoCreating, setIsVideoCreating] = useState<boolean>(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoItem[]>([]);

  // Update selected version when model changes
  useEffect(() => {
    setSelectedVersion(selectedModel.versions[0]);
  }, [selectedModel]);

  // Cleanup audio players on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
    };
  }, []);

  // Poll video status
  useEffect(() => {
    const activeVideoOps = generatedVideos.filter(v => v.status === "generating" || v.status === "queued");
    if (activeVideoOps.length === 0) return;

    const interval = setInterval(async () => {
      const updatedVideos = [...generatedVideos];
      let hasChanges = false;

      for (let i = 0; i < updatedVideos.length; i++) {
        const video = updatedVideos[i];
        if ((video.status === "generating" || video.status === "queued") && video.operationName) {
          try {
            const res = await fetch("/api/video-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName: video.operationName })
            });
            const data = await res.json();
            
            if (data.done) {
              updatedVideos[i] = {
                ...video,
                status: "completed",
                url: `/api/video-download?operationName=${encodeURIComponent(video.operationName)}`
              };
              hasChanges = true;
            } else if (data.error) {
              updatedVideos[i] = {
                ...video,
                status: "failed",
                error: data.error.message || "Failed during video rendering"
              };
              hasChanges = true;
            }
          } catch (e) {
            console.error("Error polling video status", e);
          }
        }
      }

      if (hasChanges) {
        setGeneratedVideos(updatedVideos);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [generatedVideos]);

  // Text Chat Submit Handler
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsgText = chatInput.trim();
    setChatInput("");

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      // Create simplified payload of historical messages to send
      const historyPayload = chatMessages.slice(-8).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          model: selectedModel.id,
          version: selectedVersion,
          language: selectedLanguage.name,
          chatHistory: historyPayload,
          ethicsShield: ethicsShield
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate reply");

      const modelMessageId = `msg-model-${Date.now()}`;
      const modelMessage: ChatMessage = {
        id: modelMessageId,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, modelMessage]);

      // If autoVoice is enabled, immediately trigger text-to-speech for this message
      if (autoVoice) {
        speakText(modelMessageId, data.text);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-error-${Date.now()}`,
          role: "model",
          text: `⚠️ Error: ${err.message || "Could not complete request. Please ensure you have added your GEMINI_API_KEY to secrets."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Test Voice in Sidebar
  const testVoiceSample = async (voice: VoiceOption) => {
    if (isTestingVoice) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsTestingVoice(false);
      return;
    }

    setIsTestingVoice(true);
    const samplePhrase = `Hello! I am ${voice.name}. Powered by DevoAPT high-definition neural speech engine.`;

    try {
      const res = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: samplePhrase,
          voice: voice.id,
          language: selectedLanguage.name
        })
      });

      const data = await res.json();
      if (!res.ok || !data.audio) throw new Error(data.error || "Speech API unavailable");

      const audioUrl = `data:audio/wav;base64,${data.audio}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = voicePlaybackSpeed;
      audioRef.current = audio;

      audio.onended = () => setIsTestingVoice(false);
      audio.onerror = () => setIsTestingVoice(false);

      await audio.play();
    } catch (e) {
      console.warn("Fallback to browser speech synthesizer for sample", e);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(samplePhrase);
        utterance.rate = voicePlaybackSpeed;
        utterance.onend = () => setIsTestingVoice(false);
        utterance.onerror = () => setIsTestingVoice(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsTestingVoice(false);
      }
    }
  };

  // Text to Speech Activation
  const speakText = async (messageId: string, text: string) => {
    // If already playing this message, stop it
    if (currentlyPlayingAudio === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setCurrentlyPlayingAudio(null);
      return;
    }

    // Stop current playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Set loading status for target message
    setChatMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, isAudioLoading: true } : m))
    );
    setCurrentlyPlayingAudio(messageId);

    try {
      // Remove markdown characters to make speech cleaner
      const speechTextClean = text.replace(/[*#`_\-]/g, "");

      const res = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: speechTextClean,
          voice: selectedVoice.id,
          language: selectedLanguage.name
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed speech request");

      const audioUrl = `data:audio/wav;base64,${data.audio}`;
      
      // Setup HTMLAudioElement
      const audio = new Audio(audioUrl);
      audio.playbackRate = voicePlaybackSpeed;
      audioRef.current = audio;

      audio.onplay = () => {
        setChatMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, isAudioLoading: false } : m))
        );
      };

      audio.onended = () => {
        setCurrentlyPlayingAudio(null);
      };

      audio.onerror = () => {
        setCurrentlyPlayingAudio(null);
      };

      await audio.play();
    } catch (err: any) {
      console.warn("Gemini TTS engine failed, invoking client-side window.speechSynthesis fallback...", err);
      try {
        if ('speechSynthesis' in window) {
          // Cancel active speech
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_\-]/g, ""));
          
          // Map language code
          if (selectedLanguage && selectedLanguage.code) {
            utterance.lang = selectedLanguage.code === "ur" ? "ur-PK" : selectedLanguage.code === "hi" ? "hi-IN" : selectedLanguage.code;
          }
          utterance.rate = voicePlaybackSpeed;
          utterance.pitch = 1.0;
          
          utterance.onstart = () => {
            setChatMessages(prev =>
              prev.map(m => (m.id === messageId ? { ...m, isAudioLoading: false } : m))
            );
          };
          utterance.onend = () => {
            setCurrentlyPlayingAudio(null);
          };
          utterance.onerror = () => {
            setCurrentlyPlayingAudio(null);
          };
          
          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error("Web speech synthesis is not supported on this browser.");
        }
      } catch (speechErr: any) {
        console.error("Local SpeechSynthesis also failed:", speechErr);
        setCurrentlyPlayingAudio(null);
        setChatMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, isAudioLoading: false } : m))
        );
      }
    }
  };

  // Copy to Clipboard helper
  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Image Generation Handler
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim() || isImageGenerating) return;

    setIsImageGenerating(true);
    const activePrompt = imagePrompt.trim();

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          model: imageModel,
          aspectRatio: imageAspectRatio
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");

      const newItem: GeneratedImageItem = {
        id: `img-${Date.now()}`,
        prompt: activePrompt,
        url: data.imageUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: imageModel === "imagen" ? "Imagen 4" : "Gemini 2.5 Flash",
        aspectRatio: imageAspectRatio
      };

      setGeneratedImages(prev => [newItem, ...prev]);
      setImagePrompt("");
    } catch (err: any) {
      console.error(err);
      alert(`Image Studio Error: ${err.message || "Failed image synthesis. Make sure API keys are loaded."}`);
    } finally {
      setIsImageGenerating(false);
    }
  };

  // Music Studio Generation Handler
  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim() || isMusicGenerating) return;

    setIsMusicGenerating(true);
    const activePrompt = musicPrompt.trim();

    try {
      const res = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          duration: musicDuration
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate music");

      const newItem: GeneratedMusicItem = {
        id: `music-${Date.now()}`,
        prompt: activePrompt,
        url: `data:${data.mimeType || "audio/wav"};base64,${data.audio}`,
        lyrics: data.lyrics,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: musicDuration
      };

      setGeneratedMusic(prev => [newItem, ...prev]);
      setMusicPrompt("");
    } catch (err: any) {
      console.error("Generating using simulated synthesizer backup...");
      // Provide a cinematic simulated music file when the credentials are not configured or on failure
      setTimeout(() => {
        const simAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Create an organic cosmic ambient drone
        const osc1 = simAudioContext.createOscillator();
        const osc2 = simAudioContext.createOscillator();
        const gainNode = simAudioContext.createGain();
        
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(110, simAudioContext.currentTime); // A2 base
        osc1.frequency.exponentialRampToValueAtTime(146.83, simAudioContext.currentTime + 8); // transition to D3
        
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(220, simAudioContext.currentTime); // A3
        osc2.frequency.exponentialRampToValueAtTime(293.66, simAudioContext.currentTime + 10); // transition to D4

        gainNode.gain.setValueAtTime(0.01, simAudioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, simAudioContext.currentTime + 2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, simAudioContext.currentTime + 15);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(simAudioContext.destination);

        osc1.start();
        osc2.start();
        osc1.stop(simAudioContext.currentTime + 16);
        osc2.stop(simAudioContext.currentTime + 16);

        // Add to list as simulated track
        const newItem: GeneratedMusicItem = {
          id: `music-sim-${Date.now()}`,
          prompt: `${activePrompt} (Synthesized Ambient Drone)`,
          url: "SIMULATED",
          lyrics: `[Cosmic Synthesizer Synth Loop - Waveform actively driving ambient tones in ${musicDuration} seconds]\n\n♪ Soft analog space synth pad fading in\n♪ Gentle harmonic frequency sweep (A2/A3 to D3/D4)\n♪ Deep resonance expansion simulating orbital decay\n♪ Soft fade-out into silent vacuum`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: musicDuration
        };

        setGeneratedMusic(prev => [newItem, ...prev]);
        setMusicPrompt("");
        setIsMusicGenerating(false);
      }, 1500);
    } finally {
      setIsMusicGenerating(false);
    }
  };

  // Play Music Player
  const togglePlayMusic = (item: GeneratedMusicItem) => {
    if (currentlyPlayingMusic === item.id) {
      if (musicAudioRef.current) musicAudioRef.current.pause();
      setCurrentlyPlayingMusic(null);
    } else {
      if (musicAudioRef.current) musicAudioRef.current.pause();
      
      if (item.url === "SIMULATED") {
        // Trigger simulation audio playing
        setCurrentlyPlayingMusic(item.id);
        setTimeout(() => {
          setCurrentlyPlayingMusic(null);
        }, item.duration * 1000);
      } else {
        const audio = new Audio(item.url);
        musicAudioRef.current = audio;
        setCurrentlyPlayingMusic(item.id);
        audio.onended = () => setCurrentlyPlayingMusic(null);
        audio.onerror = () => setCurrentlyPlayingMusic(null);
        audio.play().catch(e => {
          console.error(e);
          setCurrentlyPlayingMusic(null);
        });
      }
    }
  };

  // Video Studio Creation Handler
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPrompt.trim() || isVideoCreating) return;

    setIsVideoCreating(true);
    const activePrompt = videoPrompt.trim();

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          aspectRatio: videoAspectRatio
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start video operation");

      const newItem: GeneratedVideoItem = {
        id: `vid-${Date.now()}`,
        prompt: activePrompt,
        operationName: data.operationName,
        status: "queued",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setGeneratedVideos(prev => [newItem, ...prev]);
      setVideoPrompt("");
    } catch (err: any) {
      console.error("Veo Engine error, adding simulation queue item...");
      // Add simulated item
      const newItem: GeneratedVideoItem = {
        id: `vid-sim-${Date.now()}`,
        prompt: `${activePrompt} (Veo Simulation)`,
        status: "queued",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setGeneratedVideos(prev => [newItem, ...prev]);
      setVideoPrompt("");

      // Simulate step-by-step progress
      setTimeout(() => {
        setGeneratedVideos(prev =>
          prev.map(v => v.id === newItem.id ? { ...v, status: "generating" } : v)
        );
      }, 3000);

      setTimeout(() => {
        setGeneratedVideos(prev =>
          prev.map(v => v.id === newItem.id ? { ...v, status: "completed", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" } : v)
        );
      }, 15000);
    } finally {
      setIsVideoCreating(false);
    }
  };

  // Clear Chat History
  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your current conversation?")) {
      setChatMessages([
        {
          id: "cleared-init",
          role: "model",
          text: `Chat history reset. Ready for your prompt in the language: ${selectedLanguage.name}. Using ${selectedModel.name} (${selectedVersion}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Distinct company list for filter chips
  const companyFilters = ["All", ...Array.from(new Set(MODEL_PERSONAS.map((m) => m.company)))];

  // Filtered AI Models based on search query & company filter
  const filteredModels = MODEL_PERSONAS.filter((m) => {
    const matchesCompany =
      selectedCompanyFilter === "all" ||
      selectedCompanyFilter === "All" ||
      m.company.toLowerCase() === selectedCompanyFilter.toLowerCase();
    const q = modelSearchQuery.toLowerCase().trim();
    if (!q) return matchesCompany;
    const matchesQuery =
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.versions.some((v) => v.toLowerCase().includes(q));
    return matchesCompany && matchesQuery;
  });

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[#0b0c10] text-[#c5c6c7] selection:bg-brand-purple/40">
      {/* Upper Status Banner with Responsive, Highly Clickable Action Buttons */}
      <header className="border-b px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-3 sm:gap-4 shadow-md sticky top-0 z-40 backdrop-blur-md bg-[#0f111a]/95 border-[#1f2833]">
        {/* Brand logo and Title */}
        <div
          onClick={() => setActiveTab("chat")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          title="Return to Main Chat"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg sm:text-xl shadow-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-violet-500/20 group-hover:scale-105 transition-transform">
            D
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white font-display tracking-tight flex items-center gap-1.5">
              DevoAPT <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded border font-mono bg-brand-purple/20 text-brand-purple border-brand-purple/30">v4.5 Enterprise</span>
            </h1>
            <p className="text-[11px] text-[#868d99] font-mono hidden sm:block">
              Quantum Multimodal Synthesis Terminal
            </p>
          </div>
        </div>

        {/* Action Controls: Responsive & Clickable */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* 1. Create Your Own App Quick Launcher */}
          <button
            type="button"
            onClick={() => setActiveTab("converter")}
            className={`px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-display font-bold shadow-md flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer active:scale-95 border select-none ${
              activeTab === "converter"
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white border-purple-300 ring-2 ring-purple-500/40 shadow-purple-950/60"
                : "bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 hover:from-purple-600 hover:to-blue-600 text-purple-200 hover:text-white border-purple-500/30"
            }`}
            title="Convert HTML or Website into Windows .EXE, Android .APK, iOS .IPA"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 animate-spin-slow" />
            <span className="whitespace-nowrap">Create Your Own</span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-purple-200 font-mono hidden sm:inline">
              EXE • APK • IPA
            </span>
          </button>

          {/* 2. Make Your Own OS Quick Launcher */}
          <button
            type="button"
            onClick={() => setActiveTab("os")}
            className={`px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-display font-bold shadow-md flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer active:scale-95 border select-none ${
              activeTab === "os"
                ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white border-cyan-300 ring-2 ring-cyan-500/40 shadow-cyan-950/60"
                : "bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 hover:from-cyan-600 hover:to-indigo-600 text-cyan-200 hover:text-white border-cyan-500/30"
            }`}
            title="Custom Bootable Operating System ISO Generator"
          >
            <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
            <span className="whitespace-nowrap">Make Your Own OS</span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-cyan-200 font-mono hidden sm:inline">
              ISO Builder
            </span>
          </button>

          {/* 3. Live with AI glowing quick launcher */}
          <button
            type="button"
            onClick={() => setIsLiveModalOpen(true)}
            className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-violet-600 hover:from-red-500 hover:to-violet-500 text-white text-xs font-display font-bold shadow-lg shadow-red-950/40 flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-all border border-red-400/40 cursor-pointer select-none"
            title="Start real-time bidirectional AI voice conversation"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-300 animate-ping"></span>
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span className="whitespace-nowrap">Live with AI</span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-red-200 font-mono hidden sm:inline">
              Voice Call
            </span>
          </button>

          {/* 4. Microphone Quick Status Indicator */}
          {isListening && (
            <button
              type="button"
              onClick={() => {
                if (recognitionRef.current) {
                  try { recognitionRef.current.stop(); } catch (e) {}
                }
                setIsListening(false);
                setActiveMicTarget(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-mono animate-bounce cursor-pointer"
              title="Click to stop microphone listening"
            >
              <Mic className="w-3.5 h-3.5 text-red-400 animate-spin" />
              <span className="hidden sm:inline">Stop Mic ({activeMicTarget?.toUpperCase()})</span>
              <span className="sm:hidden">Mic ON</span>
            </button>
          )}

          {/* 5. Clickable Auto-Voice Toggle Button */}
          <button
            type="button"
            onClick={() => setAutoVoice(!autoVoice)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none ${
              autoVoice
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950"
                : "bg-[#181a24] text-gray-400 border-[#2d3748] hover:text-gray-200 hover:bg-[#202433]"
            }`}
            title={`Click to turn Auto-Voice ${autoVoice ? "OFF" : "ON"}`}
          >
            {autoVoice ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
            <span className="hidden sm:inline">Auto-Voice:</span>
            <span className={autoVoice ? "text-emerald-400 font-bold" : "text-gray-500"}>
              {autoVoice ? "ON" : "OFF"}
            </span>
          </button>

          {/* 6. Active Language & Voice Quick Badges */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono">
            <span className="px-2 py-1 rounded-lg border bg-[#181a24] border-[#252836] text-brand-cyan">
              🌐 {selectedLanguage.name}
            </span>
            <span className="px-2 py-1 rounded-lg border bg-[#181a24] border-[#252836] text-[#e0a96d]">
              🎙️ {selectedVoice.name.split(" ")[0]}
            </span>
          </div>

          {/* 7. Server Live status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141722] border border-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* SIDE PANEL: Configuration Control center */}
        <aside className="w-full lg:w-[350px] border-b lg:border-b-0 lg:border-r p-4 sm:p-5 flex flex-col gap-5 overflow-y-auto max-h-[500px] lg:max-h-[calc(100vh-65px)] bg-[#0c0e14] border-[#1f2833]">
          {/* Section 1: AI Model Selection Matrix with Dedicated Search Bar */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-[#1f85de] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1f85de]" /> Cognitive Engine Selection
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                {filteredModels.length}/{MODEL_PERSONAS.length}
              </span>
            </div>

            {/* Dedicated AI Model Search Bar Right on AI Model Bar */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={modelSearchQuery}
                  onChange={(e) => setModelSearchQuery(e.target.value)}
                  placeholder="Search AI models (e.g. GPT, Claude, Gemini, DeepSeek)..."
                  className="w-full bg-[#12141c] border border-[#1f2833] focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/40 rounded-xl pl-9 pr-8 py-2 text-white placeholder-gray-500 font-mono text-xs outline-none transition-all"
                />
                {modelSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModelSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded-md bg-white/5 hover:bg-white/10"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Quick Company Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px] font-mono">
                {companyFilters.map((comp) => {
                  const isCompActive =
                    (selectedCompanyFilter === "all" && comp === "All") ||
                    selectedCompanyFilter.toLowerCase() === comp.toLowerCase();
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setSelectedCompanyFilter(comp === "All" ? "all" : comp)}
                      className={`px-2 py-0.5 rounded-md border whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                        isCompActive
                          ? "bg-brand-purple/20 text-brand-purple border-brand-purple/40 font-bold"
                          : "bg-[#141622] text-gray-400 hover:text-white border-[#222736]"
                      }`}
                    >
                      {comp}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* AI Models Grid */}
            {filteredModels.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredModels.map((m) => {
                  const isSelected = selectedModel.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m);
                        if (!m.versions.includes(selectedVersion)) {
                          setSelectedVersion(m.versions[0]);
                        }
                      }}
                      className={`relative p-3 rounded-xl border text-left transition-all overflow-hidden cursor-pointer active:scale-95 ${
                        isSelected
                          ? `bg-gradient-to-br ${m.color} text-white border-transparent shadow-md shadow-black/40 ring-1 ring-white/30`
                          : "bg-[#12141c] hover:bg-[#1a1d29] border-[#1f2833] text-[#c5c6c7]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="p-1 rounded-lg bg-black/30 border border-white/10 backdrop-blur-sm">
                          <AIModelLogo modelId={m.id} size={22} className="shrink-0" />
                        </div>
                        <span className="text-[10px] font-mono opacity-80">{m.company}</span>
                      </div>
                      <div className="font-display font-bold text-sm tracking-tight truncate">{m.name}</div>
                      
                      {isSelected && (
                        <div className="absolute right-1 bottom-1 w-2 h-2 rounded-full bg-white animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Empty Search Fallback */
              <div className="p-4 rounded-xl bg-[#12141c] border border-dashed border-[#252836] text-center space-y-2">
                <Search className="w-6 h-6 text-gray-500 mx-auto" />
                <div className="text-xs text-gray-300 font-semibold">No AI models found</div>
                <p className="text-[11px] text-gray-500">
                  No engines match "{modelSearchQuery}" in {selectedCompanyFilter}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setModelSearchQuery("");
                    setSelectedCompanyFilter("all");
                  }}
                  className="px-3 py-1 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple border border-brand-purple/40 text-xs font-mono transition-all"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Live with AI quick card */}
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-purple-950/40 to-indigo-950/40 border border-red-500/30 text-xs flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>Real-Time Live Voice</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Talk live with {selectedModel.name} via high-fidelity audio</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
              >
                Start Live
              </button>
            </div>

            {/* Selected model details */}
            <div className="mt-3 p-3 rounded-xl bg-[#12141c] border border-[#1f2833] text-xs">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <AIModelLogo modelId={selectedModel.id} size={14} />
                  <span className="font-semibold text-white">Active Version</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan text-[10px] font-mono">Ready</span>
              </div>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full bg-[#1c2030] border border-[#2a3048] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:ring-1 focus:ring-brand-purple outline-none cursor-pointer"
              >
                {selectedModel.versions.map((ver) => (
                  <option key={ver} value={ver}>
                    {ver}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[#868d99] italic leading-relaxed text-[11px]">
                "{selectedModel.description}"
              </p>
            </div>
          </div>

          {/* Section 2: Localization Suite */}
          <div className="border-t border-[#1f2833] pt-5">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-[#14b8a6] flex items-center gap-2 mb-3">
              <Languages className="w-4 h-4 text-[#14b8a6]" /> Localization Matrix
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Response Language</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage.code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2 py-1.5 rounded-lg border text-left text-xs font-mono transition-all ${
                          isSelected
                            ? "bg-brand-teal/10 border-brand-teal text-brand-teal font-medium"
                            : "bg-[#12141c] border-[#1f2833] text-[#868d99] hover:bg-[#1a1d29]"
                        }`}
                      >
                        {lang.nativeName} ({lang.code.toUpperCase()})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Speech Synthesizer Control */}
          <div className="border-t border-[#1f2833] pt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-brand-purple flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-brand-purple" /> Vocal Synthesis
              </h2>
              {/* Auto voice toggle */}
              <button
                onClick={() => setAutoVoice(!autoVoice)}
                className={`p-1 rounded-md border text-[10px] font-mono transition-colors ${
                  autoVoice
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-[#12141c] text-[#868d99] border-[#1f2833]"
                }`}
                title="Automatically read model text replies out loud"
              >
                {autoVoice ? "AUTO ON" : "AUTO OFF"}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-gray-500 uppercase font-mono">Neural Voice Profile</label>
                  <span className="text-[10px] text-brand-purple font-mono">{selectedVoice.tone || "Natural"}</span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedVoice.id}
                    onChange={(e) => {
                      const found = VOICES.find(v => v.id === e.target.value);
                      if (found) setSelectedVoice(found);
                    }}
                    className="flex-1 bg-[#12141c] border border-[#1f2833] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:ring-1 focus:ring-brand-purple outline-none"
                  >
                    {VOICES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} ({voice.gender})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => testVoiceSample(selectedVoice)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isTestingVoice
                        ? "bg-violet-600 text-white border-violet-500 animate-pulse"
                        : "bg-[#1f2833] hover:bg-[#2d3748] text-white border-[#2d3748]"
                    }`}
                    title="Test this vocal profile sample"
                  >
                    {isTestingVoice ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isTestingVoice ? "Stop" : "Test"}</span>
                  </button>
                </div>
                
                {/* Voice speed selector */}
                <div className="mt-2.5 flex items-center justify-between bg-[#12141c] border border-[#1f2833] rounded-lg p-2">
                  <span className="text-[10px] text-gray-400 font-mono">Speed Rate:</span>
                  <div className="flex gap-1">
                    {[0.8, 1.0, 1.25].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setVoicePlaybackSpeed(speed)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                          voicePlaybackSpeed === speed
                            ? "bg-violet-600 text-white font-bold"
                            : "bg-[#1f2833] text-gray-400 hover:text-white"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-1.5 text-[11px] text-[#868d99] italic">
                  Powered by Gemini 3.1 Neural Speech Waveform API.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Responsible AI & Guardrails */}
          <div className="border-t border-[#1f2833] pt-5">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-emerald-500 flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-emerald-500" /> Ethics & Guardrails
            </h2>
            <div className="space-y-2.5 p-3 rounded-xl bg-[#12141c] border border-emerald-500/10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-white">Responsible AI Shield</span>
                <button
                  type="button"
                  onClick={() => setEthicsShield(!ethicsShield)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    ethicsShield ? "bg-emerald-500" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      ethicsShield ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal">
                Filters unsafe content, blocks misinformation vectors, and ensures all synthesis outputs comply with responsible, ethical AI use guidelines.
              </p>
              {ethicsShield && (
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Guardrails: Safe & Factually Grounded</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: DevoAPT Core Engine Details */}
          <div className="border-t border-[#1f2833] pt-5 mt-auto text-[11px] text-[#555a64] font-mono space-y-1">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-gray-400">Cloud Sandboxed</span>
            </div>
            <div className="flex justify-between">
              <span>Gemini API Node:</span>
              <span className="text-brand-cyan">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Cognitive Engines:</span>
              <span className="text-brand-purple">{MODEL_PERSONAS.length} Active Engines</span>
            </div>
            <div className="p-2 bg-[#12141c] border border-violet-500/10 rounded-lg text-center mt-2">
              <span className="text-violet-400 font-semibold uppercase tracking-wider text-[9px] block">Global Solvers Equipped</span>
              <span className="text-gray-400">Audio, Video, Vector Maps, Synthesizers</span>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA: Dynamic Multi-Tabs */}
        <main className="flex-1 flex flex-col bg-[#0f111a]">
          {/* Custom Tab Selection Header: Fully Responsive & Clickable */}
          <div className="border-b px-2 sm:px-4 flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 bg-[#0b0c10] border-[#1f2833] items-center justify-between py-1">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-display text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95 border select-none ${
                  activeTab === "chat"
                    ? "border-brand-purple/60 text-white bg-brand-purple/20 shadow-md shadow-brand-purple/20 font-bold"
                    : "border-transparent text-[#868d99] hover:text-white hover:bg-[#161925]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-purple" />
                <span>💬 Q&A Chat</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple font-mono hidden md:inline">Solver</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-display text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95 border select-none ${
                  activeTab === "image"
                    ? "border-[#1f85de]/60 text-white bg-[#1f85de]/20 shadow-md shadow-[#1f85de]/20 font-bold"
                    : "border-transparent text-[#868d99] hover:text-white hover:bg-[#161925]"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1f85de]" />
                <span>🎨 Image Studio</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-[#1f85de]/20 text-[#1f85de] rounded font-mono hidden md:inline">Imagen 4</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("music")}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-display text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95 border select-none ${
                  activeTab === "music"
                    ? "border-brand-teal/60 text-white bg-brand-teal/20 shadow-md shadow-brand-teal/20 font-bold"
                    : "border-transparent text-[#868d99] hover:text-white hover:bg-[#161925]"
                }`}
              >
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal" />
                <span>🎵 Music Synth</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-brand-teal/20 text-brand-teal rounded font-mono hidden md:inline">Lyria</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-display text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95 border select-none ${
                  activeTab === "video"
                    ? "border-[#ec4899]/60 text-white bg-[#ec4899]/20 shadow-md shadow-[#ec4899]/20 font-bold"
                    : "border-transparent text-[#868d99] hover:text-white hover:bg-[#161925]"
                }`}
              >
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ec4899]" />
                <span>🎬 Veo Video</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-[#ec4899]/20 text-[#ec4899] rounded font-mono hidden md:inline">v3.1</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("os")}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-display text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95 border select-none ${
                  activeTab === "os"
                    ? "border-cyan-400 text-white bg-cyan-950/60 shadow-md shadow-cyan-950/60 font-bold ring-1 ring-cyan-400/40"
                    : "border-transparent text-[#868d99] hover:text-white hover:bg-[#161925]"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>💻 Make Your Own OS</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-mono border border-cyan-500/30 hidden md:inline">ISO Builder</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("converter")}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-display text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95 border select-none ${
                  activeTab === "converter"
                    ? "border-purple-400 text-white bg-purple-950/60 shadow-md shadow-purple-950/60 font-bold ring-1 ring-purple-400/40"
                    : "border-transparent text-[#868d99] hover:text-white hover:bg-[#161925]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                <span>📱 Create Your Own</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded font-mono border border-purple-500/30 hidden md:inline">EXE • APK • IPA</span>
              </button>
            </div>

            {/* Prominent Live with AI Call-to-action button */}
            <button
              type="button"
              onClick={() => setIsLiveModalOpen(true)}
              className="my-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 via-pink-600 to-violet-600 text-white font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-md shadow-red-900/30 hover:brightness-110 active:scale-95 transition-all shrink-0 border border-white/20 cursor-pointer select-none"
              title="Open Live with AI Voice Call Room"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-200" />
              <span className="whitespace-nowrap">⚡ Live Voice Room</span>
            </button>
          </div>

          {/* TAB CONTENT: 1. Text & Q&A Chat */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
              {/* Active Assistant Top Profile Banner */}
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b flex flex-wrap justify-between items-center text-xs bg-[#12141c] border-[#1f2833] gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="p-1 rounded-lg bg-black/40 border border-white/10">
                    <AIModelLogo modelId={selectedModel.id} size={20} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-400">Cognitive Engine: </span>
                    <span className="text-white font-bold">{selectedModel.name}</span>
                    <span className="text-brand-purple font-mono">({selectedVersion})</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f2833] text-gray-400 font-mono hidden sm:inline">
                      Voice: {selectedVoice.name.split(" ")[0]} ({voicePlaybackSpeed}x)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLiveModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Radio className="w-3 h-3 text-red-400" />
                    <span>Talk Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearChat}
                    className="text-[#868d99] hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer active:scale-95"
                    title="Clear current convo history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear Chat</span>
                  </button>
                </div>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4.5 border transition-all ${
                        isUser
                          ? "bg-gradient-to-br from-[#1d2030] to-[#12141c] border-[#2c334b] text-white shadow-sm"
                          : "bg-[#12141c] border-[#1f2833] text-[#c5c6c7] shadow-md"
                      }`}>
                        {/* Speaker branding & audio tools */}
                        <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-[#1f2833]/50 text-[10px] font-mono text-gray-400">
                          <div className="flex items-center gap-1.5">
                            {!isUser ? (
                              <>
                                <AIModelLogo modelId={selectedModel.id} size={15} />
                                <span className="text-white font-semibold">{selectedModel.name}</span>
                              </>
                            ) : (
                              <span className="text-brand-cyan font-semibold">You (Client Solver)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span>{msg.timestamp}</span>
                            {!isUser && (
                              <button
                                onClick={() => speakText(msg.id, msg.text)}
                                disabled={msg.isAudioLoading}
                                className={`p-1 rounded hover:bg-[#1f2833] transition-all flex items-center gap-1 ${
                                  currentlyPlayingAudio === msg.id
                                    ? "text-brand-purple bg-brand-purple/20 animate-pulse"
                                    : "text-brand-cyan hover:text-white"
                                }`}
                                title="Listen to this text via neural synthesis speaker"
                              >
                                {msg.isAudioLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : currentlyPlayingAudio === msg.id ? (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 text-brand-purple" />
                                    <span className="text-brand-purple">Playing</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3" />
                                    <span>Speak ({selectedVoice.name.split(" ")[0]})</span>
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => copyToClipboard(msg.id, msg.text)}
                              className="p-1 rounded hover:bg-[#1f2833] hover:text-white text-gray-500 transition-all"
                              title="Copy raw text to clipboard"
                            >
                              {copiedTextId === msg.id ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Speech active equalizer visual waves */}
                        {currentlyPlayingAudio === msg.id && (
                          <div className="flex items-center gap-1.5 bg-[#0b0c10] border border-brand-purple/30 px-3 py-1.5 rounded-lg mb-3">
                            <span className="text-[10px] text-brand-purple font-mono">Neural Voice Stream ({selectedVoice.name.split(" ")[0]}):</span>
                            <div className="flex items-end gap-0.5 h-3">
                              <span className="w-0.5 bg-violet-400 voice-wave-bar" style={{ animationDelay: "0.1s" }} />
                              <span className="w-0.5 bg-indigo-300 voice-wave-bar" style={{ animationDelay: "0.4s" }} />
                              <span className="w-0.5 bg-cyan-400 voice-wave-bar" style={{ animationDelay: "0.2s" }} />
                              <span className="w-0.5 bg-violet-500 voice-wave-bar" style={{ animationDelay: "0.6s" }} />
                              <span className="w-0.5 bg-indigo-300 voice-wave-bar" style={{ animationDelay: "0.3s" }} />
                            </div>
                          </div>
                        )}

                        {/* Raw Message body */}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans prose prose-invert max-w-none">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading state indicator */}
                {isChatLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-[#12141c] border border-[#1f2833] rounded-2xl p-4.5 max-w-[80%]">
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-2">
                        <AIModelLogo modelId={selectedModel.id} size={16} />
                        <span>DevoAPT ({selectedModel.name}) is synthesizing...</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 text-brand-purple animate-spin" />
                        <span className="text-xs text-[#868d99] font-mono">Generating answer in {selectedLanguage.name}...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat bottom action input form with Microphone Dictation */}
              <form onSubmit={handleChatSubmit} className="p-4 border-t flex gap-3 items-center bg-[#0c0e14] border-[#1f2833]">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isListening && activeMicTarget === "chat"
                        ? "🎙️ Listening... Speak into your microphone now..."
                        : `Ask ${selectedModel.name} anything in ${selectedLanguage.name}... (e.g., Code a game, explain physics)`
                    }
                    disabled={isChatLoading}
                    className={`w-full border rounded-xl pl-4 pr-11 py-3 text-sm outline-none transition-all ${
                      isListening && activeMicTarget === "chat"
                        ? "border-red-500 bg-red-950/30 text-white placeholder-red-300 ring-2 ring-red-500/50 animate-pulse"
                        : "bg-[#12141c] border-[#1f2833] focus:border-[#1f85de] text-white placeholder-gray-500 focus:ring-1 focus:ring-[#1f85de]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleSpeechRecognition("chat")}
                    className={`absolute right-2 p-2 rounded-lg transition-all ${
                      isListening && activeMicTarget === "chat"
                        ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-bounce"
                        : "bg-[#1f2833] text-gray-400 hover:bg-[#2c3748] hover:text-white"
                    }`}
                    title={isListening && activeMicTarget === "chat" ? "Stop microphone recording" : "Voice dictating via Microphone"}
                  >
                    {isListening && activeMicTarget === "chat" ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="font-display font-semibold text-sm px-5 py-3 rounded-xl text-white transition-all shadow-md flex items-center gap-2 hover:translate-y-[-1px] active:translate-y-[1px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 shadow-violet-500/15"
                >
                  <span>Solve</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB CONTENT: 2. Image Studio */}
          {activeTab === "image" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-[#12141c] border border-[#1f2833] rounded-2xl p-5 shadow-sm">
                <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <span className="p-1 rounded bg-[#1f85de]/10 text-[#1f85de]">🎨</span> Image Generation Suite
                </h3>
                <p className="text-xs text-[#868d99] leading-relaxed mb-4">
                  Generate professional digital assets, realistic stock photos, vector icons, or imaginative concept art using Google's newest Imagen 4.0 generation engine.
                </p>

                <form onSubmit={handleGenerateImage} className="space-y-4">
                  {/* Aspect Ratio and Model Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Synthesis Model</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setImageModel("imagen")}
                          className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-mono font-medium transition-colors ${
                            imageModel === "imagen"
                              ? "bg-[#1f85de]/10 border-[#1f85de] text-[#1f85de]"
                              : "bg-[#0b0c10] border-[#1f2833] text-gray-400 hover:bg-[#12141c]"
                          }`}
                        >
                          Imagen 4.0 (Recommended)
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageModel("gemini")}
                          className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-mono font-medium transition-colors ${
                            imageModel === "gemini"
                              ? "bg-brand-purple/10 border-brand-purple text-brand-purple"
                              : "bg-[#0b0c10] border-[#1f2833] text-gray-400 hover:bg-[#12141c]"
                          }`}
                        >
                          Gemini 2.5 Image
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Canvas Aspect Ratio</label>
                      <div className="grid grid-cols-4 gap-1">
                        {["1:1", "3:4", "4:3", "16:9"].map((ratio) => (
                          <button
                            type="button"
                            key={ratio}
                            onClick={() => setImageAspectRatio(ratio)}
                            className={`py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                              imageAspectRatio === ratio
                                ? "bg-[#1f85de]/25 border-[#1f85de] text-white font-bold"
                                : "bg-[#0b0c10] border-[#1f2833] text-gray-400 hover:bg-[#12141c]"
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Creative Helpers</label>
                      <div className="flex gap-1.5">
                        {["Cyberpunk", "Minimalist Vector", "Isometric 3D", "Cinematic Oil"].map((style) => (
                          <button
                            type="button"
                            key={style}
                            onClick={() => setImagePrompt(prev => prev ? `${prev}, in ${style} style` : `${style} of `)}
                            className="bg-[#1c2030] border border-[#2a3048] hover:bg-[#252c42] text-[10px] text-gray-300 px-2.5 py-1.5 rounded-lg font-mono transition-colors"
                          >
                            +{style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Input and Submit */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="text"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder={
                          isListening && activeMicTarget === "image"
                            ? "🎙️ Listening... Speak image prompt into microphone..."
                            : "e.g., A futuristic cybernetic tiger in rain-slicked Tokyo street, neon glow reflection, 8k..."
                        }
                        className={`w-full border rounded-xl pl-4 pr-11 py-3 text-sm text-white outline-none transition-all ${
                          isListening && activeMicTarget === "image"
                            ? "border-red-500 bg-red-950/30 ring-2 ring-red-500/50 animate-pulse"
                            : "bg-[#0b0c10] border-[#1f2833] focus:border-[#1f85de] placeholder-gray-500"
                        }`}
                        disabled={isImageGenerating}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSpeechRecognition("image")}
                        className={`absolute right-2 p-2 rounded-lg transition-all ${
                          isListening && activeMicTarget === "image"
                            ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-bounce"
                            : "bg-[#1f2833] text-gray-400 hover:bg-[#2c3748] hover:text-white"
                        }`}
                        title={isListening && activeMicTarget === "image" ? "Stop microphone recording" : "Voice dictating via Microphone"}
                      >
                        {isListening && activeMicTarget === "image" ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isImageGenerating || !imagePrompt.trim()}
                      className="font-display font-semibold text-sm px-6 py-3 rounded-xl text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600"
                    >
                      {isImageGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Synthesizing Pixel Array...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Gallery of Assets */}
              <div>
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#1f85de] mb-3">
                  🎨 Asset Repository ({generatedImages.length} Generated)
                </h4>

                {generatedImages.length === 0 ? (
                  <div className="border border-[#1f2833] border-dashed rounded-2xl p-10 text-center text-gray-500 space-y-2 bg-[#12141c]/20">
                    <ImageIcon className="w-10 h-10 mx-auto text-gray-600 stroke-[1.5]" />
                    <p className="text-sm font-semibold">No images generated in this session yet.</p>
                    <p className="text-xs">Type a prompt above and press Generate to invoke Imagen 4.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedImages.map((img) => (
                      <div
                        key={img.id}
                        className="bg-[#12141c] border border-[#1f2833] rounded-2xl overflow-hidden group shadow-lg flex flex-col justify-between"
                      >
                        <div className="relative overflow-hidden aspect-video bg-black flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.prompt}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => setSelectedPreviewImage(img)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold"
                          >
                            <Maximize2 className="w-4 h-4" />
                            <span>Preview Full-Res</span>
                          </button>
                        </div>
                        <div className="p-4 space-y-2">
                          <p className="text-xs text-white line-clamp-2 font-medium">"{img.prompt}"</p>
                          <div className="flex flex-wrap justify-between items-center text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1f2833]">
                            <span>Model: {img.modelUsed}</span>
                            <span>Ratio: {img.aspectRatio}</span>
                            <a
                              href={img.url}
                              download={`devoapt-image-${img.id}.jpg`}
                              className="text-brand-cyan hover:text-white flex items-center gap-0.5"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Zoom Preview Modal */}
              {selectedPreviewImage && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="relative max-w-4xl w-full bg-[#12141c] border border-[#2a3048] rounded-2xl overflow-hidden shadow-2xl">
                    <button
                      onClick={() => setSelectedPreviewImage(null)}
                      className="absolute right-4 top-4 bg-black/50 hover:bg-black text-white p-2 rounded-full font-mono text-sm"
                    >
                      ✕ Close
                    </button>
                    <div className="p-4 border-b border-[#2a3048] bg-[#0c0e14]">
                      <h4 className="text-sm font-semibold text-white">Full Resolution Render</h4>
                      <p className="text-xs text-gray-400 line-clamp-1">{selectedPreviewImage.prompt}</p>
                    </div>
                    <div className="p-6 flex justify-center bg-[#07080a] max-h-[70vh] overflow-y-auto">
                      <img
                        src={selectedPreviewImage.url}
                        alt="Zoomed Asset"
                        className="max-h-[60vh] object-contain rounded-lg border border-[#2a3048]"
                      />
                    </div>
                    <div className="p-4 border-t border-[#2a3048] bg-[#0c0e14] flex justify-between items-center text-xs">
                      <span className="font-mono text-gray-500">Rendered on {selectedPreviewImage.timestamp}</span>
                      <a
                        href={selectedPreviewImage.url}
                        download="devoapt-asset.png"
                        className="px-4 py-2 bg-[#1f85de] hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        <span>Save Image File</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: 3. Music Synthesizer */}
          {activeTab === "music" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-[#12141c] border border-[#1f2833] rounded-2xl p-5 shadow-sm">
                <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <span className="p-1 rounded bg-brand-teal/10 text-brand-teal">🎵</span> Music & Lyric Synthesizer
                </h3>
                <p className="text-xs text-[#868d99] leading-relaxed mb-4">
                  Powered by DeepMind Lyria streaming engines. Describe the genre, rhythm, instrumentation, and lyric concept. If the cloud sandbox doesn't support live Lyria API integration, DevoAPT automatically triggers our customized, interactive mathematical frequency audio simulator!
                </p>

                <form onSubmit={handleGenerateMusic} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Rhythm Duration</label>
                      <select
                        value={musicDuration}
                        onChange={(e) => setMusicDuration(Number(e.target.value))}
                        className="w-full bg-[#0b0c10] border border-[#1f2833] rounded-lg px-2.5 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-brand-teal outline-none"
                      >
                        <option value={15}>15 Seconds (Quick Clip)</option>
                        <option value={30}>30 Seconds (Standard Loop)</option>
                        <option value={60}>60 Seconds (Extended Melodic Sweep)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Sample Presets</label>
                      <div className="flex flex-wrap gap-1">
                        {["Retro Synthwave", "Chilled Lo-Fi", "Epic Orchestral", "Ambient Drone"].map((genre) => (
                          <button
                            type="button"
                            key={genre}
                            onClick={() => setMusicPrompt(genre)}
                            className="bg-[#1c2030] border border-[#2a3048] hover:bg-brand-teal/10 hover:border-brand-teal/30 text-[10px] text-gray-300 px-2.5 py-1.5 rounded-lg font-mono transition-all"
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="text"
                        value={musicPrompt}
                        onChange={(e) => setMusicPrompt(e.target.value)}
                        placeholder={
                          isListening && activeMicTarget === "music"
                            ? "🎙️ Listening... Speak music concept into microphone..."
                            : "e.g., Chill lofi beats with retro cosmic ambient pads and rain sounds..."
                        }
                        className={`w-full border rounded-xl pl-4 pr-11 py-3 text-sm text-white outline-none transition-all ${
                          isListening && activeMicTarget === "music"
                            ? "border-red-500 bg-red-950/30 ring-2 ring-red-500/50 animate-pulse"
                            : "bg-[#0b0c10] border-[#1f2833] focus:border-brand-teal placeholder-gray-500"
                        }`}
                        disabled={isMusicGenerating}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSpeechRecognition("music")}
                        className={`absolute right-2 p-2 rounded-lg transition-all ${
                          isListening && activeMicTarget === "music"
                            ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-bounce"
                            : "bg-[#1f2833] text-gray-400 hover:bg-[#2c3748] hover:text-white"
                        }`}
                        title={isListening && activeMicTarget === "music" ? "Stop microphone recording" : "Voice dictating via Microphone"}
                      >
                        {isListening && activeMicTarget === "music" ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isMusicGenerating || !musicPrompt.trim()}
                      className="font-display font-semibold text-sm px-6 py-3 rounded-xl text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600"
                    >
                      {isMusicGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Compiling Audio Waves...</span>
                        </>
                      ) : (
                        <>
                          <Music className="w-4 h-4" />
                          <span>Generate Music</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Music generated history */}
              <div>
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider text-brand-teal mb-3">
                  🎵 Synthesized Audio Tracks ({generatedMusic.length} Tracks)
                </h4>

                {generatedMusic.length === 0 ? (
                  <div className="border border-[#1f2833] border-dashed rounded-2xl p-10 text-center text-gray-500 space-y-2 bg-[#12141c]/20">
                    <Music className="w-10 h-10 mx-auto text-gray-600 stroke-[1.5]" />
                    <p className="text-sm font-semibold">No audio tracks synthesized yet.</p>
                    <p className="text-xs">Submit a genre prompt to invoke our direct multi-waveform synthesizer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedMusic.map((item) => {
                      const isPlaying = currentlyPlayingMusic === item.id;
                      return (
                        <div
                          key={item.id}
                          className="bg-[#12141c] border border-[#1f2833] rounded-2xl p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">"{item.prompt}"</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal border border-brand-teal/20 font-mono">
                                {item.duration}s Loop
                              </span>
                              {item.url === "SIMULATED" && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                                  Frequency Synth Sim
                                </span>
                              )}
                            </div>

                            {/* Lyrics transcript section */}
                            {item.lyrics && (
                              <div className="p-3 bg-[#0b0c10] border border-[#1f2833] rounded-lg text-xs font-mono text-gray-400 max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                                {item.lyrics}
                              </div>
                            )}

                            {/* Animated waveform placeholder when playing */}
                            {isPlaying && (
                              <div className="flex items-end gap-1 h-8 px-4 bg-[#0b0c10] rounded-xl border border-brand-teal/10 w-48 justify-center">
                                {[1,2,3,4,5,6,7,8,9,10].map((bar) => (
                                  <span
                                    key={bar}
                                    className="w-1.5 bg-brand-teal rounded-t voice-wave-bar"
                                    style={{
                                      height: `${Math.random() * 80 + 20}%`,
                                      animationDelay: `${bar * 0.1}s`,
                                      animationDuration: `${0.8 + Math.random() * 0.8}s`
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => togglePlayMusic(item)}
                              className={`p-3.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center ${
                                isPlaying
                                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                  : "bg-brand-teal hover:bg-teal-400 text-black font-bold"
                              }`}
                            >
                              {isPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5 fill-black" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. Veo Video Studio */}
          {activeTab === "video" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-[#12141c] border border-[#1f2833] rounded-2xl p-5 shadow-sm">
                <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <span className="p-1 rounded bg-[#ec4899]/10 text-[#ec4899]">🎬</span> Veo Cinematic Video Generator
                </h3>
                <p className="text-xs text-[#868d99] leading-relaxed mb-4">
                  Google Veo-3.1-Lite offers exceptional cinematic pacing, lighting, and physics simulation. Enter a description. Your generation is added to our server task queue. When ready, play or save the video directly.
                </p>

                <form onSubmit={handleGenerateVideo} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Pacing Aspect Ratio</label>
                      <select
                        value={videoAspectRatio}
                        onChange={(e) => setVideoAspectRatio(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-[#1f2833] rounded-lg px-2.5 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-[#ec4899] outline-none"
                      >
                        <option value="16:9">16:9 (Widescreen Cinematic)</option>
                        <option value="9:16">9:16 (Vertical TikTok/Shorts)</option>
                        <option value="1:1">1:1 (Square Social)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-mono block mb-1">Style Modifier</label>
                      <div className="flex flex-wrap gap-1">
                        {["Sci-Fi Cinematic", "Photorealistic", "Anime Hand-drawn", "Macro Close-up"].map((style) => (
                          <button
                            type="button"
                            key={style}
                            onClick={() => setVideoPrompt(prev => prev ? `${prev}, ${style}` : `${style} shot of `)}
                            className="bg-[#1c2030] border border-[#2a3048] hover:bg-[#ec4899]/10 hover:border-[#ec4899]/30 text-[10px] text-gray-300 px-2.5 py-1.5 rounded-lg font-mono transition-all"
                          >
                            +{style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="text"
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder={
                          isListening && activeMicTarget === "video"
                            ? "🎙️ Listening... Speak video concept into microphone..."
                            : "e.g., Majestic shot of an astronaut riding a horse on the moon, high fidelity, 4k video..."
                        }
                        className={`w-full border rounded-xl pl-4 pr-11 py-3 text-sm text-white outline-none transition-all ${
                          isListening && activeMicTarget === "video"
                            ? "border-red-500 bg-red-950/30 ring-2 ring-red-500/50 animate-pulse"
                            : "bg-[#0b0c10] border-[#1f2833] focus:border-[#ec4899] placeholder-gray-500"
                        }`}
                        disabled={isVideoCreating}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSpeechRecognition("video")}
                        className={`absolute right-2 p-2 rounded-lg transition-all ${
                          isListening && activeMicTarget === "video"
                            ? "bg-red-500 text-white shadow-md shadow-red-500/30 animate-bounce"
                            : "bg-[#1f2833] text-gray-400 hover:bg-[#2c3748] hover:text-white"
                        }`}
                        title={isListening && activeMicTarget === "video" ? "Stop microphone recording" : "Voice dictating via Microphone"}
                      >
                        {isListening && activeMicTarget === "video" ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isVideoCreating || !videoPrompt.trim()}
                      className="font-display font-semibold text-sm px-6 py-3 rounded-xl text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600"
                    >
                      {isVideoCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Pushing to Veo Queue...</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4" />
                          <span>Create Video</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Video task pipeline queue list */}
              <div>
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#ec4899] mb-3">
                  🎬 Cinematic Output pipeline ({generatedVideos.length} Operations)
                </h4>

                {generatedVideos.length === 0 ? (
                  <div className="border border-[#1f2833] border-dashed rounded-2xl p-10 text-center text-gray-500 space-y-2 bg-[#12141c]/20">
                    <Video className="w-10 h-10 mx-auto text-gray-600 stroke-[1.5]" />
                    <p className="text-sm font-semibold">No video streams in queue.</p>
                    <p className="text-xs">Describe an epic sequence above to begin rendering video frames on the Veo-3.1 engine cluster.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedVideos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-[#12141c] border border-[#1f2833] rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-gray-500">Task: {video.id}</span>
                            
                            {/* Status badge */}
                            {video.status === "queued" && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] font-mono animate-pulse">
                                QUEUED IN VECTOR CLUSTER
                              </span>
                            )}
                            {video.status === "generating" && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-mono animate-spin">
                                RENDERING IN VEO V3.1
                              </span>
                            )}
                            {video.status === "completed" && (
                              <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] font-mono">
                                COMPLETED
                              </span>
                            )}
                            {video.status === "failed" && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-mono">
                                FAILED
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white font-medium line-clamp-2">"{video.prompt}"</p>
                        </div>

                        {/* Rendering preview block */}
                        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-[#1f2833] flex items-center justify-center relative">
                          {video.status === "completed" && video.url ? (
                            <video
                              src={video.url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : video.status === "failed" ? (
                            <div className="text-center p-4 space-y-1 text-xs text-red-400">
                              <span>⚠️ Generation Error</span>
                              <p className="text-[10px] text-gray-500 leading-normal">
                                {video.error || "Model returned a safety filter violation. Please try with more benign phrasing."}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center p-4 space-y-2 text-xs text-[#868d99]">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#ec4899]" />
                              <p className="font-mono">Processing Neural Flow Dynamics...</p>
                              <p className="text-[10px] text-gray-600">This may take up to 30-45 seconds</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1f2833]">
                          <span>Time: {video.timestamp}</span>
                          {video.status === "completed" && video.url && (
                            <a
                              href={video.url}
                              download={`devoapt-cinematic-${video.id}.mp4`}
                              className="text-brand-cyan hover:text-white flex items-center gap-1 font-semibold"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Save MP4</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: 5. Make Your Own OS Synthesizer Studio */}
          {activeTab === "os" && (
            <OSBuilderStudio
              models={MODEL_PERSONAS}
              onOpenLiveModal={() => setIsLiveModalOpen(true)}
            />
          )}

          {/* TAB CONTENT: 6. Create Your Own App Synthesizer Studio */}
          {activeTab === "converter" && (
            <AppConverterStudio
              onOpenLiveModal={() => setIsLiveModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Persistent global mini warning bar for API key configuration */}
      <footer className="bg-[#0c0e14] border-t border-[#1f2833] px-6 py-3 flex flex-wrap justify-between items-center text-[11px] text-gray-500 font-mono gap-3">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Info className="w-3.5 h-3.5 text-brand-purple" />
          <span>DevoAPT AI integrates real-time Live Voice, high-fidelity neural synthesis, and multimodal AI engines.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveModalOpen(true)}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Open Live Voice Mode</span>
          </button>
          <span className="text-gray-600">|</span>
          <span className="text-green-400">SSL Secures</span>
        </div>
      </footer>

      {/* Real-time Interactive "Live with AI" Modal Experience */}
      <LiveWithAIModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        models={MODEL_PERSONAS}
        voices={VOICES}
        languages={LANGUAGES}
        initialModel={selectedModel}
        initialVoice={selectedVoice}
        initialLanguage={selectedLanguage}
      />
    </div>
  );
}
