import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/trivia/questions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const questions = await storage.getRandomTriviaQuestions(limit);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching trivia questions:", error);
      res.status(500).json({ error: "Failed to fetch trivia questions" });
    }
  });

  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ error: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/random", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2;
      const movies = await storage.getRandomMovies(limit);
      res.json(movies);
    } catch (error) {
      console.error("Error fetching random movies:", error);
      res.status(500).json({ error: "Failed to fetch random movies" });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      const validatedData = insertGameSessionSchema.parse(req.body);
      const session = await storage.createGameSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating game session:", error);
      res.status(400).json({ error: "Invalid game session data" });
    }
  });

  app.get("/api/games", async (req, res) => {
    try {
      const gameType = req.query.gameType as string | undefined;
      const sessions = await storage.getGameSessions(gameType);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching game sessions:", error);
      res.status(500).json({ error: "Failed to fetch game sessions" });
    }
  });

  return httpServer;
}
