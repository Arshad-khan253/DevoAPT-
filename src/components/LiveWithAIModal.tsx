import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  RefreshCw,
  Send,
  Radio,
  Sliders,
  Check,
  Globe,
  Headphones,
  Copy,
  CheckCheck,
  ChevronDown
} from "lucide-react";
import { AIModelPersona, LanguageOption, VoiceOption, LiveTranscriptTurn } from "../types";
import { AIModelLogo } from "./AIModelLogos";

interface LiveWithAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: AIModelPersona[];
  voices: VoiceOption[];
  languages: LanguageOption[];
  initialModel?: AIModelPersona;
  initialVoice?: VoiceOption;
  initialLanguage?: LanguageOption;
  onSendChatMessage?: (text: string) => void;
}

export const LiveWithAIModal: React.FC<LiveWithAIModalProps> = ({
  isOpen,
  onClose,
  models,
  voices,
  languages,
  initialModel,
  initialVoice,
  initialLanguage,
}) => {
  // Session Configuration State
  const [selectedModel, setSelectedModel] = useState<AIModelPersona>(initialModel || models[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(initialVoice || voices[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(initialLanguage || languages[0]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isHandsFree, setIsHandsFree] = useState<boolean>(true);

  // Live Call State
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<LiveTranscriptTurn[]>([]);
  const [liveInterimText, setLiveInterimText] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);

  // Audio & Speech References
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioVolumeLevel, setAudioVolumeLevel] = useState<number>(0);

  // Sync initial props
  useEffect(() => {
    if (initialModel) setSelectedModel(initialModel);
    if (initialVoice) setSelectedVoice(initialVoice);
    if (initialLanguage) setSelectedLanguage(initialLanguage);
  }, [initialModel, initialVoice, initialLanguage]);

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, liveInterimText, isThinking]);

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      endLiveSession();
    }
    return () => {
      endLiveSession();
    };
  }, [isOpen]);

  // Test / Preview voice audio sample
  const handleTestVoice = async (voice: VoiceOption) => {
    setPreviewVoiceId(voice.id);
    stopAllAudio();

    const samplePhrases: Record<string, string> = {
      en: `Hello! I am ${voice.name}, ready to talk with you in live mode.`,
      es: `¡Hola! Soy ${voice.name}, lista para conversar contigo en vivo.`,
      fr: `Bonjour! Je suis ${voice.name}, prêt à discuter avec vous en direct.`,
      de: `Hallo! Ich bin ${voice.name}, bereit für unser Live-Gespräch.`,
      ur: `ہیلو! میں ${voice.name} ہوں، آپ کے ساتھ لائیو بات چیت کے لیے تیار ہوں۔`,
      hi: `नमस्ते! मैं ${voice.name} हूँ, आपके साथ लाइव बातचीत के लिए तैयार हूँ।`,
      ar: `مرحباً! أنا ${voice.name}، جاهز للتحدث معك في البث المباشر.`,
      ja: `こんにちは！${voice.name}です。ライブ会話の準備が整いました。`,
      zh: `你好！我是${voice.name}，已准备好与您进行实时对话。`,
      ru: `Здравствуйте! Я ${voice.name}, готов к живому общению.`,
    };

    const textToSpeak = samplePhrases[selectedLanguage.code] || samplePhrases.en;

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          voice: voice.id,
          language: selectedLanguage.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          playAudioBase64(data.audio, () => setPreviewVoiceId(null));
          return;
        }
      }
    } catch (e) {
      console.warn("Server TTS preview error, falling back to Web Speech:", e);
    }

    // Fallback to Web Speech API
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = speechRate;
      utterance.lang = selectedLanguage.code === "ur" ? "ur-PK" : selectedLanguage.code;
      utterance.onend = () => setPreviewVoiceId(null);
      utterance.onerror = () => setPreviewVoiceId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPreviewVoiceId(null);
    }
  };

  // Stop all playing audio
  const stopAllAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // ignore
      }
      audioSourceRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  };

  // Play audio payload (base64)
  const playAudioBase64 = (base64Audio: string, onEnded?: () => void) => {
    stopAllAudio();
    setIsAiSpeaking(true);

    try {
      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audio.playbackRate = speechRate;
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsAiSpeaking(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        if (onEnded) onEnded();
        // If hands-free is enabled, resume listening
        if (isHandsFree && !isMicMuted && isLiveActive) {
          startSpeechRecognition();
        }
      };

      audio.onerror = () => {
        setIsAiSpeaking(false);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        if (onEnded) onEnded();
      };

      audio.play().catch((err) => {
        console.warn("Audio play error, using Web Speech fallback:", err);
        setIsAiSpeaking(false);
      });
    } catch (e) {
      console.error("Failed to decode audio base64:", e);
      setIsAiSpeaking(false);
      if (onEnded) onEnded();
    }
  };

  // Speak AI text response using Gemini TTS or WebSpeech fallback
  const speakAiResponse = async (text: string, onEnded?: () => void) => {
    stopAllAudio();
    setIsAiSpeaking(true);

    try {
      const res = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          voice: selectedVoice.id,
          language: selectedLanguage.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          playAudioBase64(data.audio, onEnded);
          return;
        }
      }
    } catch (err) {
      console.warn("Live TTS API failed, falling back to Web Speech:", err);
    }

    // High quality Web Speech fallback
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = selectedVoice.gender === "Female" ? 1.15 : 0.95;

      // Match best available browser voice
      const synthVoices = window.speechSynthesis.getVoices();
      const matched = synthVoices.find(
        (v) =>
          v.lang.startsWith(selectedLanguage.code) ||
          (selectedLanguage.code === "en" && v.name.toLowerCase().includes("natural"))
      );
      if (matched) utterance.voice = matched;

      utterance.onend = () => {
        setIsAiSpeaking(false);
        if (onEnded) onEnded();
        if (isHandsFree && !isMicMuted && isLiveActive) {
          startSpeechRecognition();
        }
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
        if (onEnded) onEnded();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsAiSpeaking(false);
      if (onEnded) onEnded();
    }
  };

  // Start Live Audio Stream & Frequency Analyser
  const setupAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioVolumeLevel(normalized);

        setIsUserSpeaking(normalized > 18 && !isMicMuted && !isAiSpeaking);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn("Could not setup audio analyser node (microphone permission or context):", e);
    }
  };

  // Initialize Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web SpeechRecognition is not supported on this browser.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // Set recognition language
    const langMap: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      ur: "ur-PK",
      hi: "hi-IN",
      ar: "ar-SA",
      ja: "ja-JP",
      zh: "zh-CN",
      ru: "ru-RU",
    };
    recognition.lang = langMap[selectedLanguage.code] || "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalSpeech = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalSpeech += transcriptText;
        } else {
          interim += transcriptText;
        }
      }

      setLiveInterimText(interim);

      if (finalSpeech.trim()) {
        setLiveInterimText("");
        handleUserSpokenMessage(finalSpeech.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Live Speech recognition notice:", event.error);
    };

    recognition.onend = () => {
      // Auto restart if still in live session and not muted and not currently speaking AI voice
      if (isLiveActive && !isMicMuted && !isAiSpeaking && isHandsFree) {
        try {
          recognition.start();
        } catch (e) {
          // ignore
        }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Could not start recognition:", err);
    }
  };

  // Handle user spoken query -> Send to AI Model
  const handleUserSpokenMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Pause recognition while processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    const userTurn: LiveTranscriptTurn = {
      id: "user-" + Date.now(),
      speaker: "user",
      modelName: "You",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setTranscript((prev) => [...prev, userTurn]);
    setIsThinking(true);

    try {
      // Build conversation history payload
      const chatHistory = transcript.map((t) => ({
        role: t.speaker === "user" ? "user" : "model",
        text: t.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          model: selectedModel.id,
          version: selectedModel.versions[0],
          language: selectedLanguage.name,
          chatHistory: chatHistory,
          ethicsShield: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI Model returned error code: ${res.status}`);
      }

      const data = await res.json();
      const aiResponseText = data.text || `I heard you clearly: "${messageText}". How can I assist further?`;

      setIsThinking(false);

      const aiTurn: LiveTranscriptTurn = {
        id: "ai-" + Date.now(),
        speaker: "ai",
        modelName: selectedModel.name,
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };

      setTranscript((prev) => [...prev, aiTurn]);

      // Speak back the response
      speakAiResponse(aiResponseText);
    } catch (err: any) {
      console.error("Live dialogue generation error:", err);
      setIsThinking(false);
      const errorTurn: LiveTranscriptTurn = {
        id: "err-" + Date.now(),
        speaker: "ai",
        modelName: selectedModel.name,
        text: `I encountered a slight transmission glitch: ${err?.message || "Please try speaking again."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTranscript((prev) => [...prev, errorTurn]);
      speakAiResponse(errorTurn.text);
    }
  };

  // Start Live Session Action
  const handleStartLive = async () => {
    setConnectionStatus("connecting");
    setIsLiveActive(true);

    // Initial greeting based on selected persona and language
    const greetings: Record<string, string> = {
      devoapt: `DevoAPT Live Core connected. I am ready. Speak freely.`,
      gemini: `Gemini live link established. What would you like to explore today?`,
      chatgpt: `Hello! ChatGPT Live is active. How can I help you?`,
      claude: `Greetings. Claude is live and ready for your inquiries.`,
      deepseek: `DeepSeek live active. State your complex problem or questions.`,
      copilot: `Copilot Live ready. What are we building or discussing?`,
      metaai: `Hey there! Meta AI is live. What's on your mind?`,
      grok: `Grok is live. Let's make this interesting. What's up?`,
      siri: `Hey! Siri Live is here. What can I do for you?`,
      bixby: `Bixby Live initialized. Ready for your voice directives.`,
    };

    const initialGreeting = greetings[selectedModel.id] || `Live session connected with ${selectedModel.name}. Ask me anything!`;

    const introTurn: LiveTranscriptTurn = {
      id: "ai-intro-" + Date.now(),
      speaker: "ai",
      modelName: selectedModel.name,
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTranscript([introTurn]);
    setConnectionStatus("connected");

    await setupAudioAnalyser();
    startSpeechRecognition();

    // Greet user with chosen voice
    speakAiResponse(initialGreeting);
  };

  // End Live Session Action
  const endLiveSession = () => {
    stopAllAudio();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsLiveActive(false);
    setConnectionStatus("disconnected");
    setIsUserSpeaking(false);
    setIsAiSpeaking(false);
    setIsThinking(false);
    setLiveInterimText("");
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      startSpeechRecognition();
    } else {
      setIsMicMuted(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    }
  };

  // Copy turn text
  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#0c0e15] border border-[#232a3b] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#1f2838] bg-[#0f121d]/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AIModelLogo modelId={selectedModel.id} size={36} className="rounded-xl shadow-lg" />
              {isLiveActive && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
                  <span>Live with AI</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-pink-600 text-white font-mono uppercase tracking-wider font-bold">
                    {isLiveActive ? "LIVE ON AIR" : "REAL-TIME VOICE"}
                  </span>
                </h2>
              </div>
              <p className="text-xs text-gray-400 font-mono flex items-center gap-2">
                <span>Active Persona: <strong className="text-white">{selectedModel.name}</strong></span>
                <span>•</span>
                <span>Voice: <strong className="text-cyan-300">{selectedVoice.name}</strong></span>
                <span>•</span>
                <span>Language: <strong className="text-violet-300">{selectedLanguage.name}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLiveActive && (
              <button
                onClick={endLiveSession}
                className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" />
                <span>End Live</span>
              </button>
            )}
            <button
              onClick={() => {
                endLiveSession();
                onClose();
              }}
              className="p-2 rounded-xl bg-[#171b26] hover:bg-[#23293a] text-gray-400 hover:text-white transition-all"
              title="Close Live modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content View: Step 1 Configuration (if not connected) VS Step 2 Live Dialogue Room (if connected) */}
        {!isLiveActive ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-gradient-to-b from-[#0c0e15] to-[#08090e]">
            {/* Step 1: Model Selection with Visual Logos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase font-mono tracking-wider text-gray-400 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  <span>1. Select an AI Model to Talk With</span>
                </label>
                <span className="text-[11px] font-mono text-cyan-400">10 AI Intelligence Engines with Custom Logos</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {models.map((model) => {
                  const isSelected = selectedModel.id === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setSelectedModel(model)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col items-center justify-between gap-2.5 group hover:scale-[1.02] ${
                        isSelected
                          ? "bg-gradient-to-b from-[#1c2236] to-[#121624] border-violet-500 ring-2 ring-violet-500/40 shadow-lg shadow-violet-950/40"
                          : "bg-[#12141c] border-[#1e2332] hover:border-gray-600 hover:bg-[#161924]"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                      )}
                      <div className="p-2 rounded-xl bg-[#090b10] border border-white/5 shadow-inner">
                        <AIModelLogo modelId={model.id} size={40} />
                      </div>
                      <div className="text-center w-full">
                        <h4 className="font-display font-bold text-sm text-white truncate">{model.name}</h4>
                        <span className="text-[10px] font-mono text-gray-400 block">{model.company}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 font-mono w-full text-center truncate border border-white/5">
                        {model.versions[0].replace(" (Outdated)", "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Voice & Language Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Voice Selection */}
              <div className="p-4 rounded-2xl bg-[#111420] border border-[#1e2436] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-mono tracking-wider text-cyan-300 font-semibold flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-cyan-400" />
                    <span>2. Neural Voice Profile</span>
                  </label>
                  <span className="text-[10px] font-mono text-gray-400">Natural Gemini & HD Synthesis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {voices.map((voice) => {
                    const isSelected = selectedVoice.id === voice.id;
                    const isPreviewing = previewVoiceId === voice.id;
                    return (
                      <div
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-cyan-950/40 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/50"
                            : "bg-[#0b0d14] border-[#1b202e] text-gray-300 hover:border-gray-600 hover:text-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white">{voice.name.split(" ")[0]}</span>
                            <span className="text-[10px] font-mono text-gray-400">({voice.gender})</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">{voice.description}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestVoice(voice);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isPreviewing
                              ? "bg-cyan-500 text-black border-cyan-400 animate-pulse"
                              : "bg-[#181c28] border-[#293042] text-gray-300 hover:text-white"
                          }`}
                          title="Listen to sample audio"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Voice Speed Slider */}
                <div className="pt-2 border-t border-[#1b202e] flex items-center justify-between gap-4 text-xs font-mono">
                  <span className="text-gray-400">Speech Rate: {speechRate}x</span>
                  <div className="flex gap-1.5">
                    {[0.9, 1.0, 1.15, 1.25].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSpeechRate(rate)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                          speechRate === rate
                            ? "bg-cyan-500/30 border-cyan-400 text-cyan-300 font-bold"
                            : "bg-[#181c28] border-transparent text-gray-400 hover:text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Language Selection & Hands-Free Mode */}
              <div className="p-4 rounded-2xl bg-[#111420] border border-[#1e2436] flex flex-col justify-between gap-3">
                <div>
                  <label className="text-xs uppercase font-mono tracking-wider text-violet-300 font-semibold flex items-center gap-1.5 mb-2">
                    <Globe className="w-4 h-4 text-violet-400" />
                    <span>3. Conversation Language</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedLanguage(lang)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                          selectedLanguage.code === lang.code
                            ? "bg-violet-950/50 border-violet-500 text-violet-200 ring-1 ring-violet-500/40"
                            : "bg-[#0b0d14] border-[#1b202e] text-gray-400 hover:text-white hover:border-gray-600"
                        }`}
                      >
                        <span className="font-bold text-white block">{lang.name}</span>
                        <span className="text-[10px] text-gray-400">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1b202e] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs text-gray-300">Hands-Free Continuous Dialogue</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHandsFree(!isHandsFree)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                      isHandsFree
                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold"
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    }`}
                  >
                    {isHandsFree ? "Enabled" : "Manual Push-To-Talk"}
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Banner & Big Start Button */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-indigo-950/50 to-pink-950/60 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-violet-300 shadow-inner">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Ready to speak with {selectedModel.name}?
                  </h3>
                  <p className="text-xs text-gray-300 font-mono">
                    Speak into your microphone naturally. {selectedModel.name} will respond with neural voice synthesis.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartLive}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-display font-bold text-base shadow-xl shadow-violet-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                <Radio className="w-5 h-5 text-emerald-300 animate-spin" />
                <span>Start Live with {selectedModel.name}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Active Live Room View */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#08090f]">
            {/* Left/Center Visualizer Stage */}
            <div className="flex-1 flex flex-col items-center justify-between p-6 border-b md:border-b-0 md:border-r border-[#1e2436] relative overflow-hidden">
              {/* Background ambient aura */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div
                  className={`w-[450px] h-[450px] rounded-full blur-3xl transition-all duration-700 ${
                    isAiSpeaking
                      ? "bg-violet-600 scale-125"
                      : isUserSpeaking
                      ? "bg-cyan-500 scale-110"
                      : "bg-indigo-900 scale-90"
                  }`}
                />
              </div>

              {/* Status Header Badge */}
              <div className="z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121522] border border-[#252c42] shadow-md text-xs font-mono">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-300 font-bold">CONNECTED LIVE</span>
                <span className="text-gray-500">•</span>
                <span className="text-white">{selectedModel.name}</span>
              </div>

              {/* Center Holographic Interactive Sound Orb & Sound Waves */}
              <div className="z-10 flex flex-col items-center justify-center my-auto py-8">
                <div className="relative flex items-center justify-center">
                  {/* Outer pulsating frequency rings */}
                  <div
                    className={`absolute rounded-full border border-violet-500/30 transition-all duration-300 ${
                      isAiSpeaking
                        ? "w-64 h-64 scale-110 border-violet-400/50 animate-ping opacity-30"
                        : isUserSpeaking
                        ? "w-64 h-64 scale-110 border-cyan-400/50 animate-ping opacity-30"
                        : "w-48 h-48 opacity-20"
                    }`}
                  />
                  <div
                    className={`absolute rounded-full border-2 transition-all duration-200 ${
                      isAiSpeaking
                        ? "w-52 h-52 border-pink-500/40 animate-pulse"
                        : isUserSpeaking
                        ? "w-52 h-52 border-cyan-400/40 animate-pulse"
                        : "w-40 h-40 border-indigo-500/20"
                    }`}
                  />

                  {/* Main Glowing Sphere with AI Model Logo */}
                  <div
                    className={`w-36 h-36 rounded-full flex flex-col items-center justify-center p-3 shadow-2xl transition-all duration-300 relative z-10 ${
                      isAiSpeaking
                        ? "bg-gradient-to-tr from-violet-600 via-pink-600 to-indigo-600 scale-110 shadow-violet-500/50 ring-4 ring-pink-400/50"
                        : isUserSpeaking
                        ? "bg-gradient-to-tr from-cyan-600 via-teal-600 to-blue-600 scale-105 shadow-cyan-500/50 ring-4 ring-cyan-400/50"
                        : isThinking
                        ? "bg-gradient-to-tr from-amber-600 via-orange-600 to-purple-600 animate-spin shadow-amber-500/30"
                        : "bg-gradient-to-tr from-[#161a29] to-[#0c0e18] border border-gray-700 shadow-black/80"
                    }`}
                  >
                    <AIModelLogo modelId={selectedModel.id} size={54} className="drop-shadow-lg" />
                  </div>
                </div>

                {/* Real-Time Status Text */}
                <div className="text-center mt-6">
                  <h3 className="text-base font-bold font-display text-white">
                    {isAiSpeaking
                      ? `⚡ ${selectedModel.name} is speaking...`
                      : isThinking
                      ? `💭 ${selectedModel.name} is thinking...`
                      : isUserSpeaking
                      ? "🎙️ Hearing your voice..."
                      : isMicMuted
                      ? "🔇 Microphone Muted"
                      : "🎙️ Listening... Speak naturally"}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {isHandsFree ? "Hands-free voice detection enabled" : "Push-to-talk mode"}
                  </p>
                </div>

                {/* Interim Live Transcript bubble */}
                {liveInterimText && (
                  <div className="mt-4 px-4 py-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-xs font-mono max-w-sm text-center animate-pulse">
                    "{liveInterimText}"
                  </div>
                )}
              </div>

              {/* Bottom In-Call Interactive Control Bar */}
              <div className="z-10 w-full max-w-md flex items-center justify-center gap-3 p-3 rounded-2xl bg-[#111420]/90 border border-[#232a3d] backdrop-blur-md shadow-xl">
                {/* Mute/Unmute Mic Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`p-3.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-2 transition-all ${
                    isMicMuted
                      ? "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
                      : "bg-[#181c2b] border-[#2c344a] text-white hover:bg-[#202538]"
                  }`}
                  title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMicMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                </button>

                {/* Stop/Interrupt AI speech */}
                {isAiSpeaking && (
                  <button
                    type="button"
                    onClick={stopAllAudio}
                    className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-all"
                    title="Interrupt / Stop AI Speech"
                  >
                    <Square className="w-5 h-5 fill-amber-400" />
                  </button>
                )}

                {/* Quick Model Switcher Dropdown */}
                <div className="relative group">
                  <select
                    value={selectedModel.id}
                    onChange={(e) => {
                      const m = models.find((mod) => mod.id === e.target.value);
                      if (m) {
                        setSelectedModel(m);
                        const switchTurn: LiveTranscriptTurn = {
                          id: "switch-" + Date.now(),
                          speaker: "ai",
                          modelName: m.name,
                          text: `Switched live persona to ${m.name}. Ready!`,
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        };
                        setTranscript((prev) => [...prev, switchTurn]);
                        speakAiResponse(switchTurn.text);
                      }
                    }}
                    className="bg-[#181c2b] border border-[#2c344a] hover:border-gray-500 text-white rounded-xl px-3 py-3 text-xs font-mono outline-none cursor-pointer"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#111420] text-white">
                        {m.name} ({m.company})
                      </option>
                    ))}
                  </select>
                </div>

                {/* End Live Call Button */}
                <button
                  type="button"
                  onClick={endLiveSession}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-red-900/30 flex items-center gap-1.5"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>End Live</span>
                </button>
              </div>
            </div>

            {/* Right Live Transcript Feed */}
            <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col justify-between bg-[#0b0d14]">
              {/* Transcript Header */}
              <div className="px-4 py-3 border-b border-[#1b202e] bg-[#0e1018] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-bold tracking-wider text-gray-400">Live Dialogue Log</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-gray-400">
                    {transcript.length} turns
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const textContent = transcript.map((t) => `[${t.timestamp}] ${t.modelName}: ${t.text}`).join("\n\n");
                    navigator.clipboard.writeText(textContent);
                    setCopiedId("all");
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  title="Copy full transcript"
                >
                  {copiedId === "all" ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "all" ? "Copied" : "Copy Log"}</span>
                </button>
              </div>

              {/* Scrollable Conversation Stream */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[420px] md:max-h-none">
                {transcript.map((turn) => {
                  const isUser = turn.speaker === "user";
                  return (
                    <div
                      key={turn.id}
                      className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                        <span>{turn.modelName}</span>
                        <span>•</span>
                        <span>{turn.timestamp}</span>
                      </div>
                      <div
                        className={`rounded-2xl p-3 text-xs leading-relaxed max-w-[90%] border relative group ${
                          isUser
                            ? "bg-cyan-950/40 border-cyan-700/40 text-cyan-100"
                            : "bg-[#131622] border-[#22283a] text-gray-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{turn.text}</p>
                        {!isUser && (
                          <div className="flex items-center gap-2 mt-2 pt-1 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => speakAiResponse(turn.text)}
                              className="text-[10px] text-cyan-400 hover:text-white flex items-center gap-1 font-mono"
                              title="Replay speech"
                            >
                              <Play className="w-3 h-3" />
                              <span>Replay</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => copyText(turn.id, turn.text)}
                              className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 font-mono"
                            >
                              {copiedId === turn.id ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === turn.id ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#131622] border border-[#22283a] text-xs text-gray-400 font-mono animate-pulse max-w-[80%]">
                    <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-spin" />
                    <span>{selectedModel.name} is synthesizing answer...</span>
                  </div>
                )}
                <div ref={transcriptBottomRef} />
              </div>

              {/* Silent Text Fallback in Live Room */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualInput.trim()) {
                    handleUserSpokenMessage(manualInput.trim());
                    setManualInput("");
                  }
                }}
                className="p-3 border-t border-[#1b202e] bg-[#0e1018] flex gap-2"
              >
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Or type a message to speak..."
                  className="flex-1 bg-[#141824] border border-[#242b3d] focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim() || isThinking}
                  className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-white transition-all"
                  title="Send text to live AI"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
