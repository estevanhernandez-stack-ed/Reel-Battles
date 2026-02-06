import { 
  type User, type InsertUser,
  type TriviaQuestion, type InsertTriviaQuestion,
  type Movie, type InsertMovie,
  type MovieAthlete, type InsertMovieAthlete,
  type GameSession, type InsertGameSession,
  type Profile, type InsertProfile,
  type DailyChallenge, type InsertDailyChallenge,
  type UserDailyProgress, type InsertUserDailyProgress,
  type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement,
  users, triviaQuestions, movies, movieAthletes, gameSessions,
  profiles, dailyChallenges, userDailyProgress, achievements, userAchievements
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc, gte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTriviaQuestions(limit?: number): Promise<TriviaQuestion[]>;
  getRandomTriviaQuestions(limit: number): Promise<TriviaQuestion[]>;
  getSeededTriviaQuestions(seed: number, limit: number): Promise<TriviaQuestion[]>;
  getTriviaQuestionCount(): Promise<number>;
  createTriviaQuestion(question: InsertTriviaQuestion): Promise<TriviaQuestion>;
  
  getMovies(): Promise<Movie[]>;
  getRandomMovies(limit: number): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  deleteMovie(id: string): Promise<void>;
  
  getMovieAthletes(): Promise<MovieAthlete[]>;
  getMovieAthletesByArchetype(archetype: string): Promise<MovieAthlete[]>;
  getRandomMovieAthletes(limit: number): Promise<MovieAthlete[]>;
  createMovieAthlete(athlete: InsertMovieAthlete): Promise<MovieAthlete>;
  deleteMovieAthlete(id: string): Promise<void>;
  
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSessions(gameType?: string): Promise<GameSession[]>;
  getGameSessionsByProfile(profileId: string): Promise<GameSession[]>;

  createProfile(profile: InsertProfile): Promise<Profile>;
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  updateProfileStreak(id: string, currentStreak: number, longestStreak: number, lastChallengeDate: string): Promise<Profile>;
  incrementGamesPlayed(id: string): Promise<void>;

  getDailyChallenge(dateStr: string): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;

  getUserDailyProgress(profileId: string, dateStr: string): Promise<UserDailyProgress | undefined>;
  createUserDailyProgress(progress: InsertUserDailyProgress): Promise<UserDailyProgress>;

  getLeaderboard(gameType: string, period: "weekly" | "alltime", limit: number): Promise<{ profileId: string | null; username: string; totalScore: number; gamesPlayed: number }[]>;

  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(profileId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  grantAchievement(profileId: string, achievementId: string): Promise<UserAchievement>;
  hasAchievement(profileId: string, achievementId: string): Promise<boolean>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTriviaQuestions(limit?: number): Promise<TriviaQuestion[]> {
    if (limit) {
      return db.select().from(triviaQuestions).limit(limit);
    }
    return db.select().from(triviaQuestions);
  }

  async getRandomTriviaQuestions(limit: number): Promise<TriviaQuestion[]> {
    return db.select().from(triviaQuestions).orderBy(sql`RANDOM()`).limit(limit);
  }

  async getSeededTriviaQuestions(seed: number, limit: number): Promise<TriviaQuestion[]> {
    return db.select().from(triviaQuestions).orderBy(sql`md5(${seed}::text || id)`).limit(limit);
  }

  async getTriviaQuestionCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(triviaQuestions);
    return Number(result.count);
  }

  async createTriviaQuestion(question: InsertTriviaQuestion): Promise<TriviaQuestion> {
    const [result] = await db.insert(triviaQuestions).values(question).returning();
    return result;
  }

  async getMovies(): Promise<Movie[]> {
    return db.select().from(movies);
  }

  async getRandomMovies(limit: number): Promise<Movie[]> {
    return db.select().from(movies).orderBy(sql`RANDOM()`).limit(limit);
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [result] = await db.insert(movies).values(movie).returning();
    return result;
  }

  async deleteMovie(id: string): Promise<void> {
    await db.delete(movies).where(eq(movies.id, id));
  }

  async getMovieAthletes(): Promise<MovieAthlete[]> {
    return db.select().from(movieAthletes);
  }

  async getMovieAthletesByArchetype(archetype: string): Promise<MovieAthlete[]> {
    return db.select().from(movieAthletes).where(eq(movieAthletes.archetype, archetype));
  }

  async getRandomMovieAthletes(limit: number): Promise<MovieAthlete[]> {
    return db.select().from(movieAthletes).orderBy(sql`RANDOM()`).limit(limit);
  }

  async createMovieAthlete(athlete: InsertMovieAthlete): Promise<MovieAthlete> {
    const [result] = await db.insert(movieAthletes).values(athlete).returning();
    return result;
  }

  async deleteMovieAthlete(id: string): Promise<void> {
    await db.delete(movieAthletes).where(eq(movieAthletes.id, id));
  }

  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [result] = await db.insert(gameSessions).values(session).returning();
    if (session.profileId) {
      await this.incrementGamesPlayed(session.profileId);
    }
    return result;
  }

  async getGameSessions(gameType?: string): Promise<GameSession[]> {
    if (gameType) {
      return db.select().from(gameSessions).where(eq(gameSessions.gameType, gameType));
    }
    return db.select().from(gameSessions);
  }

  async getGameSessionsByProfile(profileId: string): Promise<GameSession[]> {
    return db.select().from(gameSessions).where(eq(gameSessions.profileId, profileId)).orderBy(desc(gameSessions.createdAt));
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [result] = await db.insert(profiles).values(profile).returning();
    return result;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const [result] = await db.select().from(profiles).where(eq(profiles.id, id));
    return result;
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const [result] = await db.select().from(profiles).where(eq(profiles.username, username));
    return result;
  }

  async updateProfileStreak(id: string, currentStreak: number, longestStreak: number, lastChallengeDate: string): Promise<Profile> {
    const [result] = await db.update(profiles)
      .set({ currentStreak, longestStreak, lastChallengeDate })
      .where(eq(profiles.id, id))
      .returning();
    return result;
  }

  async incrementGamesPlayed(id: string): Promise<void> {
    await db.update(profiles)
      .set({ totalGamesPlayed: sql`${profiles.totalGamesPlayed} + 1` })
      .where(eq(profiles.id, id));
  }

  async getDailyChallenge(dateStr: string): Promise<DailyChallenge | undefined> {
    const [result] = await db.select().from(dailyChallenges).where(eq(dailyChallenges.challengeDate, dateStr));
    return result;
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [result] = await db.insert(dailyChallenges).values(challenge).returning();
    return result;
  }

  async getUserDailyProgress(profileId: string, dateStr: string): Promise<UserDailyProgress | undefined> {
    const [result] = await db.select().from(userDailyProgress)
      .where(and(eq(userDailyProgress.profileId, profileId), eq(userDailyProgress.challengeDate, dateStr)));
    return result;
  }

  async createUserDailyProgress(progress: InsertUserDailyProgress): Promise<UserDailyProgress> {
    const [result] = await db.insert(userDailyProgress).values(progress).returning();
    return result;
  }

  async getLeaderboard(gameType: string, period: "weekly" | "alltime", limit: number) {
    let query;
    if (period === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query = db.select({
        profileId: gameSessions.profileId,
        username: profiles.username,
        totalScore: sql<number>`sum(${gameSessions.score})`.as("total_score"),
        gamesPlayed: sql<number>`count(*)`.as("games_played"),
      })
      .from(gameSessions)
      .innerJoin(profiles, eq(gameSessions.profileId, profiles.id))
      .where(and(
        eq(gameSessions.gameType, gameType),
        gte(gameSessions.createdAt, oneWeekAgo),
        sql`${gameSessions.profileId} IS NOT NULL`
      ))
      .groupBy(gameSessions.profileId, profiles.username)
      .orderBy(desc(sql`total_score`))
      .limit(limit);
    } else {
      query = db.select({
        profileId: gameSessions.profileId,
        username: profiles.username,
        totalScore: sql<number>`sum(${gameSessions.score})`.as("total_score"),
        gamesPlayed: sql<number>`count(*)`.as("games_played"),
      })
      .from(gameSessions)
      .innerJoin(profiles, eq(gameSessions.profileId, profiles.id))
      .where(and(
        eq(gameSessions.gameType, gameType),
        sql`${gameSessions.profileId} IS NOT NULL`
      ))
      .groupBy(gameSessions.profileId, profiles.username)
      .orderBy(desc(sql`total_score`))
      .limit(limit);
    }
    return query;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  }

  async getUserAchievements(profileId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const results = await db.select({
      id: userAchievements.id,
      profileId: userAchievements.profileId,
      achievementId: userAchievements.achievementId,
      earnedAt: userAchievements.earnedAt,
      achievement: achievements,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.profileId, profileId));
    return results.map(r => ({
      id: r.id,
      profileId: r.profileId,
      achievementId: r.achievementId,
      earnedAt: r.earnedAt,
      achievement: r.achievement,
    }));
  }

  async grantAchievement(profileId: string, achievementId: string): Promise<UserAchievement> {
    const [result] = await db.insert(userAchievements).values({ profileId, achievementId }).returning();
    return result;
  }

  async hasAchievement(profileId: string, achievementId: string): Promise<boolean> {
    const [result] = await db.select().from(userAchievements)
      .where(and(eq(userAchievements.profileId, profileId), eq(userAchievements.achievementId, achievementId)));
    return !!result;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [result] = await db.insert(achievements).values(achievement).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
