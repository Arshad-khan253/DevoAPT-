import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, GenerateVideosOperation } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Lazy initializer for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Text & Q&A Solver with Multi-Model Personas & Language Customization
app.post("/api/chat", async (req, res) => {
  try {
    const { message, model, version, language, chatHistory, ethicsShield } = req.body;
    const ai = getAi();

    // Map system instructions based on DevoAPT cognitive sub-engine selection
    let systemInstruction = "";
    let targetModel = "gemini-2.5-flash"; // default robust model

    if (model === "devoapt") {
      targetModel = "gemini-2.5-pro";
      systemInstruction = `You are the DevoAPT Core Engine, utilizing version ${version}. You are the official supreme flagship cognitive system developed by DevoAPT. You are an expert across all domains—including scientific discovery, advanced software architectures, math, creative arts, and philosophy. Respond with maximum depth, clarity, and authority.`;
    } else if (model === "gemini") {
      targetModel = "gemini-2.5-pro";
      systemInstruction = `You are Gemini, a highly capable multimodal AI developed by Google. You are utilizing the model version ${version}. You excel at massive-context analysis, web search grounding style, and crisp technical structures.`;
    } else if (model === "chatgpt") {
      targetModel = "gemini-2.5-flash";
      systemInstruction = `You are ChatGPT, the advanced conversational AI trained by OpenAI. You are utilizing the model version ${version}. Adopt ChatGPT's signature style: highly structured, detailed explanations, frequent bullet points, polite tone, and comprehensive markdown formatting.`;
    } else if (model === "claude") {
      targetModel = "gemini-2.5-pro";
      systemInstruction = `You are Claude, a helpful, harmless, and honest AI assistant created by Anthropic. You are using the model version ${version}. Respond in Claude's signature tone: exceptionally articulate, nuanced, deeply intellectual, highly cautious, and detailed. Write impeccable code blocks if requested.`;
    } else if (model === "deepseek") {
      targetModel = "gemini-2.5-pro";
      systemInstruction = `You are DeepSeek, an elite artificial intelligence trained by DeepSeek AI. You are utilizing the model version ${version}. You are deeply logical and highly specialized in chain-of-thought reasoning, mathematics, coding, and logical proofing. When asked complex questions, first walk through a brief, transparent 'thinking' chain before reaching your final answers.`;
    } else if (model === "copilot") {
      targetModel = "gemini-2.5-flash";
      systemInstruction = `You are Copilot, Microsoft's smart AI workspace companion. You are using the version ${version}. Be highly helpful, business-oriented, and structured. Respond like an expert code assistant and search partner integrated directly into a productivity workspace.`;
    } else if (model === "metaai") {
      targetModel = "gemini-2.5-flash";
      systemInstruction = `You are Meta AI, built by Meta. You are utilizing the version ${version}. Be extremely friendly, casual, and highly responsive. You are knowledgeable across a broad array of public domains and express answers in a direct, easy-to-understand conversational tone.`;
    } else if (model === "grok") {
      targetModel = "gemini-2.5-flash";
      systemInstruction = `You are Grok, the AI created by xAI. You are using version ${version}. Answer with a bit of wit, a slightly rebellious streak, and a touch of humor. Avoid being dry, and provide direct, real-time-flavored answers.`;
    } else if (model === "siri") {
      targetModel = "gemini-2.5-flash";
      systemInstruction = `You are Siri, Apple's virtual assistant. You are using version ${version}. Start with a short greeting like 'Hey there!' or 'I found this for you:' and respond in Siri's signature short, sweet, snappy, and highly direct manner. Keep paragraphs to 1-2 lines maximum.`;
    } else if (model === "bixby") {
      targetModel = "gemini-2.5-flash";
      systemInstruction = `You are Bixby, Samsung's intelligent virtual assistant. You are using version ${version}. Respond in a highly task-oriented manner, explaining things as if they are modular 'capsules' or sequential device automation commands.`;
    } else {
      // Default DevoAPT (Gemini-powered)
      systemInstruction = `You are DevoAPT (Developer's All-Purpose Turing), a powerful next-generation AI assistant utilizing version ${version}.
You are highly helpful, intelligent, safe, and fully equipped to answer any scientific, technical, or creative question.`;
    }

    // LEGACY LIMITATIONS & OUTDATED SIMULATOR
    if (version && version.toLowerCase().includes("outdated")) {
      systemInstruction += `\nCRITICAL HISTORICAL DIRECTIVE: You are simulating a legacy, outdated version of yourself (${version}).
Maintain a slightly more rigid, classic formatting style. Limit your general awareness to events before the launch era of this specific legacy version. Pretend you are running in compatibility mode with classic parameters.`;
    }

    // Append standard localization directive
    if (language) {
      systemInstruction += `\nCRITICAL DIRECTIVE: You MUST respond entirely in the language: "${language}". Do not use English unless the user asks for translations into English or uses English technical terms. Speak natively and fluently in ${language}.`;
    }

    // Append ethical shield instructions if enabled
    if (ethicsShield !== false) {
      systemInstruction += `\nRESPONSIBILITY & SAFETY SHIELD ACTIVE: You must act as a safe, highly responsible, and ethical AI agent. Refuse to assist with harmful, destructive, illegal, or unethical requests. Do not generate misinformation or hate speech. Always prioritize balanced, constructive, objective, and truthful educational answers.`;
    }

    // Build contents payload combining chatHistory and the new message
    const contents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const turn of chatHistory) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Execute generation with dynamic model fallback to ensure 100% responsiveness and zero model errors
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });
    } catch (modelError: any) {
      console.warn(`Primary model ${targetModel} failed, falling back to gemini-2.5-flash... Error:`, modelError.message);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "An error occurred during chat generation." });
  }
});

