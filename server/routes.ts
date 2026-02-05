import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, type MovieAthlete } from "@shared/schema";
import { getFirebaseQuestions, getFirebaseQuestionCount, warmFirebaseCache } from "./firebase";

const STAT_WEIGHTS = {
  athleticism: 1.0,
  clutch: 1.2,
  leadership: 1.1,
  heart: 1.3,
  skill: 1.0,
  intimidation: 0.8,
  teamwork: 1.2,
  charisma: 0.7,
};

export function calculateWeightedScore(athlete: MovieAthlete): number {
  return (
    athlete.athleticism * STAT_WEIGHTS.athleticism +
    athlete.clutch * STAT_WEIGHTS.clutch +
    athlete.leadership * STAT_WEIGHTS.leadership +
    athlete.heart * STAT_WEIGHTS.heart +
    athlete.skill * STAT_WEIGHTS.skill +
    athlete.intimidation * STAT_WEIGHTS.intimidation +
    athlete.teamwork * STAT_WEIGHTS.teamwork +
    athlete.charisma * STAT_WEIGHTS.charisma
  );
}

export function calculateTeamScore(athletes: MovieAthlete[]): number {
  if (athletes.length === 0) return 0;
  const totalScore = athletes.reduce((sum, athlete) => sum + calculateWeightedScore(athlete), 0);
  const synergyBonus = calculateSynergyBonus(athletes);
  return totalScore + synergyBonus;
}

function calculateSynergyBonus(athletes: MovieAthlete[]): number {
  let bonus = 0;
  const archetypes = athletes.map(a => a.archetype);
  if (archetypes.includes("captain")) bonus += 50;
  if (archetypes.includes("veteran") && archetypes.includes("underdog")) bonus += 30;
  if (archetypes.includes("natural") && archetypes.includes("teammate")) bonus += 25;
  const uniqueArchetypes = new Set(archetypes);
  if (uniqueArchetypes.size >= 4) bonus += 40;
  return bonus;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  warmFirebaseCache();

  app.get("/api/trivia/questions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const questions = await getFirebaseQuestions(limit);
      if (questions.length > 0) {
        res.json(questions);
      } else {
        const fallback = await storage.getRandomTriviaQuestions(limit);
        res.json(fallback);
      }
    } catch (error) {
      console.error("Error fetching trivia questions:", error);
      try {
        const fallback = await storage.getRandomTriviaQuestions(
          parseInt(req.query.limit as string) || 10
        );
        res.json(fallback);
      } catch {
        res.status(500).json({ error: "Failed to fetch trivia questions" });
      }
    }
  });

  app.get("/api/trivia/stats", async (_req, res) => {
    try {
      const count = await getFirebaseQuestionCount();
      res.json({ totalQuestions: count, source: "firebase" });
    } catch (error) {
      console.error("Error fetching trivia stats:", error);
      res.status(500).json({ error: "Failed to fetch trivia stats" });
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

  app.get("/api/athletes", async (req, res) => {
    try {
      const archetype = req.query.archetype as string | undefined;
      if (archetype) {
        const athletes = await storage.getMovieAthletesByArchetype(archetype);
        res.json(athletes);
      } else {
        const athletes = await storage.getMovieAthletes();
        res.json(athletes);
      }
    } catch (error) {
      console.error("Error fetching athletes:", error);
      res.status(500).json({ error: "Failed to fetch athletes" });
    }
  });

  app.get("/api/athletes/random", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2;
      const athletes = await storage.getRandomMovieAthletes(limit);
      res.json(athletes);
    } catch (error) {
      console.error("Error fetching random athletes:", error);
      res.status(500).json({ error: "Failed to fetch random athletes" });
    }
  });

  app.post("/api/athletes/battle", async (req, res) => {
    try {
      const { playerTeam, opponentTeam } = req.body as { playerTeam: MovieAthlete[]; opponentTeam: MovieAthlete[] };
      
      const playerScore = calculateTeamScore(playerTeam);
      const opponentScore = calculateTeamScore(opponentTeam);
      
      const result = {
        playerScore: Math.round(playerScore),
        opponentScore: Math.round(opponentScore),
        winner: playerScore > opponentScore ? "player" : playerScore < opponentScore ? "opponent" : "tie",
        playerBreakdown: playerTeam.map(a => ({ name: a.name, score: Math.round(calculateWeightedScore(a)) })),
        opponentBreakdown: opponentTeam.map(a => ({ name: a.name, score: Math.round(calculateWeightedScore(a)) })),
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error calculating battle:", error);
      res.status(500).json({ error: "Failed to calculate battle" });
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
