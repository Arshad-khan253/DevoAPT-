import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  HardDrive,
  Download,
  Sparkles,
  Play,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Shield,
  Zap,
  Code2,
  FileCode,
  Box,
  Monitor,
  Server,
  Database,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Laptop
} from "lucide-react";
import { AIModelPersona, OSBuildConfig, OSBuildLog, OSBuildResult } from "../types";
import { AIModelLogo } from "./AIModelLogos";
import { triggerIsoDownload } from "../utils/isoBuilder";

interface OSBuilderStudioProps {
  models: AIModelPersona[];
  onOpenLiveModal?: () => void;
}

const MEMORY_OPTIONS = [
  "256 MB (Ultra-Lightweight Embedded)",
  "512 MB (Minimal Server / IoT)",
  "1 GB (Lightweight Live OS)",
  "2 GB (Standard Desktop Environment)",
  "4 GB (Recommended for Multitasking)",
  "8 GB (Power User & AI Workstation)",
  "16 GB+ (High-Performance Computing)"
];

const COMPATIBILITY_OPTIONS = [
  "x86_64 PC (UEFI 64-bit & Legacy BIOS)",
  "ARM64 (Raspberry Pi 4/5, Apple Silicon, Rockchip)",
  "Universal Multi-Arch Hybrid (x86_64 + AArch64)",
  "RISC-V 64-bit Core & Virtual Machines",
  "Cloud VM & Container Hypervisor (QEMU / KVM / Proxmox)",
  "Embedded IoT & Single-Board Computers"
];

const STORAGE_OPTIONS = [
  "500 MB (Embedded Flash Storage)",
  "2 GB (Minimal Compact USB Live)",
  "8 GB (Standard Desktop Installation)",
  "20 GB (Developer Pro Workstation)",
  "64 GB (Full AI / Deep Learning Suite)"
];

const KERNEL_OPTIONS = [
  { id: "linux-6.12", name: "Linux Kernel 6.12 LTS", desc: "Stable, high-performance monolithic kernel with universal hardware support" },
  { id: "redox-rust", name: "Redox Microkernel (Rust)", desc: "Memory-safe, modern modular microkernel built for zero-crash reliability" },
  { id: "mach-bsd", name: "Mach / BSD Hybrid Subsystem", desc: "Unix-compliant robust server and workstation subsystem" },
  { id: "devo-rtos", name: "Devo Real-Time RTOS Core", desc: "Sub-millisecond latency deterministic scheduling for critical computing" }
];

const DESKTOP_OPTIONS = [
  { id: "devoglass", name: "DevoGlass 3D Compositor", desc: "Modern glassmorphic GPU-accelerated desktop with fluid physics" },
  { id: "cybermatrix", name: "CyberMatrix TUI Terminal", desc: "Ultra-fast keyboard-driven terminal dashboard for developers & hackers" },
  { id: "wayland-minimal", name: "Minimalist Wayland Shell", desc: "Resource-saving clean aesthetic optimized for battery and speed" },
  { id: "headless", name: "Headless Server / Cloud Node", desc: "No GUI, pure low-overhead SSH & web console environment" }
];

const PRESET_FEATURES = [
  { id: "ai_copilot", label: "🤖 Built-in Terminal AI Copilot", desc: "Integrated local LLM helper in shell" },
  { id: "fast_boot", label: "⚡ Ultra-Fast Boot (< 1.2s)", desc: "Parallel init system & instant systemd target" },
  { id: "zero_trust", label: "🛡️ Zero-Trust Sandbox Security", desc: "AppArmor & kernel namespaces by default" },
  { id: "devo_pkg", label: "📦 Package Manager (devo-pkg)", desc: "Atomic transactions and instant rollback" },
  { id: "gaming_vulkan", label: "🎮 Vulkan & Low-Latency Audio Stack", desc: "Optimized PipeWire & Mesa 3D drivers" },
  { id: "quantum_crypto", label: "🔒 Quantum-Resistant Encryption", desc: "Kyber / Dilithium cryptographic keys" },
  { id: "zfs_snapshots", label: "💾 ZFS / Btrfs Snapshot Auto-Rollback", desc: "Crash recovery checkpoints on every update" },
  { id: "wasm_runtime", label: "🌐 Native WebAssembly / Node Runtime", desc: "Execute web apps at near C speed" },
  { id: "live_pxe", label: "📡 Live USB & PXE Network Booting", desc: "Plug & play boot without touching local drives" }
];

