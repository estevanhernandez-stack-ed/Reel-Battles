import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const triviaQuestions = pgTable("trivia_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  wrongAnswer1: text("wrong_answer_1").notNull(),
  wrongAnswer2: text("wrong_answer_2").notNull(),
  wrongAnswer3: text("wrong_answer_3").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
});

export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  posterUrl: text("poster_url"),
  openingWeekend: integer("opening_weekend").notNull(),
  genre: text("genre").notNull(),
  director: text("director"),
  rating: text("rating"),
  synopsis: text("synopsis"),
});

export const movieAthletes = pgTable("movie_athletes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  movie: text("movie").notNull(),
  movieYear: integer("movie_year").notNull(),
  sport: text("sport").notNull(),
  actor: text("actor").notNull(),
  archetype: text("archetype").notNull(),
  bio: text("bio"),
  quote: text("quote"),
  athleticism: integer("athleticism").notNull().default(50),
  clutch: integer("clutch").notNull().default(50),
  leadership: integer("leadership").notNull().default(50),
  heart: integer("heart").notNull().default(50),
  skill: integer("skill").notNull().default(50),
  intimidation: integer("intimidation").notNull().default(50),
  teamwork: integer("teamwork").notNull().default(50),
  charisma: integer("charisma").notNull().default(50),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameType: text("game_type").notNull(),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTriviaQuestionSchema = createInsertSchema(triviaQuestions).omit({
  id: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
});

export const insertMovieAthleteSchema = createInsertSchema(movieAthletes).omit({
  id: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTriviaQuestion = z.infer<typeof insertTriviaQuestionSchema>;
export type TriviaQuestion = typeof triviaQuestions.$inferSelect;

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export type InsertMovieAthlete = z.infer<typeof insertMovieAthleteSchema>;
export type MovieAthlete = typeof movieAthletes.$inferSelect;

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;