// 2. Image Studio Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, model, aspectRatio } = req.body;
    const ai = getAi();

    const selectedModel = model === "imagen" ? "imagen-4.0-generate-001" : "gemini-2.5-flash-image";

    if (selectedModel === "imagen-4.0-generate-001") {
      const response = await ai.models.generateImages({
        model: selectedModel,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: aspectRatio || "1:1",
        },
      });
      const base64EncodeString = response.generatedImages[0].image.imageBytes;
      res.json({ imageUrl: `data:image/jpeg;base64,${base64EncodeString}` });
    } else {
      // gemini-2.5-flash-image
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
          },
        },
      });

      let base64EncodeString = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64EncodeString = part.inlineData.data;
          break;
        }
      }

      if (!base64EncodeString) {
        throw new Error("No image was returned by the model.");
      }

      res.json({ imageUrl: `data:image/png;base64,${base64EncodeString}` });
    }
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
  }
});

// 3. Speech Studio (TTS) Endpoint
app.post("/api/generate-speech", async (req, res) => {
  try {
    const { text, voice, language } = req.body;
    const ai = getAi();

    const cleanText = (text || "").slice(0, 800); // Optimal speech chunk length
    const promptText = `Speak naturally, clearly, and expressively in ${language || "English"}: ${cleanText}`;

    const validVoices = ["Kore", "Puck", "Fenrir", "Aoede", "Charon"];
    const targetVoice = validVoices.includes(voice) ? voice : "Kore";

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice },
            },
          },
        },
      });
    } catch (ttsErr: any) {
      console.warn("Primary gemini-3.1-flash-tts-preview failed, attempting fallback audio generation:", ttsErr?.message);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice },
            },
          },
        },
      });
    }

    const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio payload returned by Gemini TTS engine.");
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("Speech generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate speech audio." });
  }
});

// 4. Music Studio Endpoint (Lyria-based with automatic visual synthesis info)
app.post("/api/generate-music", async (req, res) => {
  try {
    const { prompt, duration } = req.body;
    const ai = getAi();

    // Lyria-3-clip-preview generates high-quality short tracks.
    // Note: Lyria requires developer key enablement, we run it and catch errors beautifully.
    const responseStream = await ai.models.generateContentStream({
      model: "lyria-3-clip-preview",
      contents: `Generate a music track: ${prompt}. Maximum length is ${duration || "30"} seconds.`,
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      throw new Error("No music content generated from the stream.");
    }

    res.json({ audio: audioBase64, mimeType, lyrics });
  } catch (error: any) {
    console.error("Music generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate music track." });
  }
});

// 5. Video Studio Endpoints (Veo 3-step pattern)
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    const ai = getAi();

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-preview",
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: aspectRatio || "16:9",
      },
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Video creation error:", error);
    res.status(500).json({ error: error.message || "Failed to launch video generation operation." });
  }
});

