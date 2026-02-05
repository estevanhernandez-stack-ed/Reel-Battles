import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { createServer, type Server } from "http";
import request from "supertest";
import { registerRoutes } from "../server/routes";

let app: express.Express;
let server: Server;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  server = createServer(app);
  await registerRoutes(server, app);
});

afterAll(() => {
  server.close();
});

describe("Trivia API", () => {
  it("GET /api/trivia/questions returns questions", async () => {
    const res = await request(app).get("/api/trivia/questions?limit=5");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(5);
    if (res.body.length > 0) {
      const q = res.body[0];
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("correctAnswer");
      expect(q).toHaveProperty("wrongAnswer1");
      expect(q).toHaveProperty("wrongAnswer2");
      expect(q).toHaveProperty("wrongAnswer3");
      expect(q).toHaveProperty("category");
      expect(q).toHaveProperty("difficulty");
    }
  });

  it("GET /api/trivia/questions defaults to 10 when no limit provided", async () => {
    const res = await request(app).get("/api/trivia/questions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it("GET /api/trivia/stats returns question count", async () => {
    const res = await request(app).get("/api/trivia/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalQuestions");
    expect(res.body).toHaveProperty("source", "postgresql");
    expect(typeof res.body.totalQuestions).toBe("number");
    expect(res.body.totalQuestions).toBeGreaterThan(0);
  });
});

describe("Movies API", () => {
  it("GET /api/movies returns all movies", async () => {
    const res = await request(app).get("/api/movies");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const movie = res.body[0];
      expect(movie).toHaveProperty("title");
      expect(movie).toHaveProperty("year");
      expect(movie).toHaveProperty("openingWeekend");
      expect(movie).toHaveProperty("genre");
    }
  });

  it("GET /api/movies/random returns random movies", async () => {
    const res = await request(app).get("/api/movies/random?limit=3");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });

  it("GET /api/movies/random defaults to 2", async () => {
    const res = await request(app).get("/api/movies/random");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(2);
  });
});

describe("Athletes API", () => {
  it("GET /api/athletes returns all athletes", async () => {
    const res = await request(app).get("/api/athletes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const athlete = res.body[0];
      expect(athlete).toHaveProperty("name");
      expect(athlete).toHaveProperty("movie");
      expect(athlete).toHaveProperty("archetype");
      expect(athlete).toHaveProperty("athleticism");
      expect(athlete).toHaveProperty("clutch");
      expect(athlete).toHaveProperty("heart");
    }
  });

  it("GET /api/athletes?archetype=captain filters by archetype", async () => {
    const res = await request(app).get("/api/athletes?archetype=captain");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const athlete of res.body) {
      expect(athlete.archetype).toBe("captain");
    }
  });

  it("GET /api/athletes/random returns random athletes with limit", async () => {
    const res = await request(app).get("/api/athletes/random?limit=5");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });
});

describe("Battle API", () => {
  let sampleAthletes: any[] = [];

  beforeAll(async () => {
    const res = await request(app).get("/api/athletes/random?count=4");
    sampleAthletes = res.body;
  });

  it("POST /api/athletes/battle returns battle results", async () => {
    if (sampleAthletes.length < 4) return;
    const res = await request(app)
      .post("/api/athletes/battle")
      .send({
        playerTeam: sampleAthletes.slice(0, 2),
        opponentTeam: sampleAthletes.slice(2, 4),
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("playerScore");
    expect(res.body).toHaveProperty("opponentScore");
    expect(res.body).toHaveProperty("winner");
    expect(["player", "opponent", "tie"]).toContain(res.body.winner);
    expect(res.body).toHaveProperty("playerBreakdown");
    expect(res.body).toHaveProperty("opponentBreakdown");
    expect(Array.isArray(res.body.playerBreakdown)).toBe(true);
    expect(Array.isArray(res.body.opponentBreakdown)).toBe(true);
  });

  it("POST /api/athletes/battle rejects non-array teams", async () => {
    const res = await request(app)
      .post("/api/athletes/battle")
      .send({ playerTeam: "not-an-array", opponentTeam: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("must be arrays");
  });

  it("POST /api/athletes/battle rejects empty teams", async () => {
    const res = await request(app)
      .post("/api/athletes/battle")
      .send({ playerTeam: [], opponentTeam: [sampleAthletes[0]] });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("at least one athlete");
  });
});

describe("Game Sessions API", () => {
  it("POST /api/games creates a game session", async () => {
    const res = await request(app)
      .post("/api/games")
      .send({ gameType: "trivia", score: 7, totalQuestions: 10 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.gameType).toBe("trivia");
    expect(res.body.score).toBe(7);
    expect(res.body.totalQuestions).toBe(10);
  });

  it("POST /api/games rejects invalid data with detailed errors", async () => {
    const res = await request(app)
      .post("/api/games")
      .send({ score: 5 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("details");
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("GET /api/games returns game sessions", async () => {
    const res = await request(app).get("/api/games");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/games?gameType=trivia filters by game type", async () => {
    const res = await request(app).get("/api/games?gameType=trivia");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const session of res.body) {
      expect(session.gameType).toBe("trivia");
    }
  });
});