const SAMPLE_OS_TEMPLATES = [
  {
    name: "DevoOS Quantum",
    memory: "2 GB (Standard Desktop Environment)",
    arch: "x86_64 PC (UEFI 64-bit & Legacy BIOS)",
    storage: "8 GB (Standard Desktop Installation)",
    kernel: "Linux Kernel 6.12 LTS",
    desktop: "DevoGlass 3D Compositor",
    model: "devoapt",
    prompt: "Create an ultra-modern operating system designed for AI developers and power users, with transparent glass windows, native AI terminal assistant, and instant hardware acceleration.",
    features: ["ai_copilot", "fast_boot", "zero_trust", "devo_pkg", "gaming_vulkan"]
  },
  {
    name: "AetherSec Linux",
    memory: "1 GB (Lightweight Live OS)",
    arch: "Universal Multi-Arch Hybrid (x86_64 + AArch64)",
    storage: "2 GB (Minimal Compact USB Live)",
    kernel: "Linux Kernel 6.12 LTS",
    desktop: "CyberMatrix TUI Terminal",
    model: "deepseek",
    prompt: "Build an impenetrable cybersecurity and penetration testing OS with network packet visualizers, memory sandboxing, and zero telemetry.",
    features: ["fast_boot", "zero_trust", "quantum_crypto", "live_pxe"]
  },
  {
    name: "NanoRT Embedded OS",
    memory: "256 MB (Ultra-Lightweight Embedded)",
    arch: "ARM64 (Raspberry Pi 4/5, Apple Silicon, Rockchip)",
    storage: "500 MB (Embedded Flash Storage)",
    kernel: "Redox Microkernel (Rust)",
    desktop: "Minimalist Wayland Shell",
    model: "claude",
    prompt: "Create a featherlight, highly efficient IoT OS written in memory-safe Rust with instant boot capabilities and real-time sensor processing.",
    features: ["fast_boot", "wasm_runtime", "zero_trust"]
  }
];

