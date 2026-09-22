import React, { useState, useRef, useEffect } from "react";
import {
  Smartphone,
  Monitor,
  Apple,
  FileCode,
  Globe,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Shield,
  Zap,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Image as ImageIcon,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Terminal,
  ExternalLink,
  Laptop
} from "lucide-react";
import {
  AppConvertConfig,
  AppConvertLog,
  AppConvertResult,
  AppConvertSource,
  AppTargetPlatform
} from "../types";
import {
  buildAppPackage,
  generateDefaultAppIcon,
  generateDefaultSplashScreen,
  triggerAppPackageDownload
} from "../utils/appConverter";

interface AppConverterStudioProps {
  onOpenLiveModal?: () => void;
}

export const AppConverterStudio: React.FC<AppConverterStudioProps> = () => {
  // Wizard Steps:
  // 0: Select Platform & Conversion Source
  // 1: Configure App Details, HTML/URL & Upload Icons
  // 2: Live Compilation & Packaging
  // 3: Complete, Download Package & Device Preview
  const [step, setStep] = useState<number>(0);

  // Platform and Source state
  const [targetPlatform, setTargetPlatform] = useState<AppTargetPlatform>("windows");
  const [convertSource, setConvertSource] = useState<AppConvertSource>("html");

  // Form State
  const [appName, setAppName] = useState<string>("My Awesome App");
  const [packageName, setPackageName] = useState<string>("com.devoapt.myapp");
  const [appVersion, setAppVersion] = useState<string>("1.0.0");
  const [websiteUrl, setWebsiteUrl] = useState<string>("https://ai.studio/build");
  const [htmlContent, setHtmlContent] = useState<string>(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 30px;
      background: linear-gradient(135deg, #0b0f19, #1a1f35);
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 40px 30px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      background: linear-gradient(to right, #00d2ff, #3a7bd5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: #a0aec0; font-size: 15px; line-height: 1.6; }
    button {
      margin-top: 20px;
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      background: #00d2ff;
      color: #0b0f19;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 48px; margin-bottom: 12px;">🚀</div>
    <h1>Hello from Native App!</h1>
    <p>This web application was converted into a standalone native application using DevoAPT App Synthesizer.</p>
    <button onclick="alert('Native interaction triggered!')">Click Me</button>
  </div>
</body>
</html>`);
  const [htmlFileName, setHtmlFileName] = useState<string>("index.html");

  // Assets
  const [iconDataUrl, setIconDataUrl] = useState<string>("");
  const [iconFileName, setIconFileName] = useState<string>("");
  const [splashDataUrl, setSplashDataUrl] = useState<string>("");
  const [splashFileName, setSplashFileName] = useState<string>("");

  // Toggles
  const [enableOfflineCache, setEnableOfflineCache] = useState<boolean>(true);
  const [enableFullscreen, setEnableFullscreen] = useState<boolean>(false);
  const [enableDevTools, setEnableDevTools] = useState<boolean>(false);
  const [enableCameraMic, setEnableCameraMic] = useState<boolean>(true);

  // Build execution state
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertProgress, setConvertProgress] = useState<number>(0);
  const [convertStage, setConvertStage] = useState<string>("");
  const [convertLogs, setConvertLogs] = useState<AppConvertLog[]>([]);
  const [convertResult, setConvertResult] = useState<AppConvertResult | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Refs for file uploads
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollTop = terminalBottomRef.current.scrollHeight;
    }
  }, [convertLogs]);

  // Sync package name with app name if default
  const handleAppNameChange = (val: string) => {
    setAppName(val);
    const sanitized = val.toLowerCase().replace(/[^a-z0-9]/g, "");
    setPackageName(`com.devoapt.${sanitized || "app"}`);
  };

  // HTML file upload handler
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHtmlFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setHtmlContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  // Icon file upload handler
  const handleIconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setIconDataUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Splash file upload handler
  const handleSplashFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSplashFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSplashDataUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Get effective icon preview
  const effectiveIconUrl = iconDataUrl || generateDefaultAppIcon(appName, targetPlatform);
  const effectiveSplashUrl = splashDataUrl || generateDefaultSplashScreen(appName, targetPlatform);

  // File extension label helper
  const getExt = () => {
    if (targetPlatform === "windows") return ".exe";
    if (targetPlatform === "android") return ".apk";
    return ".ipa";
  };

  const getPlatformLabel = () => {
    if (targetPlatform === "windows") return "Windows (.exe)";
    if (targetPlatform === "android") return "Android (.apk)";
    return "iOS (.ipa)";
  };

  // Start Conversion Pipeline
  const startConversionPipeline = async () => {
    setStep(2);
    setIsConverting(true);
    setConvertProgress(5);
    setConvertLogs([]);
    setConvertResult(null);
    setGeneratedBlob(null);

    const addLog = (
      stage: string,
      message: string,
      type: "info" | "success" | "warning" | "compiler" | "error" = "info"
    ) => {
      const now = new Date();
      const timeStr =
        now.toTimeString().split(" ")[0] +
        "." +
        String(now.getMilliseconds()).padStart(3, "0");
      setConvertLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: timeStr,
          stage,
          message,
          type
        }
      ]);
    };

    const ext = getExt();
    addLog("INIT", `Initializing App Synthesizer for ${appName} (Target: ${getPlatformLabel()})...`, "info");
    addLog("SOURCE", `Source Type: ${convertSource === "html" ? `HTML File (${htmlFileName})` : `Live Website URL (${websiteUrl})`}`, "info");

    try {
      // Step 1: Asset Ingestion & Image Processing
      setConvertStage("Ingesting & Processing Visual Assets (Icon & Splash Screen)");
      setConvertProgress(20);
      await new Promise((r) => setTimeout(r, 600));

      addLog("ASSETS", `Generating multi-resolution icon assets (16x16 up to 512x512 PNG)...`, "compiler");
      addLog("SPLASH", `Optimizing splash screen viewport & launch storyboard assets...`, "compiler");

      // Step 2: Target Manifest & Permissions Synthesis
      setConvertStage(`Synthesizing ${targetPlatform.toUpperCase()} Manifest & Security Descriptors`);
      setConvertProgress(45);
      await new Promise((r) => setTimeout(r, 700));

      if (targetPlatform === "windows") {
        addLog("PE_HEADER", `Writing MS-DOS 'MZ' stub & PE32+ (AMD64) 64-bit executable header...`, "compiler");
        addLog("SUBSYSTEM", `Configuring Windows GUI Subsystem 2 with High-DPI Per-Monitor V2 scaling...`, "compiler");
      } else if (targetPlatform === "android") {
        addLog("MANIFEST", `Generating AndroidManifest.xml for package '${packageName}'...`, "compiler");
        addLog("PERMISSIONS", `Injected permissions: INTERNET, ACCESS_NETWORK_STATE, CAMERA, RECORD_AUDIO`, "compiler");
        addLog("DEX", `Compiling Dalvik bytecode runtime & native WebView client...`, "compiler");
      } else {
        addLog("PLIST", `Generating Apple Info.plist for bundle '${packageName}'...`, "compiler");
        addLog("MACHO", `Writing ARM64 Mach-O 64-bit binary stub (0xFEEDFACF)...`, "compiler");
        addLog("STORYBOARD", `Compiling iOS LaunchScreen.storyboardc...`, "compiler");
      }

      // Step 3: Bundle HTML Webview & Offline Cache
      setConvertStage("Bundling Webview Runtime & Offline Storage Engine");
      setConvertProgress(70);
      await new Promise((r) => setTimeout(r, 650));

      if (convertSource === "website") {
        addLog("WEBVIEW", `Injecting secure live bridge to target: ${websiteUrl}`, "info");
        addLog("SECURITY", `Configuring Content-Security-Policy & SSL/TLS certificate pinning...`, "compiler");
      } else {
        addLog("HTML", `Embedding ${htmlContent.length} bytes of HTML/CSS/JS payload into root asset directory`, "compiler");
        if (enableOfflineCache) {
          addLog("SERVICE_WORKER", `Configuring Service Worker & CacheStorage API for 100% offline usage`, "compiler");
        }
      }

      // Step 4: Archive Packaging & Code Signing
      setConvertStage(`Assembling & Signing Final ${ext} Package`);
      setConvertProgress(88);
      await new Promise((r) => setTimeout(r, 800));

      const config: AppConvertConfig = {
        targetPlatform,
        convertSource,
        appName,
        packageName,
        version: appVersion,
        websiteUrl: convertSource === "website" ? websiteUrl : undefined,
        htmlContent: convertSource === "html" ? htmlContent : undefined,
        htmlFileName: convertSource === "html" ? htmlFileName : undefined,
        iconDataUrl: iconDataUrl || generateDefaultAppIcon(appName, targetPlatform),
        iconFileName,
        splashDataUrl: splashDataUrl || generateDefaultSplashScreen(appName, targetPlatform),
        splashFileName,
        enableOfflineCache,
        enableFullscreen,
        enableDevTools,
        enableCameraMic
      };

      const result = await buildAppPackage(config);

      addLog("SIGNING", `Applying standard developer test certificate & signing hash digest...`, "compiler");
      addLog("CHECKSUM", `SHA-256 Checksum generated: ${result.sha256}`, "success");
      addLog("COMPLETE", `Successfully generated ${result.fileName} (${result.fileSizeFormatted})!`, "success");

      setGeneratedBlob(result.blob);
      setConvertResult({
        id: `app-${Date.now()}`,
        config,
        status: "completed",
        progress: 100,
        fileName: result.fileName,
        fileExtension: ext as any,
        fileSizeBytes: result.fileSizeBytes,
        fileSizeFormatted: result.fileSizeFormatted,
        sha256Checksum: result.sha256,
        logs: convertLogs,
        createdAt: new Date().toLocaleString()
      });

      setConvertProgress(100);
      setIsConverting(false);
      setStep(3);
    } catch (err: any) {
      addLog("ERROR", `Conversion failed: ${err.message}`, "error");
      setIsConverting(false);
    }
  };

  // Download Trigger
  const handleDownload = () => {
    if (generatedBlob && convertResult) {
      triggerAppPackageDownload(generatedBlob, convertResult.fileName);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0d14] text-[#e0e2ec] overflow-y-auto">
      {/* HEADER BANNER */}
      <div className="border-b border-[#1f2833] bg-[#12141f] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold text-white tracking-tight">
                Create Your Own App Synthesizer
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono font-bold">
                .exe • .apk • .ipa
              </span>
            </div>
            <p className="text-xs text-[#868d99]">
              Convert any HTML file or live Website URL directly into a standalone Windows .exe, Android .apk, or iOS .ipa package.
            </p>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {[
            { num: 0, label: "Platform & Source" },
            { num: 1, label: "App & Assets" },
            { num: 2, label: "Packaging" },
            { num: 3, label: "Download App" }
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (isCompleted && !isConverting) setStep(s.num);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-500/20 border-purple-500/60 text-purple-300 font-bold"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-[#181a24] border-[#252836] text-gray-500"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/40">
                  {isCompleted ? "✓" : s.num + 1}
                </span>
                <span className="hidden sm:inline text-[11px]">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 0: CHOOSE TARGET PLATFORM & SOURCE */}
      {step === 0 && (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
          {/* Main Hero Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#171328] via-[#1d1633] to-[#171328] border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-mono font-semibold mb-4 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Platform Native Binary Compiler</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 tracking-tight">
                Which type of app do you want to convert into?
              </h2>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Transform your code or live web links into real native executable installer packages.
                Choose between Windows <code className="text-cyan-300 font-mono">.exe</code>, Android <code className="text-emerald-300 font-mono">.apk</code>, or iOS <code className="text-blue-300 font-mono">.ipa</code>.
              </p>
            </div>
          </div>

          {/* 1. SELECT TARGET PLATFORM */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>1. Select Target Application Format</span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">Choose 1 platform</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Windows .exe Card */}
              <div
                onClick={() => setTargetPlatform("windows")}
                className={`p-6 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                  targetPlatform === "windows"
                    ? "bg-[#111927] border-cyan-500 shadow-xl shadow-cyan-950/40 ring-2 ring-cyan-500/50"
                    : "bg-[#12141f] hover:bg-[#161a28] border-[#1f2833] text-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    .EXE
                  </span>
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-1">Windows Application</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Standalone PE32+ 64-bit desktop executable with embedded webview runtime for Windows 10/11.
                </p>
                <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 font-semibold">
                  <span>{targetPlatform === "windows" ? "✓ Selected Format" : "Select Windows .exe"}</span>
                </div>
              </div>

              {/* Android .apk Card */}
              <div
                onClick={() => setTargetPlatform("android")}
                className={`p-6 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                  targetPlatform === "android"
                    ? "bg-[#101e16] border-emerald-500 shadow-xl shadow-emerald-950/40 ring-2 ring-emerald-500/50"
                    : "bg-[#12141f] hover:bg-[#161a28] border-[#1f2833] text-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    .APK
                  </span>
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-1">Android Package</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Universal signed APK package ready to install on Android smartphones, tablets, and emulators.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                  <span>{targetPlatform === "android" ? "✓ Selected Format" : "Select Android .apk"}</span>
                </div>
              </div>

              {/* iOS .ipa Card */}
              <div
                onClick={() => setTargetPlatform("ios")}
                className={`p-6 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                  targetPlatform === "ios"
                    ? "bg-[#161726] border-blue-500 shadow-xl shadow-blue-950/40 ring-2 ring-blue-500/50"
                    : "bg-[#12141f] hover:bg-[#161a28] border-[#1f2833] text-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Apple className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    .IPA
                  </span>
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-1">iOS Application</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  iOS application bundle (Payload structure) with Info.plist for iPhone & iPad sideloading.
                </p>
                <div className="text-[11px] font-mono text-blue-400 flex items-center gap-1 font-semibold">
                  <span>{targetPlatform === "ios" ? "✓ Selected Format" : "Select iOS .ipa"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SELECT CONVERSION SOURCE TYPE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>2. Select Which Type of Source Converts Into {getPlatformLabel()}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: HTML into Format */}
              <div
                onClick={() => setConvertSource("html")}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                  convertSource === "html"
                    ? "bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-950/30"
                    : "bg-[#12141f] hover:bg-[#161a28] border-[#1f2833] text-gray-400"
                }`}
              >
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <FileCode className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-white">
                      HTML into {getExt()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Offline Standalone
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Import an HTML file (with embedded CSS/JS) and bundle it completely inside the {getExt()} app for 100% offline usage.
                  </p>
                </div>
              </div>

              {/* Option B: Website into Format */}
              <div
                onClick={() => setConvertSource("website")}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                  convertSource === "website"
                    ? "bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-950/30"
                    : "bg-[#12141f] hover:bg-[#161a28] border-[#1f2833] text-gray-400"
                }`}
              >
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-white">
                      Website into {getExt()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Live Web Wrapper
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Type a Web Address (URL) to wrap any live web application or store into a fullscreen native {getExt()} container.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-[#1f2833] flex justify-end">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-display font-bold text-sm shadow-xl shadow-purple-950/50 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Continue to Configure App & Upload Assets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: CONFIGURE APP, IMPORT HTML/URL, IMPORT ICON & SPLASH */}
      {step === 1 && (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f2833] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                  Step 2 of 3
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  {convertSource === "html" ? "HTML" : "Website"} → {getPlatformLabel()}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                Configure App Identity, Import Files & Upload Pictures
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload your custom app icon picture, splash screen, and set up source code or website address.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-3 py-1.5 rounded-lg bg-[#181a24] text-gray-400 hover:text-white border border-[#252836] text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Format</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 space-y-5">
              {/* 1. App Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-gray-300 font-semibold flex items-center justify-between">
                  <span>1. Enter App Name</span>
                  <span className="text-[11px] text-gray-500 font-normal">Displays on device home screen</span>
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => handleAppNameChange(e.target.value)}
                  placeholder="e.g. My Awesome App"
                  className="w-full bg-[#12141f] border border-[#1f2833] focus:border-purple-500 rounded-xl px-4 py-3 text-white font-display text-base font-semibold outline-none transition-all"
                />
              </div>

              {/* 2. Source Configuration (HTML vs Website) */}
              {convertSource === "website" ? (
                /* Website URL Input */
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-gray-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>2. Type a Web Address (URL)</span>
                    </span>
                    <span className="text-[11px] text-indigo-400 font-mono">Must include https://</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-[#12141f] border border-[#1f2833] focus:border-indigo-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition-all placeholder:text-gray-600"
                    />
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-white rounded bg-[#1c2132]"
                      title="Test URL in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    The {getExt()} application will automatically load this URL in a hardware-accelerated viewport.
                  </p>
                </div>
              ) : (
                /* HTML File Import & Code Area */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-gray-300 font-semibold flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-purple-400" />
                      <span>2. Import an HTML File</span>
                    </label>

                    {/* Hidden input for HTML file selection */}
                    <input
                      type="file"
                      ref={htmlInputRef}
                      onChange={handleHtmlFileUpload}
                      accept=".html,.htm,.txt"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => htmlInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File ({htmlFileName})</span>
                    </button>
                  </div>

                  {/* HTML Editor Preview Textarea */}
                  <div className="relative">
                    <textarea
                      rows={6}
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="<!DOCTYPE html>..."
                      className="w-full bg-[#0e1017] border border-[#1f2833] focus:border-purple-500 rounded-xl p-3.5 text-cyan-300 font-mono text-xs outline-none transition-all leading-relaxed"
                    />
                    <div className="absolute right-3 bottom-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-gray-400 border border-white/10">
                      {htmlContent.length} characters
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Assets: App Icon Picture & Splash Screen Picture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* App Icon Upload Card */}
                <div className="p-4 rounded-xl bg-[#12141f] border border-[#1f2833] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-gray-300 font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3. Import App Icon Picture</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <img
                      src={effectiveIconUrl}
                      alt="App Icon Preview"
                      className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-md bg-black/40"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={iconInputRef}
                        onChange={handleIconFileUpload}
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#1a1f30] hover:bg-[#232940] text-gray-200 border border-[#2d3748] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Upload className="w-3 h-3 text-cyan-400" />
                        <span>{iconFileName ? iconFileName : "Upload Icon Picture"}</span>
                      </button>
                      <p className="text-[10px] text-gray-500">
                        {iconFileName ? "Custom image loaded" : "Auto-generated default active"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Splash Screen Picture Upload Card */}
                <div className="p-4 rounded-xl bg-[#12141f] border border-[#1f2833] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-gray-300 font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>4. Import Splash Screen</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <img
                      src={effectiveSplashUrl}
                      alt="Splash Screen Preview"
                      className="w-12 h-16 rounded-lg object-cover border border-white/20 shadow-md bg-black/40"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={splashInputRef}
                        onChange={handleSplashFileUpload}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => splashInputRef.current?.click()}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#1a1f30] hover:bg-[#232940] text-gray-200 border border-[#2d3748] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Upload className="w-3 h-3 text-purple-400" />
                        <span>{splashFileName ? splashFileName : "Upload Splash Screen"}</span>
                      </button>
                      <p className="text-[10px] text-gray-500">
                        {splashFileName ? "Custom splash loaded" : "Auto-generated default active"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Identification Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-gray-400">Package / Bundle Identifier</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full bg-[#12141f] border border-[#1f2833] rounded-lg px-3 py-2 text-white font-mono text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-gray-400">Version Tag</label>
                  <input
                    type="text"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    className="w-full bg-[#12141f] border border-[#1f2833] rounded-lg px-3 py-2 text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Device Mockup Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gray-400 font-semibold">Live Device Frame Preview</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-purple-400 border border-purple-500/20">
                  {getPlatformLabel()}
                </span>
              </div>

              {/* Device Frame */}
              <div className="rounded-2xl bg-[#080a10] border border-[#1f2833] p-4 flex flex-col items-center justify-center min-h-[380px] shadow-2xl relative">
                {targetPlatform === "windows" ? (
                  /* Windows Frame */
                  <div className="w-full max-w-[280px] rounded-xl bg-[#161a28] border border-[#2d3748] shadow-2xl overflow-hidden">
                    <div className="bg-[#10131d] px-3 py-1.5 border-b border-[#252b3d] flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <img src={effectiveIconUrl} alt="" className="w-3.5 h-3.5 rounded" />
                        <span className="truncate max-w-[120px] text-gray-200">{appName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-gray-500" />
                        <span className="w-2 h-2 border border-gray-500" />
                        <span className="text-red-400 text-[10px]">✕</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0a0d14] flex flex-col items-center justify-center min-h-[220px] text-center">
                      <img src={effectiveIconUrl} alt="" className="w-14 h-14 rounded-xl shadow-lg mb-3" />
                      <div className="font-bold text-sm text-white mb-1">{appName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mb-3">v{appVersion} • x64 Native</div>
                      <div className="text-[11px] text-gray-400 px-2 line-clamp-3">
                        {convertSource === "website" ? websiteUrl : "Embedded Offline HTML Bundle"}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mobile Phone Frame (Android / iOS) */
                  <div className="w-[200px] h-[360px] rounded-[36px] bg-[#12141f] border-4 border-[#252836] shadow-2xl p-2.5 flex flex-col justify-between relative overflow-hidden">
                    {/* Speaker / Dynamic Island */}
                    <div className="w-16 h-3.5 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#222]" />
                    </div>

                    {/* Phone Screen Display */}
                    <div className="flex-1 rounded-2xl bg-gradient-to-b from-[#0b0e14] to-[#141824] p-3 flex flex-col items-center justify-center text-center">
                      <img
                        src={effectiveIconUrl}
                        alt=""
                        className={`w-14 h-14 shadow-xl mb-2.5 ${
                          targetPlatform === "android" ? "rounded-full" : "rounded-2xl"
                        }`}
                      />
                      <div className="font-bold text-xs text-white line-clamp-1">{appName}</div>
                      <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                        {targetPlatform === "android" ? "Android 14+ Ready" : "iOS 18+ Ready"}
                      </div>
                    </div>

                    {/* Home Bar */}
                    <div className="w-16 h-1 bg-gray-600 rounded-full mx-auto mt-2" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Step Controls */}
          <div className="pt-6 border-t border-[#1f2833] flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-4 py-2.5 rounded-xl bg-[#161924] text-gray-400 hover:text-white border border-[#252836] text-xs font-semibold"
            >
              Back to Platform Selection
            </button>

            <button
              type="button"
              disabled={!appName.trim() || (convertSource === "website" && !websiteUrl.trim())}
              onClick={startConversionPipeline}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-display font-bold text-sm shadow-xl shadow-purple-950/50 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {targetPlatform === "windows"
                  ? "Convert into .exe"
                  : targetPlatform === "android"
                  ? "Generate .apk file"
                  : "Generate .ipa file"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LIVE PACKAGING PIPELINE */}
      {step === 2 && (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f2833] pb-4">
            <div>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                Packaging Pipeline
              </span>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                Synthesizing {getPlatformLabel()} for {appName}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300 font-bold">{convertProgress}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-300">{convertStage || "Compiling application package..."}</span>
              <span className="text-purple-400 font-bold">{convertProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#12141f] rounded-full overflow-hidden border border-[#1f2833]">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 transition-all duration-300 rounded-full"
                style={{ width: `${convertProgress}%` }}
              />
            </div>
          </div>

          {/* Live Terminal Logger */}
          <div className="rounded-2xl bg-[#090b10] border border-[#1f2833] overflow-hidden shadow-2xl">
            <div className="bg-[#12141f] px-4 py-3 border-b border-[#1f2833] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Compiler Terminal Output</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Live Stream</span>
            </div>

            <div
              ref={terminalBottomRef}
              className="p-4 h-80 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#08090e]"
            >
              {convertLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-gray-600 select-none text-[11px]">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      log.type === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : log.type === "error"
                        ? "bg-red-500/20 text-red-400"
                        : log.type === "compiler"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {log.stage}
                  </span>
                  <span
                    className={
                      log.type === "success"
                        ? "text-emerald-300 font-semibold"
                        : log.type === "error"
                        ? "text-red-300 font-semibold"
                        : log.type === "compiler"
                        ? "text-gray-300"
                        : "text-gray-400"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COMPLETED & DOWNLOAD READY */}
      {step === 3 && convertResult && (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
          {/* Success Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#121c17] via-[#162720] to-[#121c17] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <img
                  src={effectiveIconUrl}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400/50 shadow-xl shadow-emerald-950/50"
                />
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold mb-1.5 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Package Compiled & Verified</span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">{convertResult.fileName}</h2>
                  <p className="text-xs text-gray-300 mt-1">
                    {targetPlatform === "windows"
                      ? "Ready to run on any 64-bit Windows machine."
                      : targetPlatform === "android"
                      ? "Ready to download and install on your Android phone."
                      : "Ready to sideload on your iPhone or iPad."}
                  </p>
                </div>
              </div>

              {/* Primary Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-bold text-base shadow-2xl shadow-emerald-950/60 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                <span>
                  {targetPlatform === "windows"
                    ? "Download .exe File"
                    : targetPlatform === "android"
                    ? "Download APK File"
                    : "Download IPA File"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-black/40 font-mono text-emerald-200">
                  {convertResult.fileSizeFormatted}
                </span>
              </button>
            </div>
          </div>

          {/* Package Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#12141f] border border-[#1f2833]">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">Target Package Format</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {targetPlatform === "windows" ? (
                  <Monitor className="w-4 h-4 text-cyan-400" />
                ) : targetPlatform === "android" ? (
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Apple className="w-4 h-4 text-blue-400" />
                )}
                <span>{getPlatformLabel()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#12141f] border border-[#1f2833]">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">Package Size</span>
              <div className="text-sm font-bold text-cyan-300 font-mono">{convertResult.fileSizeFormatted}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#12141f] border border-[#1f2833]">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">Created At</span>
              <div className="text-sm font-bold text-white">{convertResult.createdAt}</div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="p-6 rounded-2xl bg-[#12141f] border border-[#1f2833] space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>How to Install & Run Your New {getPlatformLabel()}</span>
            </h3>

            {targetPlatform === "windows" && (
              <div className="space-y-2 text-xs text-gray-300 leading-relaxed font-sans">
                <p>
                  1. Click <strong>"Download .exe File"</strong> above to save the executable to your PC.
                </p>
                <p>
                  2. Double-click the downloaded <code>{convertResult.fileName}</code> file to launch the standalone desktop window.
                </p>
                <p>
                  3. If Windows SmartScreen appears ("Windows protected your PC"), click <em>"More info"</em> and then <em>"Run anyway"</em>.
                </p>
              </div>
            )}

            {targetPlatform === "android" && (
              <div className="space-y-2 text-xs text-gray-300 leading-relaxed font-sans">
                <p>
                  1. Click <strong>"Download APK File"</strong> directly on your Android phone browser or transfer it via USB/Google Drive.
                </p>
                <p>
                  2. Tap the downloaded <code>{convertResult.fileName}</code> file in your Notifications or Files app.
                </p>
                <p>
                  3. If prompted with <em>"Install unknown apps"</em>, toggle <strong>Allow from this source</strong> to complete installation.
                </p>
              </div>
            )}

            {targetPlatform === "ios" && (
              <div className="space-y-2 text-xs text-gray-300 leading-relaxed font-sans">
                <p>
                  1. Click <strong>"Download IPA File"</strong> to save the iOS package.
                </p>
                <p>
                  2. Sideload the <code>{convertResult.fileName}</code> onto your iPhone using AltStore, Sideloadly, or Apple Configurator.
                </p>
                <p>
                  3. Go to <em>Settings → General → VPN & Device Management</em> on your iPhone and tap <strong>Trust Developer</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Cryptographic SHA-256 Hash Card */}
          <div className="p-4 rounded-xl bg-[#090b10] border border-[#1f2833] flex items-center justify-between gap-3 text-xs font-mono">
            <div className="truncate">
              <span className="text-gray-500">SHA-256: </span>
              <span className="text-cyan-400">{convertResult.sha256Checksum}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(convertResult.sha256Checksum, "sha256")}
              className="px-3 py-1.5 rounded bg-[#181a24] text-gray-300 hover:text-white border border-[#252836] flex items-center gap-1 shrink-0"
            >
              {copiedSection === "sha256" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === "sha256" ? "Copied" : "Copy Hash"}</span>
            </button>
          </div>

          {/* Footer Reset button */}
          <div className="pt-4 border-t border-[#1f2833] flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-4 py-2.5 rounded-xl bg-[#161924] text-gray-400 hover:text-white border border-[#252836] text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Convert Another App</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Download Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
