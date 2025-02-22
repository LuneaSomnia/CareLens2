import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { openai } from "./openai";
import { userProfileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const user = await storage.getUser(req.user.id);
    res.json(user);
  });

  app.post("/api/profile", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    
    const result = userProfileSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const updatedUser = await storage.updateUser(req.user.id, result.data);
    res.json(updatedUser);
  });

  // Symptom checker route
  app.post("/api/symptoms/analyze", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const { symptoms } = req.body;
    
    try {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a medical assistant. Analyze the symptoms and provide potential conditions and recommendations. Response should be in JSON format."
          },
          {
            role: "user",
            content: `Please analyze these symptoms: ${symptoms}`
          }
        ],
        response_format: { type: "json_object" }
      });

      res.json(JSON.parse(analysis.choices[0].message.content));
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze symptoms" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