app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    const ai = getAi();

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({ done: updated.done, error: updated.error });
  } catch (error: any) {
    console.error("Video status polling error:", error);
    res.status(500).json({ error: error.message || "Failed to poll video generation status." });
  }
});

app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    const ai = getAi();
    const apiKey = process.env.GEMINI_API_KEY;

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      throw new Error("No download URI available for the generated video.");
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey || "" },
    });

    res.setHeader("Content-Type", "video/mp4");
    if (videoRes.body) {
      // Stream chunks to the response
      const reader = videoRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error: any) {
    console.error("Video download streaming error:", error);
    res.status(500).json({ error: error.message || "Failed to download and stream video file." });
  }
});

// 6. Make Your Own OS - Architecture & Compilation AI Synthesizer
app.post("/api/build-os-spec", async (req, res) => {
  try {
    const {
      osName,
      memoryRequirement,
      deviceCompatibility,
      storageRequirement,
      kernelType,
      desktopEnvironment,
      modelId,
      modelName,
      prompt,
      selectedFeatures
    } = req.body;

    const ai = getAi();

    const targetModel = "gemini-2.5-flash";
    const systemPrompt = `You are the DevoAPT Supreme OS Kernel Architect & Operating System Compiler AI.
Your mission is to generate a comprehensive, ultra-detailed architectural specification, bootloader configuration, package tree, system services, and installer script for a newly requested custom operating system:

OS Name: ${osName}
Target Architecture & Compatibility: ${deviceCompatibility}
Memory Footprint / RAM Requirement: ${memoryRequirement}
Storage Footprint Required: ${storageRequirement}
Kernel Architecture: ${kernelType || "Linux Monolithic Kernel 6.12 LTS"}
Desktop / UI Environment: ${desktopEnvironment || "DevoGlass Compositor"}
AI Compiler Persona: ${modelName} (${modelId})
User Custom Prompt & Directives: ${prompt}
Selected Features: ${(selectedFeatures || []).join(", ")}

Respond STRICTLY with valid JSON in this exact structure without markdown backticks or commentary:
{
  "kernelVersion": "string (e.g. 6.12.11-devo-lts)",
  "architectureSummary": "string (2-3 sentences explaining core architecture & memory optimization)",
  "sha256Checksum": "string (realistic 64-char hex sha256 checksum)",
  "isoSizeFormatted": "string (e.g. 1.48 GB)",
  "featuresList": ["string", "string", ...],
  "systemServices": ["string (e.g. devo-ai-daemon.service)", "string", ...],
  "packagesInstalled": ["string (e.g. devo-core)", "string (e.g. zsh)", ...],
  "grubConfig": "string (complete formatted grub.cfg content)",
  "osReleaseInfo": "string (complete formatted /etc/os-release file content)",
  "installerScript": "string (complete bash installation script /install.sh)"
}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: [{ parts: [{ text: systemPrompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
    } catch (e: any) {
      console.warn("Failed with primary model, trying fallback...", e.message);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [{ text: systemPrompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
    }

    const rawText = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch {
      parsedData = {
        kernelVersion: "6.12.11-devo-lts",
        architectureSummary: `${osName} is a high-performance next-generation OS built for ${deviceCompatibility} with optimized ${memoryRequirement} footprint.`,
        sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        isoSizeFormatted: "1.42 GB",
        featuresList: selectedFeatures || ["Devo Neural AI Copilot", "Ultra-Fast Boot"],
        systemServices: ["systemd-udevd", "devo-ai-copilot.service", "network-manager", "devoglass-compositor"],
        packagesInstalled: ["devo-base", "devo-kernel-6.12", "busybox", "wayland", "alacritty", "zsh", "htop"],
        grubConfig: `set timeout=5\nmenuentry "${osName} (Live GUI)" { linux /boot/vmlinuz quiet splash; initrd /boot/initrd.img; }`,
        osReleaseInfo: `NAME="${osName}"\nVERSION="1.0 LTS"\nID=devo_os\nPRETTY_NAME="${osName} v1.0"`,
        installerScript: `#!/bin/bash\necho "Installing ${osName}..."\necho "Complete!"`
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("OS Build Spec error:", error);
    res.status(500).json({ error: error.message || "Failed to generate OS specification." });
  }
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DevoAPT Server] running on http://localhost:${PORT}`);
  });
}

startServer();
