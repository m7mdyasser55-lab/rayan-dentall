import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const chat = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `You are the AI assistant for Rayan Dental Care, a premium dental clinic in Alexandria, Egypt. 
            Clinic Details:
            - Name: Rayan Dental Care (عيادة د/محمد ريان)
            - Location: Smouha, Alexandria (Area behind Al Nasr Club, Judges Buildings).
            - Phone: 01550809980
            - Tagline: "We are the makers of the smile" (نحن صناع الابتسامة).
            - Services: General dentistry, Cosmetic dentistry, Orthodontics, Oral surgery, Implants, Whitening.
            - Tone: Professional, warm, and helpful. You can speak English and Arabic.
            - Goal: Answer patient questions about dental care and provide info about the clinic. 
            
            Current conversation:
            ${history.map((h: any) => `${h.role}: ${h.text}`).join("\n")}
            user: ${message}` }]
          }
        ],
      });

      const response = await chat;
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to fetch response from AI" });
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
  });
}

startServer();
