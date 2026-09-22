export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  voiceUrl?: string;
  isAudioLoading?: boolean;
}

export interface AIModelPersona {
  id: string;
  name: string;
  company: string;
  description: string;
  color: string;
  accentColor: string;
  badgeBg: string;
  logo: string; // Icon string or styling helper
  versions: string[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  description: string;
  tone?: string;
  accent?: string;
}

export interface LiveTranscriptTurn {
  id: string;
  speaker: "user" | "ai";
  modelName: string;
  text: string;
  timestamp: string;
  isPlaying?: boolean;
}

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  url: string;
  timestamp: string;
  modelUsed: string;
  aspectRatio: string;
}

export interface GeneratedMusicItem {
  id: string;
  prompt: string;
  url: string;
  lyrics?: string;
  timestamp: string;
  duration: number;
}

export interface GeneratedVideoItem {
  id: string;
  prompt: string;
  operationName?: string;
  url?: string;
  status: "queued" | "generating" | "completed" | "failed";
  error?: string;
  timestamp: string;
}

export interface OSBuildConfig {
  osName: string;
  memoryRequirement: string;
  deviceCompatibility: string;
  storageRequirement: string;
  kernelType: string;
  desktopEnvironment: string;
  modelId: string;
  modelName: string;
  prompt: string;
  selectedFeatures: string[];
}

export interface OSBuildLog {
  id: string;
  timestamp: string;
  stage: string;
  message: string;
  type: "info" | "success" | "warning" | "compiler" | "error";
}

export interface OSBuildResult {
  id: string;
  config: OSBuildConfig;
  status: "idle" | "building" | "completed" | "failed";
  progress: number;
  currentStage: string;
  logs: OSBuildLog[];
  isoFileName: string;
  isoSizeFormatted: string;
  isoSizeBytes: number;
  sha256Checksum: string;
  kernelVersion: string;
  grubConfig: string;
  osReleaseInfo: string;
  architectureSummary: string;
  featuresList: string[];
  systemServices: string[];
  packagesInstalled: string[];
  installerScript: string;
  isoDownloadUrl?: string;
  createdAt: string;
}

export type AppTargetPlatform = "windows" | "android" | "ios";
export type AppConvertSource = "html" | "website";

export interface AppConvertConfig {
  targetPlatform: AppTargetPlatform;
  convertSource: AppConvertSource;
  appName: string;
  packageName: string;
  version: string;
  websiteUrl?: string;
  htmlContent?: string;
  htmlFileName?: string;
  iconDataUrl?: string;
  iconFileName?: string;
  splashDataUrl?: string;
  splashFileName?: string;
  enableOfflineCache: boolean;
  enableFullscreen: boolean;
  enableDevTools: boolean;
  enableCameraMic: boolean;
}

export interface AppConvertLog {
  id: string;
  timestamp: string;
  stage: string;
  message: string;
  type: "info" | "success" | "warning" | "compiler" | "error";
}

export interface AppConvertResult {
  id: string;
  config: AppConvertConfig;
  status: "idle" | "converting" | "completed" | "failed";
  progress: number;
  fileName: string;
  fileExtension: ".exe" | ".apk" | ".ipa";
  fileSizeBytes: number;
  fileSizeFormatted: string;
  sha256Checksum: string;
  logs: AppConvertLog[];
  createdAt: string;
}
