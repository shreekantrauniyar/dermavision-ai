import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_dermavision";

// Initialize AI clients based on available API keys
let geminiAi: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

let openaiAi: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openaiAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Groq support via OpenAI-compatible client
let groqAi: OpenAI | null = null;
if (process.env.GROQ_API_KEY) {
  groqAi = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_INSTRUCTION = "You are an advanced dermatological analysis assistant. Examine the provided image and identify any potential skin condition, disease, or abnormality present. Your analysis should be comprehensive and cover any dermatological category. Pay special attention to how conditions present on diverse skin tones to ensure accuracy across all backgrounds. Provide an objective description of what you observe. IMPORTANT: This analysis is for informational and educational tracking purposes only and is not a clinical diagnosis. Respond ONLY with a valid JSON object matching this schema: { \"diseaseName\": string, \"confidence\": number (0.0 to 1.0), \"symptoms\": string[], \"causes\": string[], \"precautions\": string[], \"treatment\": string, \"aiExplanation\": string }. Do not include any pre-amble or post-amble text.";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // --- AUTHENTICATION ROUTES ---
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { password } = req.body;
      const email = req.body.email?.toLowerCase().trim();
      
      if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: "Invalid email or password too short." });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "Email already in use." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          isAdmin: email === "admin@dermavision.com",
        }
      });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ uid: user.id, email: user.email, isAdmin: user.isAdmin });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { password } = req.body;
      const email = req.body.email?.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: "Invalid credentials." });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: "Invalid credentials." });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ uid: user.id, email: user.email, isAdmin: user.isAdmin });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.delete("/api/auth/delete-account", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      await prisma.user.delete({ where: { id: decoded.id } });
      res.clearCookie('token');
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(401).json({ error: "User not found" });
      res.json({ uid: user.id, email: user.email, isAdmin: user.isAdmin });
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });
  
  // Middleware to authenticate user for protected routes
  const authenticateUser = async (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
  
  // --- DATABASE ROUTES ---
  const safeParse = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  app.get("/api/scans", authenticateUser, async (req: any, res: any) => {
    try {
      const scans = await prisma.scan.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' }
      });
      const formatted = scans.map(s => ({
        ...s,
        symptoms: safeParse(s.symptoms),
        causes: safeParse(s.causes),
        precautions: safeParse(s.precautions),
      }));
      res.json(formatted);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/scans", authenticateUser, async (req: any, res: any) => {
    try {
      const data = req.body;
      const scan = await prisma.scan.create({
        data: {
          imageUrl: data.imageUrl,
          diseaseName: data.diseaseName,
          confidence: data.confidence,
          symptoms: JSON.stringify(data.symptoms || []),
          causes: JSON.stringify(data.causes || []),
          precautions: JSON.stringify(data.precautions || []),
          treatment: data.treatment,
          aiExplanation: data.aiExplanation,
          userId: req.userId
        }
      });
      res.json({
        ...scan,
        symptoms: safeParse(scan.symptoms),
        causes: safeParse(scan.causes),
        precautions: safeParse(scan.precautions),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.delete("/api/scans/:id", authenticateUser, async (req: any, res: any) => {
    try {
      await prisma.scan.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- ADMIN ROUTES ---
  const authenticateAdmin = async (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || !user.isAdmin) return res.status(403).json({ error: "Forbidden" });
      req.userId = user.id;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  app.get("/api/admin/users", authenticateAdmin, async (req: any, res: any) => {
    try {
      const users = await prisma.user.findMany({ select: { id: true, email: true, isAdmin: true, createdAt: true } });
      res.json(users.map(u => ({ uid: u.id, email: u.email, isAdmin: u.isAdmin })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get("/api/admin/scans", authenticateAdmin, async (req: any, res: any) => {
    try {
      const scans = await prisma.scan.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(scans.map(s => ({
        ...s,
        symptoms: safeParse(s.symptoms),
        causes: safeParse(s.causes),
        precautions: safeParse(s.precautions),
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.delete("/api/admin/users/:id", authenticateAdmin, async (req: any, res: any) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.delete("/api/admin/scans/:id", authenticateAdmin, async (req: any, res: any) => {
    try {
      await prisma.scan.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Endpoint: Analyze Skin
  app.post("/api/analyze-skin", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: "No image provided" });

      const mimeTypeMatch = image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64Data = image.split(",")[1];
      
      if (!geminiAi && !openaiAi && !groqAi) {
        return res.status(500).json({ error: "No AI API key is configured on the server. Please check your environment variables." });
      }

      console.log(`Analyzing image with mimeType: ${mimeType}`);

      let aiResponseText = "";

      if (groqAi && process.env.AI_PROVIDER === "groq") {
        // Use Groq (OpenAI-compatible)
        const response = await groqAi.chat.completions.create({
          model: GROQ_VISION_MODEL,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this skin condition based on the provided image and provide results in the requested JSON format." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      } else if (openaiAi && process.env.AI_PROVIDER === "openai") {
        // Use OpenAI if preferred
        const response = await openaiAi.chat.completions.create({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this skin condition based on the provided image and provide results in the requested JSON format." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      } else if (geminiAi) {
        // Default to Gemini
        const response = await geminiAi.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: "Analyze this skin condition based on the provided image and provide results in the requested JSON format.",
                },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                diseaseName: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                causes: { type: Type.ARRAY, items: { type: Type.STRING } },
                precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
                treatment: { type: Type.STRING },
                aiExplanation: { type: Type.STRING },
              },
              required: ["diseaseName", "confidence", "symptoms", "causes", "precautions", "treatment", "aiExplanation"],
            },
          },
        });
        aiResponseText = response.text || "";
      } else if (openaiAi) {
        // Fallback to OpenAI if Gemini isn't available but OpenAI is
        const response = await openaiAi.chat.completions.create({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this skin condition based on the provided image and provide results in the requested JSON format." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      } else if (groqAi) {
        // Fallback to Groq
        const response = await groqAi.chat.completions.create({
          model: GROQ_VISION_MODEL,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this skin condition based on the provided image and provide results in the requested JSON format." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      }

      if (!aiResponseText) {
        return res.status(500).json({ error: "Image analysis failed or was blocked by safety filters. Please try another image." });
      }

      let parsedData;
      try {
        parsedData = JSON.parse(aiResponseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "AI Raw Text:", aiResponseText);
        return res.status(500).json({ error: "The AI returned an invalid response format. Please try again." });
      }
      
      const safeData = {
        diseaseName: parsedData.diseaseName || "Unevaluated Condition",
        confidence: typeof parsedData.confidence === 'number' ? parsedData.confidence : 0,
        symptoms: Array.isArray(parsedData.symptoms) ? parsedData.symptoms : [],
        causes: Array.isArray(parsedData.causes) ? parsedData.causes : [],
        precautions: Array.isArray(parsedData.precautions) ? parsedData.precautions : [],
        treatment: parsedData.treatment || "Consult a dermatologist for professional advice.",
        aiExplanation: parsedData.aiExplanation || "Analysis completed by DermaVision AI."
      };
      
      res.json(safeData);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      const status = error.status || error.code || 500;
      const message = error.message || "Failed to analyze image";
      
      if (status === 429 || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "The AI service quota has been reached. Please wait a moment before trying again." });
      }
      if (status === 503 || message.includes("high demand")) {
        return res.status(503).json({ error: "The AI service is currently experiencing high demand. Please try again in a few seconds." });
      }
      res.status(500).json({ error: message });
    }
  });

  // AI Endpoint: Chat Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body; 
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages provided" });
      }
      
      if (!geminiAi && !openaiAi && !groqAi) {
        return res.status(500).json({ error: "No AI API key is configured on the server." });
      }

      const SYSTEM_PROMPT = "You are DermaVision AI, a medical assistant specializing in skin health. Be empathetic, professional, and clear. You are trained to recognize skin conditions across a broad spectrum of skin tones and backgrounds. Always state that this is an AI tool and not a replacement for a professional doctor.";

      let aiResponseText = "";

      if (groqAi && process.env.AI_PROVIDER === "groq") {
        const response = await groqAi.chat.completions.create({
          model: GROQ_CHAT_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
              role: (m.role === 'model' ? 'assistant' : 'user') as "assistant" | "user",
              content: m.content || ""
            }))
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      } else if (openaiAi && process.env.AI_PROVIDER === "openai") {
        const response = await openaiAi.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
              role: (m.role === 'model' ? 'assistant' : 'user') as "assistant" | "user",
              content: m.content || ""
            }))
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      } else if (geminiAi) {
        const contents = [];
        let lastRole: string | null = null;
        
        for (const m of messages) {
          const currentRole = m.role === 'model' ? 'model' : 'user';
          if (currentRole === lastRole) {
            if (contents.length > 0) {
              contents[contents.length - 1].parts[0].text += "\n" + (m.content || "");
            }
          } else {
            contents.push({ role: currentRole, parts: [{ text: m.content || "" }] });
            lastRole = currentRole;
          }
        }

        if (contents.length > 0 && contents[0].role === 'model') {
          contents.shift();
        }

        if (contents.length === 0) {
          return res.json({ content: "How can I help you regarding your skin health today?" });
        }

        const response = await geminiAi.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });
        
        aiResponseText = response.text || "";
      } else if (openaiAi) {
        const response = await openaiAi.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
              role: (m.role === 'model' ? 'assistant' : 'user') as "assistant" | "user",
              content: m.content || ""
            }))
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      } else if (groqAi) {
        // Fallback to Groq
        const response = await groqAi.chat.completions.create({
          model: GROQ_CHAT_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
              role: (m.role === 'model' ? 'assistant' : 'user') as "assistant" | "user",
              content: m.content || ""
            }))
          ],
        });
        aiResponseText = response.choices[0]?.message?.content || "";
      }

      if (!aiResponseText) {
         aiResponseText = "I'm sorry, I couldn't generate a response. Could you please rephrase your question?";
      }

      res.json({ content: aiResponseText });
    } catch (error: any) {
      console.error("Chat Error:", error);
      const status = error.status || error.code || 500;
      const message = error.message || "Chat failed";
      
      if (status === 429 || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "The AI chat quota has been reached. Please wait a moment before sending another message." });
      }
      if (status === 503 || message.includes("high demand")) {
        return res.status(503).json({ error: "The AI assistant is momentarily unavailable. Please wait a few seconds and try again." });
      }
      res.status(500).json({ error: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Ready for deployment!");
  });
}

startServer();
