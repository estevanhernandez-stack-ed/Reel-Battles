# CineGame - Movie Trivia & Challenges

## Overview

CineGame is a native mobile app (React Native / Expo) for the Replit Mobile App Challenge hackathon. It offers three interactive game modes for film enthusiasts plus a comprehensive engagement system:

1. **Trivia Quiz** - Multiple-choice movie knowledge questions across categories and difficulty levels (38,505 questions)
2. **Movie Draft** - Draft movie characters by archetype, then team battle with weighted stats and synergy bonuses
3. **Box Office Heads Up** - Guess which movie had the bigger opening weekend

### Engagement Features
- **Player Profiles** - Username-based profiles stored locally (AsyncStorage) and server-side, shown in header and stats
- **Daily Challenges** - Deterministic daily trivia (same questions for all players via seeded randomization), with streak tracking
- **Streaks** - Current/longest streak tracking, fire icon badge on home and stats screens
- **Leaderboards** - Weekly and all-time rankings by game mode (trivia, draft, boxoffice)
- **Achievements** - 11 unlockable badges across categories (general, trivia, draft, boxoffice, daily), auto-granted on game completion
- **Share Results** - Share game results via native Share API on all game-over screens
- **Haptic Feedback** - Correct/incorrect answer feedback, draft picks, and battle results via expo-haptics

The app uses Expo Router with bottom tab navigation and connects to an Express backend API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Mobile Frontend (React Native / Expo)
- **Framework**: React Native 0.76 with Expo SDK 52
- **Routing**: Expo Router with file-based routing (bottom tabs)
- **Navigation**: Bottom tab bar with Play, Stats, and Admin tabs
- **Screens**: Home (index), Trivia, Draft, Box Office, Stats, Admin
- **Styling**: React Native StyleSheet with custom theme constants (Colors, Spacing, FontSize, BorderRadius)
- **API Client**: Custom fetch wrapper in `mobile/constants/api.ts`
- **Profile Hook**: `mobile/hooks/useProfile.ts` - AsyncStorage-backed profile management
- **Theme**: Cinematic dark/light mode with gold accents and red primary

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Runtime**: Node.js with tsx for development
- **API Design**: RESTful JSON API endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Achievement System**: Server-side auto-granting via `checkAndGrantAchievements()` in routes.ts
- **Port**: 5000 (mobile app connects via HTTP)

### Data Layer
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)
- **Data Source**: 38,505 trivia questions in PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Tables**:
  - `users` - User accounts with username/password
  - `trivia_questions` - Quiz questions with correct/wrong answers, category, difficulty
  - `movies` - Movie data including title, year, poster, opening weekend, genre
  - `movie_athletes` - 58 movie characters with 8 Madden-like stats + wildcard abilities
  - `game_sessions` - Game history tracking scores, game types, and profileId
  - `profiles` - Player profiles with username, streak data, and total games played
  - `daily_challenges` - Daily challenge definitions with date, game type, and seed
  - `user_daily_progress` - Per-user daily challenge completion records
  - `achievements` - 11 achievement definitions with key, name, description, icon, category, threshold
  - `user_achievements` - Earned achievements linked to profiles

### Project Structure
```
├── app/                # Expo Router screens (file-based routing)
│   ├── _layout.tsx     # Root layout with bottom tab navigation
│   ├── index.tsx       # Home screen with game mode cards, daily challenge, profile modal
│   ├── trivia.tsx      # Trivia quiz game screen (supports daily challenge mode via ?daily=true&seed=N)
│   ├── draft.tsx       # Movie draft game screen
│   ├── boxoffice.tsx   # Box office guessing game screen
│   ├── stats.tsx       # Stats, leaderboard, and achievements tabs
│   └── admin.tsx       # Admin panel for managing data
├── mobile/             # Mobile app shared code
│   ├── constants/      # Theme (Colors, Spacing, etc.) and API client
│   ├── hooks/          # useProfile (AsyncStorage-backed), useThemeColors, useColorScheme
│   └── components/     # Shared mobile components
├── server/             # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API route definitions (game, profile, daily, leaderboard, achievements, admin)
│   ├── storage.ts      # Database access layer (IStorage interface + DatabaseStorage)
│   ├── seed.ts         # Database seeding with sample data
│   └── db.ts           # Database connection
├── shared/             # Shared types and schemas
│   └── schema.ts       # Drizzle schema definitions (10 tables)
├── client/             # Legacy web frontend (React/Vite, still present)
├── tests/              # Automated test suite (Vitest)
│   ├── scoring.test.ts # Unit tests for battle scoring logic
│   └── api.test.ts     # API integration tests
├── app.json            # Expo configuration
├── metro.config.js     # Metro bundler configuration
├── babel.config.js     # Babel configuration for Expo
└── vitest.config.ts    # Vitest test runner configuration
```

### API Endpoints

#### Game Endpoints
- `GET /api/trivia/questions?limit=N&seed=S` - Random or seeded trivia questions
- `GET /api/trivia/stats` - Question count
- `GET /api/movies` - All movies
- `GET /api/movies/random?limit=N` - Random movies
- `GET /api/athletes` - All athletes (optionally filter by ?archetype=X)
- `GET /api/athletes/random?limit=N` - Random athletes
- `POST /api/athletes/battle` - Calculate team battle scores
- `POST /api/games` - Save game session (with optional profileId)
- `GET /api/games?profileId=X` - Get game history (optionally filtered by profile)

#### Engagement Endpoints
- `POST /api/profiles` - Create or fetch existing profile by username
- `GET /api/profiles/:id` - Get profile by ID
- `GET /api/daily-challenge?profileId=X` - Get today's daily challenge (auto-creates if needed)
- `POST /api/daily-challenge/complete` - Complete daily challenge, update streak
- `GET /api/leaderboard?gameType=X&period=weekly|alltime&limit=N` - Get leaderboard
- `GET /api/achievements?profileId=X` - Get all achievements with earned status

#### Admin Endpoints
- `POST /api/admin/movies` - Create movie
- `DELETE /api/admin/movies/:id` - Delete movie
- `POST /api/admin/athletes` - Create athlete
- `DELETE /api/admin/athletes/:id` - Delete athlete

### Build Process
- **Backend Dev**: `npm run dev` - Express server on port 5000
- **Mobile Dev**: `npx expo start` - Expo dev server (scan QR with Expo Go)
- **Database**: `npm run db:push` - push schema changes to database
- **Testing**: `npx vitest run` - automated tests (scoring + API)

## External Dependencies

### Database
- **PostgreSQL** - Primary data store, connected via `DATABASE_URL`
- **Drizzle Kit** - Database migrations and schema management

### Mobile
- **Expo SDK 52** - React Native development framework
- **Expo Router** - File-based routing for React Native
- **@expo/vector-icons** - Icon library (Ionicons)
- **expo-linear-gradient** - Gradient backgrounds
- **expo-haptics** - Haptic feedback for game interactions
- **@react-native-async-storage/async-storage** - Local profile persistence
- **react-native-safe-area-context** - Safe area handling
- **react-native-screens** - Native screen containers
- **react-native-gesture-handler** - Gesture support
- **react-native-reanimated** - Native animations

### Backend
- **express** - Web server framework
- **drizzle-orm** - Type-safe ORM for PostgreSQL
- **zod** - Schema validation
