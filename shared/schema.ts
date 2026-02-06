import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
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
  hint: text("hint"),
  movieTitle: text("movie_title"),
  firebaseId: text("firebase_id"),
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
  wildcardName: text("wildcard_name"),
  wildcardCategory: text("wildcard_category"),
  wildcardValue: integer("wildcard_value").default(0),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id"),
  gameType: text("game_type").notNull(),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastChallengeDate: text("last_challenge_date"),
  totalGamesPlayed: integer("total_games_played").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeDate: text("challenge_date").notNull().unique(),
  gameType: text("game_type").notNull(),
  seed: integer("seed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDailyProgress = pgTable("user_daily_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  challengeDate: text("challenge_date").notNull(),
  gameType: text("game_type").notNull(),
  completed: boolean("completed").notNull().default(false),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  threshold: integer("threshold").notNull().default(1),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
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

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  currentStreak: true,
  longestStreak: true,
  lastChallengeDate: true,
  totalGamesPlayed: true,
  createdAt: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserDailyProgressSchema = createInsertSchema(userDailyProgress).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
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

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;

export type InsertUserDailyProgress = z.infer<typeof insertUserDailyProgressSchema>;
export type UserDailyProgress = typeof userDailyProgress.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