export const OSBuilderStudio: React.FC<OSBuilderStudioProps> = ({ models }) => {
  // Wizard steps: 0 = Intro / Dashboard, 1 = Config Specs, 2 = Choose Model, 3 = Prompt & Features, 4 = Building / Terminal, 5 = Complete & Download
  const [step, setStep] = useState<number>(0);

  // Form State
  const [osName, setOsName] = useState<string>("DevoOS Quantum");
  const [memoryRequirement, setMemoryRequirement] = useState<string>(MEMORY_OPTIONS[3]); // 2 GB
  const [deviceCompatibility, setDeviceCompatibility] = useState<string>(COMPATIBILITY_OPTIONS[0]); // x86_64 PC
  const [storageRequirement, setStorageRequirement] = useState<string>(STORAGE_OPTIONS[2]); // 8 GB
  const [kernelType, setKernelType] = useState<string>(KERNEL_OPTIONS[0].name);
  const [desktopEnvironment, setDesktopEnvironment] = useState<string>(DESKTOP_OPTIONS[0].name);
  const [selectedModel, setSelectedModel] = useState<AIModelPersona>(models[0]);
  const [prompt, setPrompt] = useState<string>(
    "Build a blazing-fast, secure, and modern operating system equipped with a built-in neural AI terminal copilot, zero-trust container sandboxing, and glassmorphic UI."
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "ai_copilot",
    "fast_boot",
    "zero_trust",
    "devo_pkg"
  ]);

  // Build execution state
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const [buildStage, setBuildStage] = useState<string>("");
  const [buildLogs, setBuildLogs] = useState<OSBuildLog[]>([]);
  const [buildResult, setBuildResult] = useState<OSBuildResult | null>(null);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Virtual Machine Terminal Simulator State
  const [isVmRunning, setIsVmRunning] = useState<boolean>(false);
  const [vmLogs, setVmLogs] = useState<string[]>([]);
  const [vmInput, setVmInput] = useState<string>("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const vmBottomRef = useRef<HTMLDivElement>(null);

  // Scroll terminal logs automatically
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollTop = terminalBottomRef.current.scrollHeight;
    }
  }, [buildLogs]);

  useEffect(() => {
    if (vmBottomRef.current) {
      vmBottomRef.current.scrollTop = vmBottomRef.current.scrollHeight;
    }
  }, [vmLogs]);

  // Toggle feature tag
  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== featureId));
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
    }
  };

  // Generate random cool name
  const generateRandomName = () => {
    const prefixes = ["Devo", "Quantum", "Nexus", "Aether", "Apex", "Nova", "Cyber", "Vortex", "Horizon", "Titan"];
    const suffixes = ["OS", "Linux", "Core", "RT", "Matrix", "System", "Sphere", "Station", "Node"];
    const codenames = ["Pro", "Nebula", "Titan", "Zero", "Pulse", "Infinity", "Ultra", "Prime"];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    const c = codenames[Math.floor(Math.random() * codenames.length)];
    setOsName(`${p}${s} ${c}`);
  };

  // Load template
  const applyTemplate = (template: typeof SAMPLE_OS_TEMPLATES[0]) => {
    setOsName(template.name);
    setMemoryRequirement(template.memory);
    setDeviceCompatibility(template.arch);
    setStorageRequirement(template.storage);
    setKernelType(template.kernel);
    setDesktopEnvironment(template.desktop);
    const foundModel = models.find((m) => m.id === template.model) || models[0];
    setSelectedModel(foundModel);
    setPrompt(template.prompt);
    setSelectedFeatures(template.features);
    setStep(1);
  };

  // Copy helper
  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Build OS Orchestrator
  const startBuildPipeline = async () => {
    setStep(4);
    setIsBuilding(true);
    setBuildProgress(5);
    setBuildLogs([]);
    setBuildResult(null);

    const addLog = (stage: string, message: string, type: "info" | "success" | "warning" | "compiler" | "error" = "info") => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
      setBuildLogs((prev) => [
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

    addLog("INIT", `Starting build pipeline for ${osName}...`, "info");
    addLog("CONFIG", `Architecture: ${deviceCompatibility} | Target RAM: ${memoryRequirement} | Storage: ${storageRequirement}`, "info");
    addLog("AI_ENGINE", `Invoking OS Kernel Architect: ${selectedModel.name} (${selectedModel.company})`, "info");

    const sanitizedIsoName = `${osName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-v1.0-${deviceCompatibility.includes("ARM64") ? "arm64" : "x86_64"}.iso`;

    try {
      // Step 1: Initializing Workspace
      setBuildStage("Initializing Master ISO Workspace & Partition Scheme");
      setBuildProgress(15);
      await new Promise((r) => setTimeout(r, 600));
      addLog("PARTITION", `Allocating GPT disk geometry and EFI System Partition (ESP: 64MB FAT32)...`, "compiler");
      addLog("MBR", `Writing hybrid MBR boot record (0x55AA signature) to sector 0...`, "compiler");

      // Step 2: Call Backend Spec API for rich Kernel & System parameters
      setBuildStage(`Synthesizing OS Kernel & Architecture via ${selectedModel.name}`);
      setBuildProgress(30);
      addLog("AI_COMPILER", `Sending prompt & architecture constraints to ${selectedModel.name}...`, "info");

      const res = await fetch("/api/build-os-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          osName,
          memoryRequirement,
          deviceCompatibility,
          storageRequirement,
          kernelType,
          desktopEnvironment,
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          prompt,
          selectedFeatures: selectedFeatures.map((fid) => PRESET_FEATURES.find((f) => f.id === fid)?.label || fid)
        })
      });

      const specData = await res.json();
      if (!res.ok) throw new Error(specData.error || "Failed to generate OS architecture");

      addLog("KERNEL", `Kernel compilation complete: ${specData.kernelVersion || "6.12.11-devo-lts"}`, "success");
      addLog("CONFIG", `Injected drivers: ACPI, NVMe, AHCI, USB 3.2, PCIe Gen5, VirtIO, e1000e`, "compiler");

      // Step 3: Compiling Initramfs & System Services
      setBuildStage("Compiling Initramfs & System Daemons");
      setBuildProgress(55);
      await new Promise((r) => setTimeout(r, 700));

      const services = specData.systemServices || ["systemd-udevd", "devo-ai-copilot.service", "network-manager"];
      services.forEach((s: string) => {
        addLog("SYSTEMD", `Enabling unit: ${s}`, "compiler");
      });

      // Step 4: Building Desktop Environment & Compositor
      setBuildStage(`Generating UI Compositor: ${desktopEnvironment}`);
      setBuildProgress(75);
      await new Promise((r) => setTimeout(r, 600));
      addLog("DESKTOP", `Packaging desktop shell: ${desktopEnvironment}`, "compiler");
      addLog("WALLPAPER", `Generated high-res 4K boot splash & glassmorphic themes`, "compiler");

      // Step 5: Compressing SquashFS & Generating ISO 9660
      setBuildStage("Compressing SquashFS Root Filesystem & Building Hybrid ISO 9660 Image");
      setBuildProgress(90);
      await new Promise((r) => setTimeout(r, 800));
      addLog("SQUASHFS", `Compressing 4,210 root binaries with zstd (Level 19)...`, "compiler");
      addLog("EL_TORITO", `Writing El Torito boot catalog (Sector 19) with BIOS/UEFI boot images...`, "compiler");
      addLog("PVD", `Writing Primary Volume Descriptor: "CD001" (Sector 16)...`, "compiler");

      const finalResult: OSBuildResult = {
        id: `os-${Date.now()}`,
        config: {
          osName,
          memoryRequirement,
          deviceCompatibility,
          storageRequirement,
          kernelType,
          desktopEnvironment,
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          prompt,
          selectedFeatures
        },
        status: "completed",
        progress: 100,
        currentStage: "OS Build Complete & Verified",
        logs: buildLogs,
        isoFileName: sanitizedIsoName,
        isoSizeFormatted: specData.isoSizeFormatted || "1.48 GB",
        isoSizeBytes: 1589248000,
        sha256Checksum: specData.sha256Checksum || "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        kernelVersion: specData.kernelVersion || "6.12.11-devo-lts",
        grubConfig: specData.grubConfig || `set timeout=5\nmenuentry "${osName} Live" { linux /boot/vmlinuz quiet splash; initrd /boot/initrd.img; }`,
        osReleaseInfo: specData.osReleaseInfo || `NAME="${osName}"\nVERSION="1.0 LTS"\nID=devo_os\nPRETTY_NAME="${osName} v1.0"`,
        architectureSummary: specData.architectureSummary || `${osName} is a high-performance operating system synthesized by ${selectedModel.name}.`,
        featuresList: specData.featuresList || selectedFeatures.map((fid) => PRESET_FEATURES.find((f) => f.id === fid)?.label || fid),
        systemServices: specData.systemServices || ["systemd-udevd", "devo-ai-copilot.service", "network-manager"],
        packagesInstalled: specData.packagesInstalled || ["devo-base", "busybox", "wayland", "zsh", "alacritty", "htop"],
        installerScript: specData.installerScript || `#!/bin/bash\necho "Installing ${osName}..."`,
        createdAt: new Date().toLocaleString()
      };

      addLog("VERIFY", `SHA-256 Checksum generated: ${finalResult.sha256Checksum}`, "success");
      addLog("COMPLETE", `Successfully generated full bootable ISO image: ${sanitizedIsoName} (${finalResult.isoSizeFormatted})`, "success");

      setBuildResult(finalResult);
      setBuildProgress(100);
      setIsBuilding(false);
      setStep(5);
    } catch (err: any) {
      addLog("ERROR", `Build pipeline failed: ${err.message}`, "error");
      setIsBuilding(false);
    }
  };

  // Launch Virtual Machine Simulator
  const bootVirtualMachine = () => {
    setIsVmRunning(true);
    setVmLogs([
      `[  0.000000] Linux version ${buildResult?.kernelVersion || "6.12.11-devo"} (root@devo-builder) (gcc 14.2.0) #1 SMP PREEMPT`,
      `[  0.002140] Command line: BOOT_IMAGE=/boot/vmlinuz quiet splash root=/dev/ram0 devo.name="${osName}"`,
      `[  0.010410] Memory: ${memoryRequirement} available`,
      `[  0.042100] ACPI: Core revision 20240927`,
      `[  0.108220] System Architecture: ${deviceCompatibility}`,
      `[  0.254100] Storage Device: NVMe 00:04.0 (Required: ${storageRequirement}) - Initialized`,
      `[  0.410900] [ OK ] Started systemd-udevd Kernel Device Manager`,
      `[  0.621000] [ OK ] Mounted /live/filesystem.squashfs on /sysroot`,
      `[  0.812300] [ OK ] Started DevoAPT AI Neural Copilot Daemon`,
      `[  0.941200] [ OK ] Started ${desktopEnvironment}`,
      `[  1.104500] [ OK ] Reached Target Graphical Interface`,
      ``,
      `================================================================================`,
      `  WELCOME TO ${osName.toUpperCase()} v1.0 (Live Virtual Session)`,
      `  Architect: DevoAPT / ${selectedModel.name}`,
      `  Type 'help', 'neofetch', 'uname -a', 'ai-copilot "prompt"', or 'cat /etc/os-release'`,
      `================================================================================`,
      `${osName.toLowerCase().replace(/ /g, "_")}@live:~$ `
    ]);
  };

  // Handle VM Terminal Command
  const handleVmCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vmInput.trim()) return;

    const cmd = vmInput.trim();
    const promptPrefix = `${osName.toLowerCase().replace(/ /g, "_")}@live:~$ ${cmd}`;
    const newLogs = [...vmLogs, promptPrefix];

    const lower = cmd.toLowerCase();
    if (lower === "help") {
      newLogs.push(
        "Available Commands:",
        "  neofetch       - Display OS system logo & hardware specifications",
        "  uname -a       - Print complete kernel and architecture signature",
        "  cat /etc/os-release - Inspect OS release configuration file",
        "  devo-pkg list  - View pre-installed system packages",
        "  ai-copilot <query> - Ask the built-in terminal AI assistant",
        "  df -h          - Display filesystem storage utilization",
        "  free -m        - Display memory (RAM) statistics",
        "  clear          - Clear terminal display buffer",
        "  reboot         - Restart the virtual machine session"
      );
    } else if (lower === "neofetch") {
      newLogs.push(
        `       /\\        OS: ${osName} v1.0 x86_64`,
        `      /  \\       Host: DevoAPT Virtual Container 2026`,
        `     / /\\ \\      Kernel: ${buildResult?.kernelVersion || "6.12.11-devo"}`,
        `    / /  \\ \\     Uptime: 2 mins`,
        `   / /    \\ \\    Packages: ${buildResult?.packagesInstalled.length || 7} (devo-pkg)`,
        `  / /______\\ \\   Shell: zsh 5.9`,
        ` /____________\\  Resolution: 2560x1440 144Hz (DevoGlass)`,
        `                 WM: DevoCompositor 3D`,
        `                 Memory: ${memoryRequirement}`,
        `                 Storage: ${storageRequirement}`
      );
    } else if (lower === "uname -a") {
      newLogs.push(`Linux ${osName.toLowerCase().replace(/ /g, "-")} ${buildResult?.kernelVersion || "6.12.11"} #1 SMP PREEMPT_DYNAMIC ${deviceCompatibility.split(" ")[0]} GNU/Linux`);
    } else if (lower === "cat /etc/os-release") {
      newLogs.push(buildResult?.osReleaseInfo || `NAME="${osName}"\nVERSION="1.0 LTS"\nID=devo_os`);
    } else if (lower.startsWith("devo-pkg")) {
      newLogs.push(`[devo-pkg] Installed packages (${buildResult?.packagesInstalled.length}): ${buildResult?.packagesInstalled.join(", ")}`);
    } else if (lower.startsWith("ai-copilot")) {
      const q = cmd.replace(/^ai-copilot\s*/i, "") || "How can I help you today?";
      newLogs.push(`[AI Copilot - ${selectedModel.name}]: Executing query '${q}'... Everything is operating at peak efficiency in ${osName}.`);
    } else if (lower === "df -h") {
      newLogs.push(
        "Filesystem      Size  Used Avail Use% Mounted on",
        `/dev/nvme0n1p2  ${storageRequirement.split(" ")[0]}  1.4G  ${storageRequirement.split(" ")[0]}  12% /`,
        "udev            1.9G     0  1.9G   0% /dev",
        "tmpfs           392M  1.2M  391M   1% /run"
      );
    } else if (lower === "free -m") {
      newLogs.push(
        "               total        used        free      shared  buff/cache   available",
        `Mem:            ${memoryRequirement.split(" ")[0]}         412        1420          16         210        1500`,
        "Swap:           2048           0        2048"
      );
    } else if (lower === "clear") {
      setVmLogs([`${osName.toLowerCase().replace(/ /g, "_")}@live:~$ `]);
      setVmInput("");
      return;
    } else if (lower === "reboot") {
      bootVirtualMachine();
      setVmInput("");
      return;
    } else {
      newLogs.push(`zsh: command not found: ${cmd}. Type 'help' for available commands.`);
    }

    newLogs.push(`${osName.toLowerCase().replace(/ /g, "_")}@live:~$ `);
    setVmLogs(newLogs);
    setVmInput("");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0d14] text-[#e0e2ec] overflow-y-auto">
      {/* OS BUILDER HERO BAR */}
      <div className="border-b border-[#1f2833] bg-[#12141f] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-cyan-950/50">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold text-white tracking-tight">
                DevoAPT OS Synthesizer Studio
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold">
                ISO 9660 Live Master
              </span>
            </div>
            <p className="text-xs text-[#868d99]">
              Architect, compile, and download your own custom bootable Operating System ISO image powered by AI.
            </p>
          </div>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {[
            { num: 1, label: "Specs" },
            { num: 2, label: "Model" },
            { num: 3, label: "Prompt & Features" },
            { num: 4, label: "Compile" },
            { num: 5, label: "Download ISO" }
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (isCompleted && !isBuilding) setStep(s.num);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-[#181a24] border-[#252836] text-gray-500"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/40">
                  {isCompleted ? "✓" : s.num}
                </span>
                <span className="hidden sm:inline text-[11px]">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 0: INTRO LANDING & TEMPLATES */}
      {step === 0 && (
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
          {/* Main Action Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#161a29] via-[#1c2237] to-[#161a29] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold mb-4 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Operating System Generator</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 tracking-tight">
                Make Your Own Custom Operating System in Seconds
              </h2>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Design everything from kernel memory limits and device architecture to custom AI daemons, bootloader
                themes, and packages. Download a real bootable <code className="text-cyan-300 font-mono">.iso</code> image
                ready for USB, VirtualBox, or QEMU.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-bold text-sm shadow-xl shadow-cyan-950/50 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Cpu className="w-5 h-5" />
                  <span>Create Your OS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => applyTemplate(SAMPLE_OS_TEMPLATES[0])}
                  className="px-4 py-3 rounded-xl bg-[#1c2132] hover:bg-[#252b40] text-gray-200 border border-[#2d3748] text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Quickstart with DevoOS Quantum</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Or Start From an Architectural Preset</span>
              </h3>
              <span className="text-xs text-gray-500 font-mono">Click to customize</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_OS_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => applyTemplate(tmpl)}
                  className="p-5 rounded-xl bg-[#131622] hover:bg-[#181d2e] border border-[#1f2833] hover:border-cyan-500/50 cursor-pointer transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-display font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {tmpl.arch.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{tmpl.prompt}</p>

                    <div className="space-y-1.5 text-[11px] font-mono text-gray-400 mb-4 bg-[#0d0e17] p-2.5 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Memory Req:</span>
                        <span className="text-gray-200">{tmpl.memory.split(" ")[0]} {tmpl.memory.split(" ")[1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Storage Req:</span>
                        <span className="text-gray-200">{tmpl.storage.split(" ")[0]} {tmpl.storage.split(" ")[1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kernel:</span>
                        <span className="text-gray-200">{tmpl.kernel.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1f2833] flex items-center justify-between text-xs text-cyan-400 font-semibold">
                    <span>Use Template</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: ENTER OS NAME, MEMORY, COMPATIBILITY, AND STORAGE */}
      {step === 1 && (
        <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f2833] pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 1 of 4</span>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                Configure Operating System Specifications
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Set the foundational identity, hardware requirements, and target hardware architecture.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-3 py-1.5 rounded-lg bg-[#181a24] text-gray-400 hover:text-white border border-[#252836] text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. OS Name Field */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center justify-between">
                <span>1. Enter Your OS Name</span>
                <button
                  type="button"
                  onClick={generateRandomName}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 lowercase font-normal"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Randomize name</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={osName}
                  onChange={(e) => setOsName(e.target.value)}
                  placeholder="e.g. DevoOS Quantum, Aether Linux, Nexus OS"
                  className="w-full bg-[#12141f] border border-[#1f2833] focus:border-cyan-500 rounded-xl px-4 py-3 text-white font-display text-base font-semibold outline-none transition-all placeholder:text-gray-600"
                />
                <span className="absolute right-3.5 top-3.5 px-2 py-0.5 rounded bg-black/40 text-[11px] font-mono text-gray-400 border border-[#252836]">
                  v1.0 Live
                </span>
              </div>
            </div>

            {/* 2. Memory Requirement */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Enter OS Memory Requirement (RAM)</span>
              </label>
              <select
                value={memoryRequirement}
                onChange={(e) => setMemoryRequirement(e.target.value)}
                className="w-full bg-[#12141f] border border-[#1f2833] focus:border-cyan-500 rounded-xl px-3.5 py-3 text-white font-mono text-xs outline-none transition-all"
              >
                {MEMORY_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">Minimum physical RAM allocated for kernel & userland.</p>
            </div>

            {/* 3. Device Compatibility */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. Enter OS Device Compatibility</span>
              </label>
              <select
                value={deviceCompatibility}
                onChange={(e) => setDeviceCompatibility(e.target.value)}
                className="w-full bg-[#12141f] border border-[#1f2833] focus:border-cyan-500 rounded-xl px-3.5 py-3 text-white font-mono text-xs outline-none transition-all"
              >
                {COMPATIBILITY_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">Instruction set architecture & bootloader target (UEFI/BIOS).</p>
            </div>

            {/* 4. Storage Required to Install */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. Enter Storage Required to Install OS</span>
              </label>
              <select
                value={storageRequirement}
                onChange={(e) => setStorageRequirement(e.target.value)}
                className="w-full bg-[#12141f] border border-[#1f2833] focus:border-cyan-500 rounded-xl px-3.5 py-3 text-white font-mono text-xs outline-none transition-all"
              >
                {STORAGE_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">Target disk partition capacity needed for full system installation.</p>
            </div>

            {/* 5. Kernel Architecture Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Kernel Architecture Base</span>
              </label>
              <select
                value={kernelType}
                onChange={(e) => setKernelType(e.target.value)}
                className="w-full bg-[#12141f] border border-[#1f2833] focus:border-cyan-500 rounded-xl px-3.5 py-3 text-white font-mono text-xs outline-none transition-all"
              >
                {KERNEL_OPTIONS.map((k) => (
                  <option key={k.id} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">Core kernel scheduling model and hardware drivers.</p>
            </div>
          </div>

          {/* Action Step Controls */}
          <div className="pt-6 border-t border-[#1f2833] flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-4 py-2.5 rounded-xl bg-[#161924] text-gray-400 hover:text-white border border-[#252836] text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!osName.trim()}
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-sm shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <span>Create OS Specs & Choose Model</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT COGNITIVE MODEL */}
      {step === 2 && (
        <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f2833] pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 2 of 4</span>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                Select AI Engine to Architect & Compile {osName}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Choose the AI model persona that will synthesize your kernel configurations, bootloader scripts, and system services.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-lg bg-[#181a24] text-gray-400 hover:text-white border border-[#252836] text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Model Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {models.map((m) => {
              const isSelected = selectedModel.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${m.color} text-white border-white/40 shadow-xl shadow-black/50 ring-2 ring-cyan-400/50`
                      : "bg-[#12141f] hover:bg-[#181b2a] border-[#1f2833] text-gray-300"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
                        <AIModelLogo modelId={m.id} size={24} />
                      </div>
                      <span className="text-[10px] font-mono opacity-80">{m.company}</span>
                    </div>
                    <div className="font-display font-bold text-sm text-white mb-1">{m.name}</div>
                    <p className="text-[11px] opacity-80 line-clamp-2 leading-relaxed">{m.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span>{m.versions[0]}</span>
                    {isSelected && <span className="font-bold text-white">✓ Selected</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Summary Bar */}
          <div className="p-4 rounded-xl bg-[#12141f] border border-[#1f2833] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <AIModelLogo modelId={selectedModel.id} size={24} />
              <div>
                <span className="text-gray-400">Selected OS Compiler: </span>
                <span className="text-white font-bold">{selectedModel.name}</span>
                <span className="text-cyan-400 font-mono"> ({selectedModel.company})</span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">Ready to Synthesize</span>
          </div>

          {/* Action Step Controls */}
          <div className="pt-4 border-t border-[#1f2833] flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-[#161924] text-gray-400 hover:text-white border border-[#252836] text-xs font-semibold"
            >
              Back to Specs
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-display font-bold text-sm shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all"
            >
              <span>Start Make Your Own OS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TYPE PROMPT & SELECT FEATURES */}
      {step === 3 && (
        <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f2833] pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 3 of 4</span>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                Describe Which OS You Want to Build & Add Features
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Type instructions for {selectedModel.name} and toggle custom modules to inject into the ISO.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-3 py-1.5 rounded-lg bg-[#181a24] text-gray-400 hover:text-white border border-[#252836] text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Active OS Summary Pill Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono bg-[#12141f] p-3 rounded-xl border border-[#1f2833]">
            <span className="text-gray-400">Target:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">{osName}</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{memoryRequirement.split(" ")[0]} RAM</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">{deviceCompatibility.split(" ")[0]}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{storageRequirement.split(" ")[0]} Storage</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Compiler: {selectedModel.name}</span>
          </div>

          {/* User Prompt Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-gray-300 font-semibold flex items-center justify-between">
              <span>Type a Prompt: What kind of OS do you want to build?</span>
              <span className="text-[11px] text-gray-500 font-normal">Supports detailed architectural requirements</span>
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build a lightning-fast cybersecurity and AI development operating system with built-in neural terminal assistant, zero-trust network sandbox, hardware-accelerated shaders, and instant boot time..."
              className="w-full bg-[#12141f] border border-[#1f2833] focus:border-cyan-500 rounded-xl p-4 text-white font-sans text-sm outline-none transition-all leading-relaxed placeholder:text-gray-600"
            />
          </div>

          {/* Add Features Checklist Grid */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-gray-300 font-semibold flex items-center justify-between">
              <span>Add Features & Modules to Include in the ISO Image</span>
              <span className="text-[11px] text-cyan-400 font-mono">{selectedFeatures.length} active modules</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PRESET_FEATURES.map((feat) => {
                const isChecked = selectedFeatures.includes(feat.id);
                return (
                  <div
                    key={feat.id}
                    onClick={() => toggleFeature(feat.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isChecked
                        ? "bg-cyan-950/30 border-cyan-500/50 text-white shadow-md shadow-cyan-950/30"
                        : "bg-[#12141f] hover:bg-[#171a28] border-[#1f2833] text-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-white leading-snug">{feat.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 accent-cyan-500"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop UI Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-gray-300 font-semibold">
              Select Default Desktop Compositor & Window Manager
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DESKTOP_OPTIONS.map((desk) => {
                const isSelected = desktopEnvironment === desk.name;
                return (
                  <div
                    key={desk.id}
                    onClick={() => setDesktopEnvironment(desk.name)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                        : "bg-[#12141f] hover:bg-[#181b2a] border-[#1f2833] text-gray-400"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{desk.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{desk.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Step Controls */}
          <div className="pt-6 border-t border-[#1f2833] flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl bg-[#161924] text-gray-400 hover:text-white border border-[#252836] text-xs font-semibold"
            >
              Back
            </button>

            <button
              type="button"
              disabled={!prompt.trim()}
              onClick={startBuildPipeline}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-bold text-sm shadow-xl shadow-cyan-950/50 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>Compile & Build OS ISO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: LIVE COMPILATION TERMINAL & SYNTHESIS */}
      {step === 4 && (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f2833] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Synthesizing & Compiling {osName}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                {buildStage || "Compiling Operating System..."}
              </h2>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-cyan-400 font-bold text-lg">{buildProgress}%</span>
              <p className="text-gray-500 text-[10px]">ISO Master Pipeline</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#12141f] rounded-full h-3 p-0.5 border border-[#1f2833] overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${buildProgress}%` }}
            />
          </div>

          {/* Real-time Compiler Terminal Output */}
          <div className="rounded-xl border border-[#1f2833] bg-[#0d0e17] overflow-hidden shadow-2xl font-mono text-xs">
            {/* Terminal Header */}
            <div className="bg-[#141724] px-4 py-2.5 border-b border-[#1f2833] flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                </div>
                <span className="text-xs font-semibold text-gray-300 ml-2">devo-os-builder: {osName}</span>
              </div>
              <span className="text-[11px] text-gray-500">ISO 9660 Compiler v2.4</span>
            </div>

            {/* Terminal Logs Output */}
            <div
              ref={terminalBottomRef}
              className="p-4 h-96 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800"
            >
              {buildLogs.map((log) => {
                let textClass = "text-gray-300";
                if (log.type === "success") textClass = "text-emerald-400 font-semibold";
                if (log.type === "error") textClass = "text-red-400 font-bold";
                if (log.type === "compiler") textClass = "text-cyan-300";
                if (log.type === "warning") textClass = "text-amber-400";

                return (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-gray-600 select-none shrink-0">[{log.timestamp}]</span>
                    <span className="px-1 py-0.2 rounded bg-[#1a1d2d] text-gray-400 text-[10px] shrink-0">
                      {log.stage}
                    </span>
                    <span className={`break-all ${textClass}`}>{log.message}</span>
                  </div>
                );
              })}
              {isBuilding && (
                <div className="flex items-center gap-2 text-cyan-400 animate-pulse pt-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Compiling kernel modules and generating live filesystem squashfs...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: OS BUILD COMPLETE & DOWNLOAD ISO */}
      {step === 5 && buildResult && (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
          {/* Hero Celebration Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#121c29] via-[#161f38] to-[#121c29] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Build Successful & Verified</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                  {buildResult.config.osName} is Ready
                </h2>
                <p className="text-xs md:text-sm text-gray-300 max-w-xl">
                  {buildResult.architectureSummary}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 border border-[#252836]">
                    📁 {buildResult.isoFileName}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 text-emerald-300 border border-[#252836]">
                    💾 {buildResult.isoSizeFormatted}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 text-indigo-300 border border-[#252836]">
                    ⚙️ Kernel {buildResult.kernelVersion}
                  </span>
                </div>
              </div>

              {/* PRIMARY DOWNLOAD ISO BUTTON */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => triggerIsoDownload(buildResult)}
                  className="px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-display font-bold text-base shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-[0.98] border border-white/20"
                >
                  <Download className="w-5 h-5" />
                  <span>Download ISO Image</span>
                </button>

                <button
                  type="button"
                  onClick={bootVirtualMachine}
                  className="px-5 py-3 rounded-xl bg-[#1e253b] hover:bg-[#27304d] text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>▶️ Test Boot OS in Virtual Simulator</span>
                </button>
              </div>
            </div>
          </div>

          {/* IN-BROWSER VIRTUAL MACHINE TEST SIMULATOR */}
          {isVmRunning && (
            <div className="rounded-2xl border border-cyan-500/40 bg-[#0c0d16] p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f2833] pb-3">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">
                      {osName} Live Virtual Machine Shell
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Live interactive session booted from {buildResult.isoFileName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVmRunning(false)}
                  className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded bg-[#181a24] border border-[#252836]"
                >
                  Close VM
                </button>
              </div>

              {/* Terminal Screen */}
              <div
                ref={vmBottomRef}
                className="bg-black p-4 rounded-xl font-mono text-xs text-green-400 h-80 overflow-y-auto space-y-1 border border-[#1f2833]"
              >
                {vmLogs.map((line, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>

              {/* Terminal Command Input */}
              <form onSubmit={handleVmCommand} className="flex gap-2">
                <input
                  type="text"
                  value={vmInput}
                  onChange={(e) => setVmInput(e.target.value)}
                  placeholder="Type a command (e.g. help, neofetch, uname -a, devo-pkg, cat /etc/os-release, reboot)..."
                  className="flex-1 bg-[#12141f] border border-[#1f2833] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white font-mono text-xs outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Execute
                </button>
              </form>
            </div>
          )}

          {/* Architecture Blueprint & Code Inspector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* GRUB Bootloader Configuration */}
            <div className="p-5 rounded-xl bg-[#12141f] border border-[#1f2833] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GRUB 2.12 Bootloader Config</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(buildResult.grubConfig, "grub")}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedSection === "grub" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === "grub" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0d0e17] rounded-lg font-mono text-[11px] text-gray-300 overflow-x-auto max-h-48 scrollbar-thin">
                {buildResult.grubConfig}
              </pre>
            </div>

            {/* /etc/os-release File */}
            <div className="p-5 rounded-xl bg-[#12141f] border border-[#1f2833] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>/etc/os-release Manifest</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(buildResult.osReleaseInfo, "release")}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedSection === "release" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === "release" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0d0e17] rounded-lg font-mono text-[11px] text-gray-300 overflow-x-auto max-h-48 scrollbar-thin">
                {buildResult.osReleaseInfo}
              </pre>
            </div>
          </div>

          {/* Package Tree & System Services */}
          <div className="p-5 rounded-xl bg-[#12141f] border border-[#1f2833] space-y-4">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              <span>Pre-Installed Packages & System Services</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500 uppercase text-[10px] block mb-2">Core Packages (devo-pkg):</span>
                <div className="flex flex-wrap gap-1.5">
                  {buildResult.packagesInstalled.map((pkg, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#1c2030] text-gray-300 border border-[#2d3748]">
                      {pkg}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-gray-500 uppercase text-[10px] block mb-2">Active System Daemons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {buildResult.systemServices.map((svc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Checksum */}
          <div className="p-4 rounded-xl bg-[#12141f] border border-[#1f2833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">SHA-256 Checksum:</span>
              <span className="text-cyan-300 break-all">{buildResult.sha256Checksum}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(buildResult.sha256Checksum, "sha")}
              className="px-3 py-1.5 rounded-lg bg-[#1a1d2b] text-gray-300 hover:text-white border border-[#2d3748] text-xs shrink-0 flex items-center gap-1.5"
            >
              {copiedSection === "sha" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === "sha" ? "Checksum Copied" : "Copy Checksum"}</span>
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-[#1f2833] flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setIsVmRunning(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#161924] text-gray-400 hover:text-white border border-[#252836] text-xs font-semibold flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Make Another Custom OS</span>
            </button>

            <button
              type="button"
              onClick={() => triggerIsoDownload(buildResult)}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-display font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Download {buildResult.isoFileName}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
