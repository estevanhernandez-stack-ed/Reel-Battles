import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, type MovieAthlete } from "@shared/schema";
import { ZodError } from "zod";

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

interface SynergyDetail {
  name: string;
  description: string;
  bonus: number;
  active: boolean;
}

function calculateSynergyDetails(athletes: MovieAthlete[]): SynergyDetail[] {
  const archetypes = athletes.map(a => a.archetype);
  const uniqueArchetypes = new Set(archetypes);
  return [
    {
      name: "Captain's Command",
      description: "Having a Captain on the team rallies everyone",
      bonus: 50,
      active: archetypes.includes("captain"),
    },
    {
      name: "Mentor & Protege",
      description: "A Veteran guides the Underdog to greatness",
      bonus: 30,
      active: archetypes.includes("veteran") && archetypes.includes("underdog"),
    },
    {
      name: "Natural Chemistry",
      description: "A Natural and a Teammate create perfect synergy",
      bonus: 25,
      active: archetypes.includes("natural") && archetypes.includes("teammate"),
    },
    {
      name: "Diverse Roster",
      description: "4+ different archetypes bring versatility",
      bonus: 40,
      active: uniqueArchetypes.size >= 4,
    },
  ];
}

function calculateSynergyBonus(athletes: MovieAthlete[]): number {
  return calculateSynergyDetails(athletes)
    .filter(s => s.active)
    .reduce((sum, s) => sum + s.bonus, 0);
}

function getAthleteStatBreakdown(athlete: MovieAthlete) {
  const stats = [
    { name: "Heart", value: athlete.heart, weight: STAT_WEIGHTS.heart, weighted: Math.round(athlete.heart * STAT_WEIGHTS.heart) },
    { name: "Clutch", value: athlete.clutch, weight: STAT_WEIGHTS.clutch, weighted: Math.round(athlete.clutch * STAT_WEIGHTS.clutch) },
    { name: "Teamwork", value: athlete.teamwork, weight: STAT_WEIGHTS.teamwork, weighted: Math.round(athlete.teamwork * STAT_WEIGHTS.teamwork) },
    { name: "Leadership", value: athlete.leadership, weight: STAT_WEIGHTS.leadership, weighted: Math.round(athlete.leadership * STAT_WEIGHTS.leadership) },
    { name: "Athleticism", value: athlete.athleticism, weight: STAT_WEIGHTS.athleticism, weighted: Math.round(athlete.athleticism * STAT_WEIGHTS.athleticism) },
    { name: "Skill", value: athlete.skill, weight: STAT_WEIGHTS.skill, weighted: Math.round(athlete.skill * STAT_WEIGHTS.skill) },
    { name: "Intimidation", value: athlete.intimidation, weight: STAT_WEIGHTS.intimidation, weighted: Math.round(athlete.intimidation * STAT_WEIGHTS.intimidation) },
    { name: "Charisma", value: athlete.charisma, weight: STAT_WEIGHTS.charisma, weighted: Math.round(athlete.charisma * STAT_WEIGHTS.charisma) },
  ];
  return stats;
}

const ACHIEVEMENT_DEFINITIONS = [
  { key: "first_game", name: "First Steps", description: "Play your first game", icon: "star", category: "general", threshold: 1 },
  { key: "ten_games", name: "Getting Warmed Up", description: "Play 10 games", icon: "flame", category: "general", threshold: 10 },
  { key: "fifty_games", name: "Dedicated Player", description: "Play 50 games", icon: "medal", category: "general", threshold: 50 },
  { key: "trivia_perfect", name: "Perfect Round", description: "Score 10/10 in a trivia quiz", icon: "ribbon", category: "trivia", threshold: 1 },
  { key: "trivia_streak_5", name: "Trivia Hot Streak", description: "Score at least 5 correct in a single trivia round", icon: "flash", category: "trivia", threshold: 1 },
  { key: "draft_first_win", name: "Draft Champion", description: "Win your first draft battle", icon: "trophy", category: "draft", threshold: 1 },
  { key: "draft_three_wins", name: "Draft Dominator", description: "Win 3 draft battles", icon: "shield", category: "draft", threshold: 3 },
  { key: "boxoffice_streak_5", name: "Box Office Guru", description: "Get 5 or more correct in a box office round", icon: "cash", category: "boxoffice", threshold: 1 },
  { key: "boxoffice_8_of_10", name: "Market Analyst", description: "Score 8+ in a box office round", icon: "trending-up", category: "boxoffice", threshold: 1 },
  { key: "daily_streak_3", name: "Consistent Player", description: "Complete 3 daily challenges in a row", icon: "calendar", category: "daily", threshold: 3 },
  { key: "daily_streak_7", name: "Weekly Warrior", description: "Complete 7 daily challenges in a row", icon: "flag", category: "daily", threshold: 7 },
];

