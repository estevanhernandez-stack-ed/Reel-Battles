import { 
  type User, type InsertUser,
  type TriviaQuestion, type InsertTriviaQuestion,
  type Movie, type InsertMovie,
  type GameSession, type InsertGameSession,
  users, triviaQuestions, movies, gameSessions
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTriviaQuestions(limit?: number): Promise<TriviaQuestion[]>;
  getRandomTriviaQuestions(limit: number): Promise<TriviaQuestion[]>;
  createTriviaQuestion(question: InsertTriviaQuestion): Promise<TriviaQuestion>;
  
  getMovies(): Promise<Movie[]>;
  getRandomMovies(limit: number): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSessions(gameType?: string): Promise<GameSession[]>;
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

  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [result] = await db.insert(gameSessions).values(session).returning();
    return result;
  }

  async getGameSessions(gameType?: string): Promise<GameSession[]> {
    if (gameType) {
      return db.select().from(gameSessions).where(eq(gameSessions.gameType, gameType));
    }
    return db.select().from(gameSessions);
  }
}

export const storage = new DatabaseStorage();
