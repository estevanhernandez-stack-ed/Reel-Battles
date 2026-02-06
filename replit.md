# CineGame - Movie Trivia & Challenges

## Overview

CineGame is a native mobile app (React Native / Expo) for the Replit Mobile App Challenge hackathon. It offers three interactive game modes for film enthusiasts plus a comprehensive engagement system:

1. **Trivia Quiz** - Multiple-choice movie knowledge questions across categories and difficulty levels (38,505 questions)
2. **Movie Draft** - Draft movie characters by archetype, then team battle with weighted stats and synergy bonuses (see detailed docs below)
3. **Box Office Heads Up** - Guess which movie had the bigger opening weekend

### Movie Draft - Card Battle Mode (Detailed)

The Movie Draft is a strategic card-battle game where players draft a team of 5 iconic movie characters and battle against an AI opponent. It plays like a fantasy sports draft crossed with a card game.

#### Characters (Movie Athletes)
- 58 characters from famous sports movies, stored in the `movie_athletes` table
- Each character has: name, movie, year, sport, actor, archetype, bio, quote
- Each character has **8 Madden-style stats** (rated 0-99):
  - **Heart** (HRT) - Determination and willpower
  - **Clutch** (CLT) - Performance under pressure
  - **Teamwork** (TMW) - Ability to work with others
  - **Leadership** (LDR) - Ability to inspire and lead
  - **Athleticism** (ATH) - Physical ability
  - **Skill** (SKL) - Technical proficiency
  - **Intimidation** (INT) - Ability to intimidate opponents
  - **Charisma** (CHR) - Personal magnetism
- Each character also has an optional **Wildcard** ability (wildcardName, wildcardCategory, wildcardValue)

#### 7 Archetypes
Characters are classified into one of 7 archetypes, each with a distinct color:
| Archetype | Color | Description |
|-----------|-------|-------------|
| Captain | Blue/Indigo | Team leaders who rally the group |
| Natural | Green | Born athletes with raw talent |
| Underdog | Amber/Yellow | Unlikely heroes who defy expectations |
| Veteran | Purple | Experienced players with wisdom |
| Villain | Red | Antagonists with intimidating presence |
| Teammate | Cyan/Teal | Supportive players who elevate others |
| Wildcard | Pink/Fuchsia | Unpredictable game-changers |

#### Draft Phase
1. All 58 athletes are shuffled into a random pool
2. Each round presents athletes filtered by archetype (cycles through: Captain, Natural, Underdog, Veteran, Villain, Teammate, Wildcard)
3. Up to 6 athletes are shown per round
4. Player picks one character; the AI opponent randomly picks from the remaining available characters in that round
5. Both picks are removed from the pool
6. Draft continues for **5 rounds** until both teams have 5 characters
7. **Stats are hidden** during the draft phase - players must make decisions based on character name, movie, actor, sport, archetype, and bio only
8. Team size counter shows progress (e.g., "3/5")

#### Battle Phase (Server-Side Scoring)
After drafting, the battle is calculated server-side via `POST /api/athletes/battle`:

**Weighted Score Formula** (per character):
Each stat is multiplied by its weight, then summed, plus the wildcard bonus:
```
Score = (Heart × 1.3) + (Clutch × 1.2) + (Teamwork × 1.2) + (Leadership × 1.1)
      + (Athleticism × 1.0) + (Skill × 1.0) + (Intimidation × 0.8) + (Charisma × 0.7)
      + (Wildcard × 0.5)
```
Heart, Clutch, and Teamwork are the highest-weighted stats, rewarding characters with determination, pressure performance, and cooperation. Intimidation and Charisma are lowest-weighted. Each character's unique Wildcard ability adds a small but meaningful bonus (0.5x weight).

**Team Score** = Sum of all 5 character weighted scores + Synergy Bonuses

#### Synergy Bonuses
Teams earn bonus points for specific archetype combinations:

| Synergy | Requirement | Bonus | Description |
|---------|------------|-------|-------------|
| Captain's Command | Have a Captain | +50 pts | A Captain rallies the whole team |
| Mentor & Protege | Veteran + Underdog | +30 pts | A Veteran guides the Underdog to greatness |
| Natural Chemistry | Natural + Teammate | +25 pts | A Natural and Teammate create perfect synergy |
| Diverse Roster | 4+ unique archetypes | +40 pts | Versatility from varied team composition |

Multiple synergies can stack. Maximum possible synergy: +145 points (all four active).

#### Battle Results
The results screen shows three tabs:

**Overview Tab:**
- Victory/Defeat/Draw with final scores (base score + synergy breakdown)
- Head-to-head matchup record (W-L count)
- MVP for each team (highest individual scorer)
- Synergy bonus breakdown showing which bonuses were active/inactive for each team
- Battle Insights (server-generated, thematic):
  - **Nail-Biter** - When the closest matchup is within 30 pts
  - **Biggest Mismatch** - When the largest matchup gap exceeds 50 pts
  - **Work Ethic Advantage / Out-Worked** - When one team's Heart + Leadership dominates
  - **The Villain Fallacy** - When a team stacked Villains for Intimidation but suffered from low Teamwork and low stat weight
  - **Wildcard Impact** - When wildcard abilities created a significant scoring edge
  - **Better Chemistry / Synergy Gap** - When synergy bonuses differ between teams

**Matchups Tab:**
- 1v1 comparison of each player's character vs opponent's corresponding character
- Shows individual scores, winner indicator, and margin

**Stats Tab:**
- Team stat averages (average of each stat across all 5 characters)
- Side-by-side comparison of team strengths

#### Haptic Feedback (Mobile)
- Light impact on draft pick selection
- Success notification on victory
- Error notification on defeat

#### Share Results
Players can share their battle outcome including final score and team lineup via the native Share API.

#### Achievements
- **Draft Champion** - Win your first draft battle
- **Draft Dominator** - Win 3 draft battles

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
- `POST /api/admin/movies` - Create movie (accepts imdbId)
- `DELETE /api/admin/movies/:id` - Delete movie
- `POST /api/admin/omdb/enrich` - Fetch posters/metadata from OMDb API for all movies
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

### External APIs
- **OMDb API** - Movie posters and metadata (key stored in OMDB_API_KEY secret, used server-side only via HTTPS)
