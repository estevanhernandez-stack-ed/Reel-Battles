import { 
  type User, type InsertUser,
  type TriviaQuestion, type InsertTriviaQuestion,
  type Movie, type InsertMovie,
  type MovieAthlete, type InsertMovieAthlete,
  type GameSession, type InsertGameSession,
  users, triviaQuestions, movies, movieAthletes, gameSessions
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTriviaQuestions(limit?: number): Promise<TriviaQuestion[]>;
  getRandomTriviaQuestions(limit: number): Promise<TriviaQuestion[]>;
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