async function seedAchievements() {
  const existing = await storage.getAllAchievements();
  if (existing.length >= ACHIEVEMENT_DEFINITIONS.length) return;
  const existingKeys = new Set(existing.map(a => a.key));
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (!existingKeys.has(def.key)) {
      await storage.createAchievement(def);
    }
  }
  console.log("Achievements seeded");
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

async function checkAndGrantAchievements(profileId: string, context: {
  gameType: string;
  score: number;
  totalQuestions: number;
}) {
  const allAchievements = await storage.getAllAchievements();
  const profile = await storage.getProfile(profileId);
  if (!profile) return;

  const sessions = await storage.getGameSessionsByProfile(profileId);

  for (const achievement of allAchievements) {
    const alreadyHas = await storage.hasAchievement(profileId, achievement.id);
    if (alreadyHas) continue;

    let earned = false;

    switch (achievement.key) {
      case "first_game":
        earned = sessions.length >= 1;
        break;
      case "ten_games":
        earned = sessions.length >= 10;
        break;
      case "fifty_games":
        earned = sessions.length >= 50;
        break;
      case "trivia_perfect":
        earned = context.gameType === "trivia" && context.score === context.totalQuestions && context.totalQuestions >= 10;
        break;
      case "trivia_streak_5":
        earned = context.gameType === "trivia" && context.score >= 5;
        break;
      case "draft_first_win":
        earned = context.gameType === "draft" && context.score > 0;
        break;
      case "draft_three_wins": {
        const draftWins = sessions.filter(s => s.gameType === "draft" && s.score > 0).length;
        earned = draftWins >= 3;
        break;
      }
      case "boxoffice_streak_5":
        earned = context.gameType === "boxoffice" && context.score >= 5;
        break;
      case "boxoffice_8_of_10":
        earned = context.gameType === "boxoffice" && context.score >= 8;
        break;
      case "daily_streak_3":
        earned = profile.currentStreak >= 3;
        break;
      case "daily_streak_7":
        earned = profile.currentStreak >= 7;
        break;
    }

    if (earned) {
      await storage.grantAchievement(profileId, achievement.id);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  await seedAchievements();
  
  app.get("/api/trivia/questions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const seed = req.query.seed ? parseInt(req.query.seed as string) : undefined;
      const tier = (req.query.tier as string) || "popular";
      const tierFilter = tier === "all" ? undefined : tier;
      const questions = seed
        ? await storage.getSeededTriviaQuestions(seed, limit, tierFilter)
        : await storage.getRandomTriviaQuestions(limit, tierFilter);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching trivia questions:", error);
      res.status(500).json({ error: "Failed to fetch trivia questions" });
    }
  });

  app.get("/api/trivia/stats", async (req, res) => {
    try {
      const tier = (req.query.tier as string) || undefined;
      const tierFilter = tier === "all" ? undefined : tier;
      const count = await storage.getTriviaQuestionCount(tierFilter);
      res.json({ totalQuestions: count, source: "postgresql" });
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

      if (!Array.isArray(playerTeam) || !Array.isArray(opponentTeam)) {
        return res.status(400).json({ error: "playerTeam and opponentTeam must be arrays" });
      }

      if (playerTeam.length === 0 || opponentTeam.length === 0) {
        return res.status(400).json({ error: "Both teams must have at least one athlete" });
      }
      
      const playerScore = calculateTeamScore(playerTeam);
      const opponentScore = calculateTeamScore(opponentTeam);

      const playerSynergies = calculateSynergyDetails(playerTeam);
      const opponentSynergies = calculateSynergyDetails(opponentTeam);
      const playerSynergyTotal = playerSynergies.filter(s => s.active).reduce((sum, s) => sum + s.bonus, 0);
      const opponentSynergyTotal = opponentSynergies.filter(s => s.active).reduce((sum, s) => sum + s.bonus, 0);

      const playerBaseScore = playerTeam.reduce((sum, a) => sum + calculateWeightedScore(a), 0);
      const opponentBaseScore = opponentTeam.reduce((sum, a) => sum + calculateWeightedScore(a), 0);

      const playerDetailedBreakdown = playerTeam.map(a => ({
        name: a.name,
        movie: a.movie,
        archetype: a.archetype,
        score: Math.round(calculateWeightedScore(a)),
        stats: getAthleteStatBreakdown(a),
        wildcardName: a.wildcardName,
        wildcardValue: a.wildcardValue,
      }));
      const opponentDetailedBreakdown = opponentTeam.map(a => ({
        name: a.name,
        movie: a.movie,
        archetype: a.archetype,
        score: Math.round(calculateWeightedScore(a)),
        stats: getAthleteStatBreakdown(a),
        wildcardName: a.wildcardName,
        wildcardValue: a.wildcardValue,
      }));

      const playerMvp = playerDetailedBreakdown.reduce((best, cur) => cur.score > best.score ? cur : best);
      const opponentMvp = opponentDetailedBreakdown.reduce((best, cur) => cur.score > best.score ? cur : best);

      const matchups = playerDetailedBreakdown.map((p, i) => {
        const o = opponentDetailedBreakdown[i] || opponentDetailedBreakdown[opponentDetailedBreakdown.length - 1];
        return {
          player: { name: p.name, archetype: p.archetype, score: p.score },
          opponent: { name: o.name, archetype: o.archetype, score: o.score },
          winner: p.score > o.score ? "player" : p.score < o.score ? "opponent" : "tie",
          margin: Math.abs(p.score - o.score),
        };
      });

      const teamStatAverages = (team: typeof playerDetailedBreakdown) => {
        const statNames = team[0]?.stats.map(s => s.name) || [];
        return statNames.map(name => {
          const avg = team.reduce((sum, a) => {
            const stat = a.stats.find(s => s.name === name);
            return sum + (stat?.value || 0);
          }, 0) / team.length;
          return { name, average: Math.round(avg) };
        });
      };

      const result = {
        playerScore: Math.round(playerScore),
        opponentScore: Math.round(opponentScore),
        winner: playerScore > opponentScore ? "player" : playerScore < opponentScore ? "opponent" : "tie",
        margin: Math.abs(Math.round(playerScore) - Math.round(opponentScore)),
        playerBaseScore: Math.round(playerBaseScore),
        opponentBaseScore: Math.round(opponentBaseScore),
        playerSynergyTotal,
        opponentSynergyTotal,
        playerSynergies,
        opponentSynergies,
        playerBreakdown: playerDetailedBreakdown,
        opponentBreakdown: opponentDetailedBreakdown,
        playerMvp,
        opponentMvp,
        matchups,
        playerTeamStats: teamStatAverages(playerDetailedBreakdown),
        opponentTeamStats: teamStatAverages(opponentDetailedBreakdown),
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

      if (validatedData.profileId) {
        checkAndGrantAchievements(validatedData.profileId, {
          gameType: validatedData.gameType,
          score: validatedData.score ?? 0,
          totalQuestions: validatedData.totalQuestions ?? 0,
        }).catch(err => console.error("Achievement check error:", err));
      }

      res.json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Invalid game session data", 
          details: error.errors.map(e => ({ field: e.path.join("."), message: e.message }))
        });
      }
      console.error("Error creating game session:", error);
      res.status(500).json({ error: "Failed to save game session" });
    }
  });

  app.get("/api/games", async (req, res) => {
    try {
      const gameType = req.query.gameType as string | undefined;
      const profileId = req.query.profileId as string | undefined;
      if (profileId) {
        const sessions = await storage.getGameSessionsByProfile(profileId);
        res.json(sessions);
      } else {
        const sessions = await storage.getGameSessions(gameType);
        res.json(sessions);
      }
    } catch (error) {
      console.error("Error fetching game sessions:", error);
      res.status(500).json({ error: "Failed to fetch game sessions" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username || typeof username !== "string" || username.trim().length < 2) {
        return res.status(400).json({ error: "Username must be at least 2 characters" });
      }
      const existing = await storage.getProfileByUsername(username.trim());
      if (existing) {
        return res.json(existing);
      }
      const profile = await storage.createProfile({ username: username.trim() });
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.get("/api/daily-challenge", async (req, res) => {
    try {
      const today = getTodayDateString();
      let challenge = await storage.getDailyChallenge(today);
      if (!challenge) {
        const dateNum = parseInt(today.replace(/-/g, ""));
        const gameTypes = ["trivia", "trivia", "trivia"];
        const gameType = gameTypes[dateNum % gameTypes.length];
        challenge = await storage.createDailyChallenge({
          challengeDate: today,
          gameType,
          seed: dateNum,
        });
      }
      const profileId = req.query.profileId as string | undefined;
      let completed = false;
      if (profileId) {
        const progress = await storage.getUserDailyProgress(profileId, today);
        completed = !!progress?.completed;
      }
      res.json({ ...challenge, completed });
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
      res.status(500).json({ error: "Failed to fetch daily challenge" });
    }
  });

  app.post("/api/daily-challenge/complete", async (req, res) => {
    try {
      const { profileId, score, totalQuestions } = req.body;
      if (!profileId) return res.status(400).json({ error: "profileId required" });

      const today = getTodayDateString();
      const existing = await storage.getUserDailyProgress(profileId, today);
      if (existing) return res.json({ alreadyCompleted: true, streak: 0 });

      let challenge = await storage.getDailyChallenge(today);
      if (!challenge) {
        const dateNum = parseInt(today.replace(/-/g, ""));
        challenge = await storage.createDailyChallenge({
          challengeDate: today,
          gameType: "trivia",
          seed: dateNum,
        });
      }

      await storage.createUserDailyProgress({
        profileId,
        challengeDate: today,
        gameType: challenge.gameType,
        completed: true,
        score: score || 0,
        totalQuestions: totalQuestions || 10,
      });

      const profile = await storage.getProfile(profileId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (profile.lastChallengeDate === yesterdayStr) {
        newStreak = profile.currentStreak + 1;
      }
      const newLongest = Math.max(profile.longestStreak, newStreak);

      const updated = await storage.updateProfileStreak(profileId, newStreak, newLongest, today);

      await storage.createGameSession({
        profileId,
        gameType: "daily",
        score: score || 0,
        totalQuestions: totalQuestions || 10,
      });

      checkAndGrantAchievements(profileId, {
        gameType: "daily",
        score: score || 0,
        totalQuestions: totalQuestions || 10,
      }).catch(err => console.error("Achievement check error:", err));

      res.json({ streak: updated.currentStreak, longestStreak: updated.longestStreak });
    } catch (error) {
      console.error("Error completing daily challenge:", error);
      res.status(500).json({ error: "Failed to complete daily challenge" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const gameType = (req.query.gameType as string) || "trivia";
      const period = (req.query.period as "weekly" | "alltime") || "alltime";
      const limit = parseInt(req.query.limit as string) || 20;
      const results = await storage.getLeaderboard(gameType, period, limit);
      res.json(results);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/achievements", async (req, res) => {
    try {
      const profileId = req.query.profileId as string | undefined;
      const all = await storage.getAllAchievements();
      if (profileId) {
        const earned = await storage.getUserAchievements(profileId);
        const earnedIds = new Set(earned.map(e => e.achievementId));
        const result = all.map(a => ({
          ...a,
          earned: earnedIds.has(a.id),
          earnedAt: earned.find(e => e.achievementId === a.id)?.earnedAt || null,
        }));
        res.json(result);
      } else {
        res.json(all.map(a => ({ ...a, earned: false, earnedAt: null })));
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.post("/api/admin/movies", async (req, res) => {
    try {
      const { title, year, genre, openingWeekend, director, posterUrl, rating, synopsis, imdbId } = req.body;
      if (!title || !year || !genre || !openingWeekend) {
        return res.status(400).json({ error: "title, year, genre, and openingWeekend are required" });
      }
      const movie = await storage.createMovie({
        title,
        year: Number(year),
        genre,
        openingWeekend: Number(openingWeekend),
        director: director || null,
        posterUrl: posterUrl || null,
        rating: rating || null,
        synopsis: synopsis || null,
        imdbId: imdbId || null,
      });
      res.json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(500).json({ error: "Failed to create movie" });
    }
  });

  app.post("/api/admin/omdb/enrich", async (req, res) => {
    try {
      const apiKey = process.env.OMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OMDB_API_KEY not configured" });
      }
      const allMovies = await storage.getMovies();
      const results: Array<{ title: string; status: string; posterUrl?: string }> = [];

      for (const movie of allMovies) {
        try {
          let omdbUrl: string;
          if (movie.imdbId) {
            omdbUrl = `https://www.omdbapi.com/?i=${movie.imdbId}&apikey=${apiKey}`;
          } else {
            omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&y=${movie.year}&apikey=${apiKey}`;
          }
          const omdbRes = await fetch(omdbUrl);
          const data = await omdbRes.json() as any;

          if (data.Response === "True" && data.Poster && data.Poster !== "N/A") {
            const updateData: any = { posterUrl: data.Poster };
            if (!movie.imdbId && data.imdbID) {
              updateData.imdbId = data.imdbID;
            }
            if (!movie.rating && data.Rated && data.Rated !== "N/A") {
              updateData.rating = data.Rated;
            }
            if (!movie.synopsis && data.Plot && data.Plot !== "N/A") {
              updateData.synopsis = data.Plot;
            }
            await storage.updateMovie(movie.id, updateData);
            results.push({ title: movie.title, status: "updated", posterUrl: data.Poster });
          } else {
            results.push({ title: movie.title, status: "not_found" });
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          results.push({ title: movie.title, status: "error" });
        }
      }
      res.json({ updated: results.filter(r => r.status === "updated").length, total: allMovies.length, results });
    } catch (error) {
      console.error("Error enriching movies with OMDb:", error);
      res.status(500).json({ error: "Failed to enrich movies" });
    }
  });

  app.delete("/api/admin/movies/:id", async (req, res) => {
    try {
      await storage.deleteMovie(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ error: "Failed to delete movie" });
    }
  });

  app.post("/api/admin/athletes", async (req, res) => {
    try {
      const { name, movie, movieYear, sport, actor, archetype, bio, quote } = req.body;
      if (!name || !movie || !movieYear || !sport || !actor || !archetype) {
        return res.status(400).json({ error: "name, movie, movieYear, sport, actor, and archetype are required" });
      }
      const randomStat = () => Math.floor(Math.random() * 30) + 60;
      const athlete = await storage.createMovieAthlete({
        name,
        movie,
        movieYear: Number(movieYear),
        sport,
        actor,
        archetype,
        bio: bio || null,
        quote: quote || null,
        athleticism: randomStat(),
        clutch: randomStat(),
        leadership: randomStat(),
        heart: randomStat(),
        skill: randomStat(),
        intimidation: randomStat(),
        teamwork: randomStat(),
        charisma: randomStat(),
        wildcardName: null,
        wildcardCategory: null,
        wildcardValue: null,
      });
      res.json(athlete);
    } catch (error) {
      console.error("Error creating athlete:", error);
      res.status(500).json({ error: "Failed to create athlete" });
    }
  });

  app.delete("/api/admin/athletes/:id", async (req, res) => {
    try {
      await storage.deleteMovieAthlete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting athlete:", error);
      res.status(500).json({ error: "Failed to delete athlete" });
    }
  });

  return httpServer;
}
